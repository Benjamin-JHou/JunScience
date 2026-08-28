import { Artifact, Citation } from '../types/runtime.js';
import fs from 'node:fs';

export type VerificationVerdict = 'ADOPTED' | 'FLAGGED_WITH_WARNING' | 'REJECTED';

export interface VerificationDetail {
  rule: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface EvidenceVerificationResult {
  verdict: VerificationVerdict;
  confidenceScore: number; // 0.0 to 1.0
  details: VerificationDetail[];
  reasonSummary: string;
  suggestedCorrection?: string;
}

export class EvidenceVerifier {
  /**
   * Run scientific sanity, mathematical boundary, and artifact integrity checks
   * on any raw tool output before admitting it to the immutable EvidenceTracker.
   */
  public verify(
    toolName: string,
    category: string,
    query: string,
    rawOutput: any,
    artifacts?: Artifact[],
    citations?: Citation[]
  ): EvidenceVerificationResult {
    const details: VerificationDetail[] = [];
    let hasError = false;
    let hasWarning = false;

    const outputStr = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput || {});

    // 1. Check Computational Anomalies (NaN, Infinity, ZeroDivision)
    this.checkComputationalAnomalies(outputStr, details);

    // 2. Check Mathematical & Physics Boundaries (p-value, IC50, pLDDT, HU)
    this.checkNumericalBoundaries(outputStr, details);

    // 3. Check Biological Sequence & Biochemical Boundaries
    if (category === 'databases' || toolName.includes('uniprot') || toolName.includes('chembl')) {
      this.checkBiochemicalBoundaries(rawOutput, outputStr, details);
    }

    // 4. Check Clinical / Literature Identifiers (NCT, PMID)
    if (toolName.includes('clinical') || toolName.includes('trials')) {
      this.checkClinicalTrialIdentifiers(rawOutput, details);
    }
    if (citations && citations.length > 0) {
      this.checkCitationIdentifiers(citations, details);
    }

    // 5. Check Artifact File System Integrity
    if (artifacts && artifacts.length > 0) {
      this.checkArtifactIntegrity(artifacts, details);
    }

    // Determine overall verdict & severity
    hasError = details.some((d) => !d.passed && d.severity === 'error');
    hasWarning = details.some((d) => !d.passed && d.severity === 'warning');

    let verdict: VerificationVerdict = 'ADOPTED';
    let reasonSummary = 'All scientific bounds and integrity checks passed cleanly.';
    let suggestedCorrection: string | undefined = undefined;

    if (hasError) {
      verdict = 'REJECTED';
      const failed = details.filter((d) => !d.passed && d.severity === 'error');
      reasonSummary = `Rejected due to ${failed.length} fatal anomaly: ${failed.map((f) => f.message).join('; ')}`;
      suggestedCorrection = 'Please re-check the calculation script, adjust parameters, or verify the underlying data source.';
    } else if (hasWarning) {
      verdict = 'FLAGGED_WITH_WARNING';
      const warnings = details.filter((d) => !d.passed && d.severity === 'warning');
      reasonSummary = `Flagged with ${warnings.length} warning(s): ${warnings.map((w) => w.message).join('; ')}`;
      suggestedCorrection = 'Verify whether units (e.g. nM vs uM) or domain parameters were correctly normalized.';
    }

    const passedCount = details.filter((d) => d.passed).length;
    const totalCount = Math.max(details.length, 1);
    const confidenceScore = hasError ? 0.0 : hasWarning ? 0.75 : Math.round((passedCount / totalCount) * 100) / 100;

    return {
      verdict,
      confidenceScore,
      details,
      reasonSummary,
      suggestedCorrection,
    };
  }

  private checkComputationalAnomalies(outputStr: string, details: VerificationDetail[]): void {
    // Check for NaN
    const hasNaN = /\b(NaN|nan)\b/.test(outputStr);
    if (hasNaN) {
      details.push({
        rule: 'anomaly.no_nan',
        passed: false,
        severity: 'error',
        message: 'Output contains NaN (Not a Number) value, indicating numerical calculation failure.',
      });
    } else {
      details.push({
        rule: 'anomaly.no_nan',
        passed: true,
        severity: 'info',
        message: 'No NaN anomalies detected.',
      });
    }

    // Check for Infinity
    const hasInf = /\b(-?Infinity|-?inf)\b/.test(outputStr);
    if (hasInf) {
      details.push({
        rule: 'anomaly.no_infinity',
        passed: false,
        severity: 'error',
        message: 'Output contains Infinity / Division by Zero overflow value.',
      });
    } else {
      details.push({
        rule: 'anomaly.no_infinity',
        passed: true,
        severity: 'info',
        message: 'No Infinity overflows detected.',
      });
    }

    // Check for explicit error strings inside output
    if (/ZeroDivisionError|FloatingPointError|OverflowError/i.test(outputStr)) {
      details.push({
        rule: 'anomaly.python_exceptions',
        passed: false,
        severity: 'error',
        message: 'Output captured fatal Python runtime mathematical exception.',
      });
    }
  }

  private checkNumericalBoundaries(outputStr: string, details: VerificationDetail[]): void {
    // 1. p-value check: must be strictly in [0.0, 1.0]
    const pValueMatches = outputStr.matchAll(/(?:p[-_]value|p\s*[=:])\s*([-\d\.]+)/gi);
    for (const match of pValueMatches) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        if (val < 0.0 || val > 1.0) {
          details.push({
            rule: 'bounds.p_value',
            passed: false,
            severity: 'error',
            message: `Invalid p-value ${val}: p-values must strictly reside within [0.0, 1.0].`,
          });
        } else {
          details.push({
            rule: 'bounds.p_value',
            passed: true,
            severity: 'info',
            message: `p-value ${val} is mathematically valid within [0.0, 1.0].`,
          });
        }
      }
    }

    // 2. IC50 / Ki / Kd / EC50 check: must be positive (> 0)
    const ic50Matches = outputStr.matchAll(/(?:IC50|Ki|Kd|EC50)\s*[=:]\s*([-\d\.]+)\s*(nM|uM|mM|M)?/gi);
    for (const match of ic50Matches) {
      const val = parseFloat(match[1]);
      const unit = match[2] || '';
      if (!isNaN(val)) {
        if (val <= 0.0) {
          details.push({
            rule: 'bounds.binding_affinity',
            passed: false,
            severity: 'error',
            message: `Invalid binding constant ${val} ${unit}: IC50/Ki values must be strictly positive (> 0).`,
          });
        } else if (val < 1e-15 || (unit === 'M' && val > 100)) {
          details.push({
            rule: 'bounds.binding_affinity_scale',
            passed: false,
            severity: 'warning',
            message: `Binding constant ${val} ${unit} has extreme scale; check for unit confusion (nM vs uM).`,
          });
        } else {
          details.push({
            rule: 'bounds.binding_affinity',
            passed: true,
            severity: 'info',
            message: `Binding affinity ${val} ${unit} is within reasonable pharmacological range.`,
          });
        }
      }
    }

    // 3. AlphaFold pLDDT confidence check: [0.0, 100.0]
    const plddtMatches = outputStr.matchAll(/(?:pLDDT|confidenceScore)\s*[=:]\s*([-\d\.]+)/gi);
    for (const match of plddtMatches) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        if (val < 0.0 || val > 100.0) {
          details.push({
            rule: 'bounds.plddt_score',
            passed: false,
            severity: 'error',
            message: `Invalid pLDDT score ${val}: AlphaFold confidence must be within [0, 100].`,
          });
        }
      }
    }

    // 4. CT Radiomics Hounsfield Units (HU) check: [-1024, 3071]
    const huMatches = outputStr.matchAll(/(?:MeanHU|meanHounsfield|Hounsfield)\s*[=:]\s*([-\d\.]+)/gi);
    for (const match of huMatches) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        if (val < -1024.0 || val > 3071.0) {
          details.push({
            rule: 'bounds.hounsfield_units',
            passed: false,
            severity: 'warning',
            message: `Hounsfield Unit ${val} HU falls outside standard clinical CT calibration bounds [-1024, +3071].`,
          });
        } else {
          details.push({
            rule: 'bounds.hounsfield_units',
            passed: true,
            severity: 'info',
            message: `Hounsfield Unit ${val} HU is within anatomical CT density limits.`,
          });
        }
      }
    }
  }

  private checkBiochemicalBoundaries(rawOutput: any, outputStr: string, details: VerificationDetail[]): void {
    // Protein sequence length sanity
    if (rawOutput?.sequenceLength || rawOutput?.sequence) {
      const len = rawOutput.sequenceLength || rawOutput.sequence?.length;
      if (typeof len === 'number') {
        if (len < 5 || len > 40000) {
          details.push({
            rule: 'bio.sequence_length',
            passed: false,
            severity: 'warning',
            message: `Protein sequence length (${len} aa) is atypical for single polypeptides.`,
          });
        } else {
          details.push({
            rule: 'bio.sequence_length',
            passed: true,
            severity: 'info',
            message: `Protein sequence length (${len} aa) verified within biological limits.`,
          });
        }
      }
    }

    // Small molecule Molecular Weight sanity (50 ~ 2500 Da for drug-like compounds)
    if (rawOutput?.molecularWeight || rawOutput?.mw) {
      const mwStr = String(rawOutput.molecularWeight || rawOutput.mw).replace(/[^\d\.]/g, '');
      const mw = parseFloat(mwStr);
      if (!isNaN(mw)) {
        if (mw <= 0 || mw > 100000) {
          details.push({
            rule: 'chem.molecular_weight',
            passed: false,
            severity: 'warning',
            message: `Molecular weight (${mw} Da) is unusual for drug compounds.`,
          });
        }
      }
    }
  }

  private checkClinicalTrialIdentifiers(rawOutput: any, details: VerificationDetail[]): void {
    const trials = rawOutput?.trials || (rawOutput?.nctId ? [rawOutput] : []);
    for (const t of trials) {
      const nct = t.nctId || t.id;
      if (nct) {
        if (/^NCT\d{8}$/i.test(nct)) {
          details.push({
            rule: 'clinical.nct_format',
            passed: true,
            severity: 'info',
            message: `Clinical trial identifier ${nct} follows valid NIH ClinicalTrials.gov 8-digit format.`,
          });
        } else {
          details.push({
            rule: 'clinical.nct_format',
            passed: false,
            severity: 'error',
            message: `Malformed ClinicalTrials.gov ID "${nct}". Expected format: NCT followed by 8 digits.`,
          });
        }
      }
    }
  }

  private checkCitationIdentifiers(citations: Citation[], details: VerificationDetail[]): void {
    for (const cit of citations) {
      if (cit.pmid) {
        if (/^\d{1,9}$/.test(cit.pmid)) {
          details.push({
            rule: 'literature.pmid_format',
            passed: true,
            severity: 'info',
            message: `PubMed PMID:${cit.pmid} conforms to standard NCBI indexing format.`,
          });
        } else {
          details.push({
            rule: 'literature.pmid_format',
            passed: false,
            severity: 'error',
            message: `Malformed PubMed PMID "${cit.pmid}". Expected positive integer.`,
          });
        }
      }
    }
  }

  private checkArtifactIntegrity(artifacts: Artifact[], details: VerificationDetail[]): void {
    for (const art of artifacts) {
      const filePath = art.metadata?.Path;
      if (filePath && typeof filePath === 'string') {
        try {
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 0) {
              details.push({
                rule: 'artifact.file_integrity',
                passed: true,
                severity: 'info',
                message: `Artifact "${art.title}" successfully verified on disk (${stats.size} bytes).`,
              });
            } else {
              details.push({
                rule: 'artifact.file_integrity',
                passed: false,
                severity: 'error',
                message: `Artifact file "${art.title}" is empty (0 bytes) on disk.`,
              });
            }
          } else {
            details.push({
              rule: 'artifact.file_existence',
              passed: false,
              severity: 'warning',
              message: `Artifact file path "${filePath}" does not exist in local workspace.`,
            });
          }
        } catch (err: any) {
          details.push({
            rule: 'artifact.stat_error',
            passed: false,
            severity: 'warning',
            message: `Failed to inspect artifact "${art.title}": ${err.message}`,
          });
        }
      }
    }
  }
}

export const globalEvidenceVerifier = new EvidenceVerifier();
