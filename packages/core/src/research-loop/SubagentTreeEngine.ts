import { ToolRegistry, globalToolRegistry } from '../tools/ToolRegistry.js';
import { EvidenceTracker } from './EvidenceTracker.js';
import { EvidenceVerifier, globalEvidenceVerifier } from './EvidenceVerifier.js';
import { HypothesisTree, HypothesisNode } from './HypothesisTree.js';
import { SessionManager, globalSessionManager } from '../core/SessionManager.js';
import { EventBus, globalEventBus } from '../core/EventBus.js';
import { ToolContext } from '../types/tools.js';

export interface SubagentBranchResult {
  hypothesisId: string;
  targetEntity: string;
  success: boolean;
  findings: string;
  metrics: Record<string, string | number>;
  evidenceIds: string[];
  logs: string[];
}

export class SubagentTreeEngine {
  private toolRegistry: ToolRegistry;
  private sessionManager: SessionManager;
  private eventBus: EventBus;
  private evidenceVerifier: EvidenceVerifier;

  constructor(
    toolRegistry: ToolRegistry = globalToolRegistry,
    sessionManager: SessionManager = globalSessionManager,
    eventBus: EventBus = globalEventBus,
    evidenceVerifier: EvidenceVerifier = globalEvidenceVerifier
  ) {
    this.toolRegistry = toolRegistry;
    this.sessionManager = sessionManager;
    this.eventBus = eventBus;
    this.evidenceVerifier = evidenceVerifier;
  }

  /**
   * Concurrently explore multiple hypothesis branches using dedicated child subagents.
   */
  public async exploreHypothesesParallel(
    parentSessionId: string,
    hypotheses: HypothesisNode[],
    parentEvidenceTracker: EvidenceTracker,
    maxConcurrency: number = 3,
    onBranchProgress?: (branchName: string, log: string) => void
  ): Promise<{
    hypothesisTree: HypothesisTree;
    branchResults: SubagentBranchResult[];
    comparisonMatrix: string;
  }> {
    const tree = new HypothesisTree(hypotheses);
    const branchResults: SubagentBranchResult[] = [];

    // Notify event bus of Subagent Tree Initialization
    this.eventBus.emit({
      type: 'agent.thinking',
      sessionId: parentSessionId,
      timestamp: new Date().toISOString(),
      payload: {
        thought: `[Subagent Tree Fork] Initializing ${hypotheses.length} parallel hypothesis branches: ${hypotheses.map((h) => h.targetEntity).join(', ')}...`,
        phase: 'Parallel Hypothesis Exploration',
      },
    });

    // Execute in batches up to maxConcurrency
    for (let i = 0; i < hypotheses.length; i += maxConcurrency) {
      const batch = hypotheses.slice(i, i + maxConcurrency);
      const batchPromises = batch.map((hyp) =>
        this.runSingleBranch(parentSessionId, hyp, parentEvidenceTracker, onBranchProgress)
      );

      const batchResults = await Promise.all(batchPromises);
      for (const res of batchResults) {
        branchResults.push(res);
        // Update tree node
        tree.updateStatus(
          res.hypothesisId,
          res.success ? 'supported' : 'inconclusive',
          res.success ? 0.92 : 0.45,
          res.findings,
          res.evidenceIds,
          res.metrics
        );
      }
    }

    const comparisonMatrix = tree.generateComparisonMatrix();

    return {
      hypothesisTree: tree,
      branchResults,
      comparisonMatrix,
    };
  }

  private async runSingleBranch(
    parentSessionId: string,
    hypothesis: HypothesisNode,
    parentEvidenceTracker: EvidenceTracker,
    onProgress?: (branchName: string, log: string) => void
  ): Promise<SubagentBranchResult> {
    const branchName = `Branch-${hypothesis.id} (${hypothesis.targetEntity})`;
    const subSessionId = `${parentSessionId}-${hypothesis.id}`;
    const branchLogs: string[] = [];
    const localEvidenceIds: string[] = [];
    const metrics: Record<string, string | number> = {};

    onProgress?.(branchName, `Starting parallel investigation for: "${hypothesis.statement}"`);

    const dummyContext: ToolContext = {
      sessionId: subSessionId,
      agentId: 'research',
      turnIndex: 0,
      reportProgress: (log: string) => {
        branchLogs.push(log);
        onProgress?.(branchName, log);
      },
    };

    // 1. Biological Sequence / Target Query
    try {
      if (this.toolRegistry.get('uniprot_lookup')) {
        const uniRes = await this.toolRegistry.execute(
          'uniprot_lookup',
          { accessionOrGene: hypothesis.targetEntity },
          subSessionId,
          'research',
          0
        );
        if (uniRes.success && uniRes.output) {
          metrics['SequenceLength'] = `${uniRes.output.sequenceLength || 'N/A'} aa`;
          metrics['UniProtID'] = uniRes.output.primaryAccession || 'N/A';
          const ev = parentEvidenceTracker.record(
            'uniprot_lookup',
            'databases',
            `[${hypothesis.targetEntity}] UniProt query`,
            `[Branch: ${hypothesis.targetEntity}] Resolved ${uniRes.output.geneName || hypothesis.targetEntity} (${uniRes.output.primaryAccession}), Length: ${uniRes.output.sequenceLength} aa`,
            uniRes.output
          );
          localEvidenceIds.push(ev.id);
        }
      }
    } catch {
      // Non-fatal
    }

    // 2. ChEMBL Bioactivity & IC50 Query
    try {
      if (this.toolRegistry.get('chembl_lookup')) {
        const chemblRes = await this.toolRegistry.execute(
          'chembl_lookup',
          { targetOrCompound: hypothesis.targetEntity },
          subSessionId,
          'research',
          0
        );
        if (chemblRes.success && chemblRes.output) {
          const actCount = chemblRes.output.activities?.length || 0;
          metrics['BioactivitiesCount'] = actCount;
          if (chemblRes.output.molecule?.maxPhase) {
            metrics['MaxPhase'] = `Phase ${chemblRes.output.molecule.maxPhase}`;
          }
          const ev = parentEvidenceTracker.record(
            'chembl_lookup',
            'databases',
            `[${hypothesis.targetEntity}] ChEMBL bioactivities`,
            `[Branch: ${hypothesis.targetEntity}] Found ${actCount} bioactivity records and ${chemblRes.output.target?.name || 'target profile'}`,
            chemblRes.output
          );
          localEvidenceIds.push(ev.id);
        }
      }
    } catch {
      // Non-fatal
    }

    // 3. Clinical Trials / Literature Support
    try {
      if (this.toolRegistry.get('clinical_trials_lookup')) {
        const ctRes = await this.toolRegistry.execute(
          'clinical_trials_lookup',
          { interventionOrDrug: hypothesis.targetEntity, limit: 1 },
          subSessionId,
          'research',
          0
        );
        if (ctRes.success && ctRes.output?.trials?.length > 0) {
          const topTrial = ctRes.output.trials[0];
          metrics['ActiveClinicalTrial'] = topTrial.nctId;
          const ev = parentEvidenceTracker.record(
            'clinical_trials_lookup',
            'medical',
            `[${hypothesis.targetEntity}] Clinical trials`,
            `[Branch: ${hypothesis.targetEntity}] Identified active trial [${topTrial.nctId}] ${topTrial.title}`,
            topTrial
          );
          localEvidenceIds.push(ev.id);
        }
      }
    } catch {
      // Non-fatal
    }

    const findingsSummary = `Subagent confirmed ${localEvidenceIds.length} empirical evidence anchors for hypothesis "${hypothesis.title}".`;
    onProgress?.(branchName, `Completed: ${findingsSummary}`);

    return {
      hypothesisId: hypothesis.id,
      targetEntity: hypothesis.targetEntity,
      success: localEvidenceIds.length > 0,
      findings: findingsSummary,
      metrics,
      evidenceIds: localEvidenceIds,
      logs: branchLogs,
    };
  }
}

export const globalSubagentTreeEngine = new SubagentTreeEngine();
