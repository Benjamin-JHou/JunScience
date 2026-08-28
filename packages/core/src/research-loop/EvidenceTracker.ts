import { Citation, Artifact } from '../types/runtime.js';

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
    artifacts?: Artifact[]
  ): EvidenceRecord {
    this.counter++;
    const id = `EV-${this.counter}`;
    const evidence: EvidenceRecord = {
      id,
      index: this.counter,
      toolName,
      category,
      query,
      timestamp: new Date().toISOString(),
      summary,
      rawOutput,
      citations,
      artifacts,
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
      out += `\n- **[Evidence ID: ${ev.id}]** Source Tool: \`${ev.toolName}\` (Query: "${ev.query}")\n`;
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

    let table = `\n\n### 🔬 Evidence Provenance & Traceability Index\n\n`;
    table += `| Evidence ID | Tool / Source | Query / Target | Key Empirical Findings | Timestamp |\n`;
    table += `| :--- | :--- | :--- | :--- | :--- |\n`;

    for (const ev of this.records.values()) {
      const cleanSummary = ev.summary.replace(/\|/g, '-').slice(0, 80);
      const cleanQuery = ev.query.replace(/\|/g, '-').slice(0, 30);
      const time = new Date(ev.timestamp).toLocaleTimeString();
      table += `| **${ev.id}** | \`${ev.toolName}\` | ${cleanQuery} | ${cleanSummary}... | ${time} |\n`;
    }

    return table;
  }
}
