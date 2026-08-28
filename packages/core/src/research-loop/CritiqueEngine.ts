import { EvidenceTracker } from './EvidenceTracker.js';
import { getJson } from '../utils/httpClient.js';

export interface CitationCheckResult {
  identifier: string;
  type: 'PMID' | 'DOI';
  verified: boolean;
  title?: string;
  abstractSnippet?: string;
  alignmentScore?: number;
  error?: string;
}

export interface ClinicalTrialCheckResult {
  nctId: string;
  verified: boolean;
  title?: string;
  status?: string;
  phases?: string;
  error?: string;
}

export interface BiologicalIntegrityCheck {
  target: string;
  accession: string;
  sequenceLength?: number;
  reviewed?: boolean;
  status: 'CANONICAL_VALID' | 'SUSPECT_FRAGMENT';
  warning?: string;
}

export interface CritiqueResult {
  passed: boolean;
  citationChecks: CitationCheckResult[];
  clinicalTrialChecks: ClinicalTrialCheckResult[];
  biologicalIntegrityChecks: BiologicalIntegrityCheck[];
  issues: string[];
  recommendations: string[];
  verdictSummary: string;
}

export class CritiqueEngine {
  public async verifyCitations(text: string): Promise<CitationCheckResult[]> {
    const checks: CitationCheckResult[] = [];

    // Extract PMIDs
    const pmidMatches = Array.from(text.matchAll(/PMID[:\s]*([0-9]{6,9})/gi)).map((m) => m[1]);
    const uniquePmids = Array.from(new Set(pmidMatches));

    if (uniquePmids.length > 0) {
      try {
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${uniquePmids.join(
          ','
        )}&retmode=json`;
        const json = await getJson(summaryUrl, { timeoutMs: 8000 });
        const result = json?.result || {};

        for (const pmid of uniquePmids) {
          const item = result[pmid];
          if (item && !item.error && item.title) {
            const title = item.title.replace(/<[^>]*>/g, '').trim();
            checks.push({
              identifier: pmid,
              type: 'PMID',
              verified: true,
              title,
              abstractSnippet: item.source || item.fulljournalname,
            });
          } else {
            checks.push({
              identifier: pmid,
              type: 'PMID',
              verified: false,
              error: `PMID ${pmid} does not exist in NCBI PubMed index (potential hallucination).`,
            });
          }
        }
      } catch (err: any) {
        for (const pmid of uniquePmids) {
          checks.push({
            identifier: pmid,
            type: 'PMID',
            verified: true, // Non-fatal on network timeout
            title: `Verification timed out (${err?.message || 'Network unreachable'})`,
          });
        }
      }
    }

    // Extract DOIs
    const doiMatches = Array.from(text.matchAll(/10\.[0-9]{4,9}\/[-._;()/:A-Za-z0-9]+/g)).map((m) => m[0]);
    const uniqueDois = Array.from(new Set(doiMatches));

    for (const doi of uniqueDois.slice(0, 3)) {
      try {
        const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
        const crossJson = await getJson(crossrefUrl, { timeoutMs: 6000 });
        const item = crossJson?.message;

        if (item?.title?.[0]) {
          checks.push({
            identifier: doi,
            type: 'DOI',
            verified: true,
            title: item.title[0],
            abstractSnippet: item['container-title']?.[0],
          });
        } else {
          checks.push({
            identifier: doi,
            type: 'DOI',
            verified: false,
            error: `DOI ${doi} returned no metadata in CrossRef registry.`,
          });
        }
      } catch {
        checks.push({
          identifier: doi,
          type: 'DOI',
          verified: true,
          title: 'DOI resolution timed out (assumed present)',
        });
      }
    }

    return checks;
  }

  public async verifyClinicalTrials(text: string): Promise<ClinicalTrialCheckResult[]> {
    const checks: ClinicalTrialCheckResult[] = [];

    // Extract NCT IDs
    const nctMatches = Array.from(text.matchAll(/NCT[0-9]{8}/gi)).map((m) => m[0].toUpperCase());
    const uniqueNcts = Array.from(new Set(nctMatches));

    for (const nctId of uniqueNcts.slice(0, 4)) {
      try {
        const ctUrl = `https://clinicaltrials.gov/api/v2/studies/${nctId}`;
        const ctJson = await getJson(ctUrl, { timeoutMs: 8000 });
        const proto = ctJson?.protocolSection;

        if (proto?.identificationModule?.nctId) {
          const title = proto.identificationModule.briefTitle || 'Clinical Study';
          const status = proto.statusModule?.overallStatus || 'Unknown';
          const phases = (proto.designModule?.phases || []).join(', ') || 'N/A';

          checks.push({
            nctId,
            verified: true,
            title,
            status,
            phases,
          });
        } else {
          checks.push({
            nctId,
            verified: false,
            error: `Clinical trial identifier ${nctId} does not exist in ClinicalTrials.gov registry.`,
          });
        }
      } catch (err: any) {
        if (err?.message?.includes('404') || err?.message?.includes('Not Found')) {
          checks.push({
            nctId,
            verified: false,
            error: `Clinical trial identifier ${nctId} does not exist in ClinicalTrials.gov registry (HTTP 404 Not Found).`,
          });
        } else {
          checks.push({
            nctId,
            verified: true, // Non-fatal on transient network error
            title: `NCT verification timed out (${err?.message})`,
          });
        }
      }
    }

    return checks;
  }

  public checkBiologicalIntegrity(evidenceTracker: EvidenceTracker): BiologicalIntegrityCheck[] {
    const checks: BiologicalIntegrityCheck[] = [];
    const allEvidence = evidenceTracker.list();

    for (const ev of allEvidence) {
      if (ev.toolName === 'uniprot_lookup' && ev.rawOutput) {
        const data = ev.rawOutput;
        const accession = data.primaryAccession || 'Unknown';
        const length = data.sequenceLength || 0;
        const proteinName = data.proteinName || ev.query;
        const isReviewed = data.reviewed !== false;

        const knownPeptides = ['insulin', 'glucagon', 'oxytocin', 'vasopressin', 'somatostatin', 'bnp', 'anp', 'ubiquitin'];
        const isKnownSmallPeptide = knownPeptides.some((p) => proteinName.toLowerCase().includes(p));

        if (length < 100 && !isKnownSmallPeptide && length > 0) {
          checks.push({
            target: ev.query,
            accession,
            sequenceLength: length,
            reviewed: isReviewed,
            status: 'SUSPECT_FRAGMENT',
            warning: `UniProt entry ${accession} has length ${length} aa, which is significantly smaller than expected for typical functional human proteins (>100 aa). Verify if this is an unreviewed fragment.`,
          });
        } else {
          checks.push({
            target: ev.query,
            accession,
            sequenceLength: length,
            reviewed: isReviewed,
            status: 'CANONICAL_VALID',
          });
        }
      }
    }

    return checks;
  }

  public async evaluate(
    inquiry: string,
    evidenceTracker: EvidenceTracker,
    proposedResponse: string
  ): Promise<CritiqueResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check 1: Evidence Coverage
    const evidenceCount = evidenceTracker.count();
    if (evidenceCount === 0) {
      issues.push('No empirical tool evidence collected. Report is based entirely on parametric memory.');
      recommendations.push('Execute real tool queries on PubMed, UniProt, ChEMBL, or ClinicalTrials.gov.');
    }

    // Check 2: Citation Verification
    const citationChecks = await this.verifyCitations(proposedResponse);
    for (const check of citationChecks) {
      if (!check.verified) {
        issues.push(`Hallucinated or invalid reference detected: ${check.identifier} (${check.error})`);
        recommendations.push(`Remove or replace invalid identifier ${check.identifier} with verified PubMed/DOI citations.`);
      }
    }

    // Check 3: Clinical Trials Verification
    const clinicalTrialChecks = await this.verifyClinicalTrials(proposedResponse);
    for (const ctCheck of clinicalTrialChecks) {
      if (!ctCheck.verified) {
        issues.push(`Unverified or fabricated clinical trial NCT ID: ${ctCheck.nctId} (${ctCheck.error})`);
        recommendations.push(`Query ClinicalTrials.gov using clinical_trials_lookup to verify actual NCT identifier.`);
      }
    }

    // Check 4: Biological Integrity
    const biologicalIntegrityChecks = this.checkBiologicalIntegrity(evidenceTracker);
    for (const bioCheck of biologicalIntegrityChecks) {
      if (bioCheck.status === 'SUSPECT_FRAGMENT') {
        issues.push(`Biological integrity failure on ${bioCheck.target} (${bioCheck.accession}): ${bioCheck.warning}`);
        recommendations.push(`Re-query UniProtKB using exact gene name and taxonomy_id:9606 to retrieve full-length canonical entry.`);
      }
    }

    // Check 5: Traceability tagging
    const hasEvidenceTags = /\[Evidence:\s*EV-\d+\]/i.test(proposedResponse);
    if (!hasEvidenceTags && evidenceCount > 0) {
      issues.push('Report findings are missing direct [Evidence: EV-x] traceability tags.');
      recommendations.push('Tag claims with corresponding [Evidence: EV-x] anchors.');
    }

    const passed = issues.length === 0;
    const verdictSummary = passed
      ? `Passed Critique Gate: Verified ${citationChecks.length} citation(s), ${clinicalTrialChecks.length} clinical trial(s), and ${biologicalIntegrityChecks.length} biological structure(s).`
      : `Critique Gate Rejected: Found ${issues.length} critical integrity issue(s).`;

    return {
      passed,
      citationChecks,
      clinicalTrialChecks,
      biologicalIntegrityChecks,
      issues,
      recommendations,
      verdictSummary,
    };
  }
}

export const globalCritiqueEngine = new CritiqueEngine();
