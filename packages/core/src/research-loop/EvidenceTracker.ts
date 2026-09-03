import { Citation, Artifact } from '../types/runtime.js';
import { EvidenceVerificationResult, globalEvidenceVerifier } from './EvidenceVerifier.js';

export interface EvidenceRecord {
  id: string; // e.g. 'EV-1', 'EV-2'
  index: number;
  toolName: string;
  category: string;
  query: string;
  timestamp: string;
  summary: string;
  citations?: Citation[];
  artifacts?: Artifact[];
  rawOutput: any;
  verificationStatus?: 'verified' | 'flagged' | 'rejected';
  verificationResult?: EvidenceVerificationResult;
}

export class EvidenceTracker {
  private records: Map<string, EvidenceRecord> = new Map();
  private counter: number = 0;

  public record(
    toolName: string,
    category: string,
    query: string,
    summary: string,
    rawOutput: any,
    citations?: Citation[],
    artifacts?: Artifact[],
    precomputedVerification?: EvidenceVerificationResult
  ): EvidenceRecord {
    // Execute verification gate
    const verification =
      precomputedVerification ||
      globalEvidenceVerifier.verify(toolName, category, query, rawOutput, artifacts, citations);

    if (verification.verdict === 'REJECTED') {
      throw new Error(`Rejected evidence cannot be recorded: ${verification.reasonSummary}`);
    }

    this.counter++;
    const id = `EV-${this.counter}`;

    const verificationStatus = verification.verdict === 'ADOPTED' ? 'verified' : 'flagged';

    let finalSummary = summary;
    if (verificationStatus === 'flagged') {
      finalSummary = `[Flagged: ${verification.reasonSummary}] ${summary}`;
    }

    const evidence: EvidenceRecord = {
      id,
      index: this.counter,
      toolName,
      category,
      query,
      timestamp: new Date().toISOString(),
      summary: finalSummary,
      rawOutput,
      citations,
      artifacts,
      verificationStatus,
      verificationResult: verification,
    };

    this.records.set(id, evidence);
    return evidence;
  }

  public get(id: string): EvidenceRecord | undefined {
    return this.records.get(id);
  }

  public list(): EvidenceRecord[] {
    return Array.from(this.records.values());
  }

  public count(): number {
    return this.records.size;
  }

  public clear(): void {
    this.records.clear();
    this.counter = 0;
  }

  public formatEvidenceContext(): string {
    if (this.records.size === 0) {
      return 'No evidence records collected yet.';
    }

    let out = '### Collected Empirical Evidence Log:\n';
    for (const ev of this.records.values()) {
      const vBadge = ev.verificationStatus === 'flagged' ? ' ⚠️ [Verification Warning]' : ' ✔ [Verified]';
      out += `\n- **[Evidence ID: ${ev.id}]**${vBadge} Source Tool: \`${ev.toolName}\` (Query: "${ev.query}")\n`;
      out += `  Summary: ${ev.summary}\n`;
      if (ev.citations && ev.citations.length > 0) {
        out += `  Primary Citations: ${ev.citations
          .map((c) => `[PMID:${c.pmid || 'N/A'}] ${c.title} (${c.journal}, ${c.year})`)
          .join('; ')}\n`;
      }
    }
    return out;
  }

  public formatTraceabilityTable(): string {
    if (this.records.size === 0) {
      return '';
    }

    let table = `\n\n### 🔬 Evidence Provenance & Traceability Index (Verified Anchors)\n\n`;
    table += `| Evidence ID | Tool / Source | Verification | Query / Target | Key Empirical Findings | Timestamp |\n`;
    table += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const ev of this.records.values()) {
      const vBadge = ev.verificationStatus === 'flagged' ? '⚠️ Flagged' : '✔ Verified';
      const cleanSummary = ev.summary.replace(/\|/g, '-').slice(0, 75);
      const cleanQuery = ev.query.replace(/\|/g, '-').slice(0, 25);
      const time = new Date(ev.timestamp).toLocaleTimeString();
      table += `| **${ev.id}** | \`${ev.toolName}\` | ${vBadge} | ${cleanQuery} | ${cleanSummary}... | ${time} |\n`;
    }

    return table;
  }
}

export const globalEvidenceTracker = new EvidenceTracker();
