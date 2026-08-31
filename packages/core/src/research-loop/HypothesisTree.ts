import { EvidenceRecord } from './EvidenceTracker.js';

export type HypothesisStatus = 'pending' | 'exploring' | 'supported' | 'refuted' | 'inconclusive' | 'error';

export interface HypothesisNode {
  id: string; // e.g. 'hyp-1', 'hyp-2'
  title: string;
  statement: string;
  targetEntity: string; // e.g. 'TYK2 (JH2 Allosteric)', 'JAK1', 'JAK2'
  status: HypothesisStatus;
  confidenceScore: number; // 0.0 to 1.0
  evidenceIds: string[];
  findingsSummary?: string;
  metrics?: Record<string, string | number>;
  childSubagentSessionId?: string;
}

export interface HypothesisComparisonRow {
  target: string;
  hypothesis: string;
  status: HypothesisStatus;
  keyMetric: string;
  evidenceAnchors: string;
  verdictSummary: string;
}

export class HypothesisTree {
  private nodes: Map<string, HypothesisNode> = new Map();

  constructor(initialHypotheses?: HypothesisNode[]) {
    if (initialHypotheses) {
      for (const h of initialHypotheses) {
        this.addHypothesis(h);
      }
    }
  }

  public addHypothesis(node: HypothesisNode): void {
    this.nodes.set(node.id, node);
  }

  public getHypothesis(id: string): HypothesisNode | undefined {
    return this.nodes.get(id);
  }

  public list(): HypothesisNode[] {
    return Array.from(this.nodes.values());
  }

  public updateStatus(
    id: string,
    status: HypothesisStatus,
    confidenceScore: number,
    findingsSummary: string,
    evidenceIds: string[],
    metrics?: Record<string, string | number>
  ): void {
    const node = this.nodes.get(id);
    if (node) {
      node.status = status;
      node.confidenceScore = confidenceScore;
      node.findingsSummary = findingsSummary;
      node.evidenceIds = [...new Set([...node.evidenceIds, ...evidenceIds])];
      if (metrics) {
        node.metrics = { ...node.metrics, ...metrics };
      }
    }
  }

  public generateComparisonMatrix(): string {
    if (this.nodes.size === 0) {
      return '';
    }

    let table = `\n\n### 🧬 Multi-Hypothesis Comparative Evaluation Matrix (Subagent Tree)\n\n`;
    table += `| Hypothesis ID | Target / Mechanism | Status | Confidence | Key Biological Metrics | Supported Evidence |\n`;
    table += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const node of this.nodes.values()) {
      const statusIcon =
        node.status === 'supported'
          ? '🟢 Supported'
          : node.status === 'refuted'
          ? '🔴 Refuted'
          : node.status === 'inconclusive'
          ? '🟡 Inconclusive'
          : node.status === 'error'
          ? '⚠️ Error (Tool/Network Failure)'
          : '⏳ Exploring';

      const metricsStr = node.metrics
        ? Object.entries(node.metrics)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : 'N/A';

      const evStr = node.evidenceIds.length > 0 ? node.evidenceIds.join(', ') : 'Pending';
      table += `| **${node.id}** | **${node.targetEntity}**<br>_${node.title}_ | ${statusIcon} | ${(node.confidenceScore * 100).toFixed(0)}% | ${metricsStr} | ${evStr} |\n`;
    }

    return table;
  }
}
