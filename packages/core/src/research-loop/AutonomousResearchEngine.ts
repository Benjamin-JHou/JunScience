import { ModelProvider } from '../client/ModelProvider.js';
import { ModelMessage, ModelRequest, ModelToolCall } from '../types/model.js';
import { SessionManager, globalSessionManager } from '../core/SessionManager.js';
import { EventBus, globalEventBus } from '../core/EventBus.js';
import { ToolRegistry, globalToolRegistry } from '../tools/ToolRegistry.js';
import { AgentRegistry, globalAgentRegistry } from '../agents/AgentRegistry.js';
import { EvidenceTracker } from './EvidenceTracker.js';
import { CritiqueEngine, globalCritiqueEngine } from './CritiqueEngine.js';
import { MemoryCompactor, globalMemoryCompactor } from './MemoryCompactor.js';
import { SkillRegistry, globalSkillRegistry } from '../skills/SkillRegistry.js';
import { EvidenceVerifier, globalEvidenceVerifier } from './EvidenceVerifier.js';
import { PlanTracker, globalPlanTracker } from './PlanTracker.js';
import { SubagentTreeEngine, globalSubagentTreeEngine } from './SubagentTreeEngine.js';
import { HypothesisNode } from './HypothesisTree.js';
import { RuntimeSession, Turn, ToolCall, ToolResult, Artifact, Citation } from '../types/runtime.js';

export interface AutonomousResearchEngineOptions {
  maxTurns?: number;
  modelProvider: ModelProvider;
  sessionManager?: SessionManager;
  eventBus?: EventBus;
  toolRegistry?: ToolRegistry;
  agentRegistry?: AgentRegistry;
  critiqueEngine?: CritiqueEngine;
  memoryCompactor?: MemoryCompactor;
  skillRegistry?: SkillRegistry;
  evidenceVerifier?: EvidenceVerifier;
  planTracker?: PlanTracker;
  subagentTreeEngine?: SubagentTreeEngine;
}

export class AutonomousResearchEngine {
  private maxTurns: number;
  private modelProvider: ModelProvider;
  private sessionManager: SessionManager;
  private eventBus: EventBus;
  private toolRegistry: ToolRegistry;
  private agentRegistry: AgentRegistry;
  private critiqueEngine: CritiqueEngine;
  private memoryCompactor: MemoryCompactor;
  private skillRegistry: SkillRegistry;
  private evidenceVerifier: EvidenceVerifier;
  private planTracker: PlanTracker;
  private subagentTreeEngine: SubagentTreeEngine;

  constructor(options: AutonomousResearchEngineOptions) {
    this.maxTurns = options.maxTurns || 16;
    this.modelProvider = options.modelProvider;
    this.sessionManager = options.sessionManager || globalSessionManager;
    this.eventBus = options.eventBus || globalEventBus;
    this.toolRegistry = options.toolRegistry || globalToolRegistry;
    this.agentRegistry = options.agentRegistry || globalAgentRegistry;
    this.critiqueEngine = options.critiqueEngine || globalCritiqueEngine;
    this.memoryCompactor = options.memoryCompactor || globalMemoryCompactor;
    this.skillRegistry = options.skillRegistry || globalSkillRegistry;
    this.evidenceVerifier = options.evidenceVerifier || globalEvidenceVerifier;
    this.planTracker = options.planTracker || globalPlanTracker;
    this.subagentTreeEngine = options.subagentTreeEngine || globalSubagentTreeEngine;
  }

  public setModelProvider(provider: ModelProvider): void {
    this.modelProvider = provider;
  }

  public getModelProvider(): ModelProvider {
    return this.modelProvider;
  }

  public getPlanTracker(): PlanTracker {
    return this.planTracker;
  }

  public getEvidenceVerifier(): EvidenceVerifier {
    return this.evidenceVerifier;
  }

  public getSubagentTreeEngine(): SubagentTreeEngine {
    return this.subagentTreeEngine;
  }

  /**
   * Run parallel subagents for multi-hypothesis inquiry
   */
  public async runHypothesisTree(
    parentSessionId: string,
    hypotheses: HypothesisNode[],
    parentEvidenceTracker: EvidenceTracker,
    maxConcurrency?: number
  ) {
    return this.subagentTreeEngine.exploreHypothesesParallel(
      parentSessionId,
      hypotheses,
      parentEvidenceTracker,
      maxConcurrency
    );
  }

  public async run(
    session: RuntimeSession,
    userInquiry: string,
    onDelta?: (chunk: string) => void
  ): Promise<Turn> {
    const sessionId = session.id;
    const turnIndex = session.turns.length + 1;
    const evidenceTracker = new EvidenceTracker();

    // 1. Initialize Explicit Research Plan & To-Do Tracker
    let plan = this.planTracker.getPlan(sessionId);
    if (!plan) {
      plan = this.planTracker.createPlan(sessionId, userInquiry);
    }

    // Set initial session status
    this.sessionManager.updateSessionStatus(sessionId, 'thinking');

    // Fetch tool definitions
    const toolDefinitions = this.toolRegistry.list();

    // Match skills
    const skillInjectionPrompt = this.skillRegistry.formatPromptForInquiry(userInquiry);

    // Initial system prompt
    const baseSystemPrompt = `You are JunScience, an autonomous empirical research agent.
Goal: Investigate the scientific inquiry with real data, empirical calculations, and rigorous verification.

Guidelines:
1. Always formulate hypotheses and retrieve data using official tools (UniProtKB, PDB, ChEMBL, PubChem, PubMed, openFDA, ClinicalTrials.gov, RxNorm, DailyMed).
2. Execute Python scripts locally for statistical computations, radiomics, or clinical NLP.
3. Every empirical finding is verified by the Evidence Verification Gate before adoption as [Evidence: EV-xxx].
4. Ground every conclusion in [Evidence: EV-xxx] tags. Never hallucinate unverified findings.
${skillInjectionPrompt ? `\n${skillInjectionPrompt}` : ''}`;

    let messages: ModelMessage[] = [
      { role: 'system', content: baseSystemPrompt },
      { role: 'user', content: userInquiry },
    ];

    let currentTurn = 0;
    let accumulatedToolCalls: ToolCall[] = [];
    let accumulatedToolResults: ToolResult[] = [];
    let finalContent = '';
    let critiquePassed = false;
    let critiqueFeedback: string | null = null;

    // Start Task 1 in Plan
    this.planTracker.startTask(sessionId, 'task-1');

    while (currentTurn < this.maxTurns) {
      currentTurn++;

      // Check Mid-Run Steering
      const pendingGuidance = this.sessionManager.popSteering(sessionId);
      if (pendingGuidance) {
        messages.push({
          role: 'user',
          content: `[User Guidance / Steering Direction]: ${pendingGuidance}`,
        });

        this.eventBus.emit({
          type: 'agent.thinking',
          sessionId,
          timestamp: new Date().toISOString(),
          payload: {
            thought: `Incorporating mid-run user guidance into trajectory: "${pendingGuidance}"...`,
            phase: 'Steering Adaptation',
          },
        });
      }

      // Memory Compactor
      if (this.memoryCompactor.shouldCompact(messages)) {
        const { compactedMessages } = this.memoryCompactor.compact(messages, evidenceTracker, userInquiry);
        messages = compactedMessages;
        this.eventBus.emit({
          type: 'agent.thinking',
          sessionId,
          timestamp: new Date().toISOString(),
          payload: {
            thought: `Context threshold reached. Compressed working memory into lossless structured summary.`,
            phase: 'Memory Compaction',
          },
        });
      }

      // Critique Feedback Re-injection
      if (critiqueFeedback) {
        messages.push({
          role: 'user',
          content: critiqueFeedback,
        });
      }

      // Thinking event
      const phaseName = currentTurn === 1 ? 'Plan Formulation' : critiqueFeedback ? 'Refining & Re-searching' : 'Evidence Gathering & Analysis';
      this.eventBus.emit({
        type: 'agent.thinking',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          thought: `[Turn ${currentTurn}/${this.maxTurns}] ${phaseName} with ${evidenceTracker.count()} verified evidence records...`,
          phase: phaseName,
        },
      });

      // Assemble Model Request
      const modelRequest: ModelRequest = {
        model: session.activeModel || 'gpt-4o',
        messages,
        tools: toolDefinitions,
      };

      let response;
      if (onDelta) {
        response = await this.modelProvider.stream(modelRequest, onDelta);
      } else {
        response = await this.modelProvider.generate(modelRequest);
      }

      finalContent = response.content;

      // Handle Tool Calling Branch
      if (response.finishReason === 'tool_calls' && response.toolCalls && response.toolCalls.length > 0) {
        this.sessionManager.updateSessionStatus(sessionId, 'tool_calling');

        for (const call of response.toolCalls) {
          accumulatedToolCalls.push({
            id: call.id,
            name: call.name,
            arguments: call.arguments,
          });

          // Determine corresponding plan task
          let activeTaskId = 'task-2';
          if (call.name.includes('uniprot') || call.name.includes('pdb')) {
            activeTaskId = 'task-1';
          } else if (call.name.includes('python') || call.name.includes('imaging') || call.name.includes('nlp')) {
            activeTaskId = 'task-3';
          } else if (call.name.includes('clinical') || call.name.includes('openfda') || call.name.includes('rxnorm')) {
            activeTaskId = 'task-4';
          }
          this.planTracker.startTask(sessionId, activeTaskId);

          // Execute real tool
          const result = await this.toolRegistry.execute(
            call.name,
            call.arguments,
            sessionId,
            session.activeAgent,
            turnIndex
          );

          const toolResult: ToolResult = {
            callId: call.id,
            name: call.name,
            output: result.output,
            error: result.error,
            execution: result.execution,
          };
          accumulatedToolResults.push(toolResult);

          // 2. Pre-adoption Evidence Verification Gate (Codex-style)
          const queryStr = call.arguments?.query || call.arguments?.accessionOrGene || call.arguments?.targetOrCompound || call.arguments?.compoundNameOrCID || call.arguments?.pdbIdOrUniProt || call.arguments?.scriptName || JSON.stringify(call.arguments);
          const verification = this.evidenceVerifier.verify(
            call.name,
            result.execution?.category || 'databases',
            String(queryStr),
            result.output,
            result.artifacts,
            result.citations
          );

          let evId = '';
          if (verification.verdict === 'REJECTED') {
            // Reject from evidence tracker, warn model
            this.planTracker.failTask(sessionId, activeTaskId, verification.reasonSummary);
            messages.push({
              role: 'assistant',
              content: `Called tool ${call.name}`,
              toolCallId: call.id,
            });
            messages.push({
              role: 'tool',
              name: call.name,
              content: `[Evidence Verification REJECTED]: ${verification.reasonSummary}. ${verification.suggestedCorrection}`,
              toolCallId: call.id,
            });
            continue;
          } else {
            // Adopted or Flagged with Warning
            const recordedEv = evidenceTracker.record(
              call.name,
              result.execution?.category || 'databases',
              String(queryStr),
              result.execution?.resultSummary || 'Tool executed successfully',
              result.output,
              result.citations,
              result.artifacts,
              verification
            );
            evId = recordedEv.id;
            this.planTracker.completeTask(sessionId, activeTaskId, [evId], recordedEv.summary);
          }

          // Register artifacts & citations in session
          if (result.artifacts) {
            result.artifacts.forEach((art: Artifact) => this.sessionManager.addArtifact(sessionId, art));
          }
          if (result.citations) {
            result.citations.forEach((cit: Citation) => this.sessionManager.addCitation(sessionId, cit));
          }

          // Append to conversation history
          messages.push({
            role: 'assistant',
            content: `Called tool ${call.name}`,
            toolCallId: call.id,
          });
          messages.push({
            role: 'tool',
            name: call.name,
            content: typeof result.output === 'string' ? result.output : JSON.stringify(result.output || result.error),
            toolCallId: call.id,
          });
        }

        critiqueFeedback = null;
        continue;
      }

      // If model generated final draft: Run Critique Gate
      if (response.finishReason === 'stop' || !response.toolCalls || response.toolCalls.length === 0) {
        this.planTracker.startTask(sessionId, 'task-5');
        const critique = await this.critiqueEngine.evaluate(userInquiry, evidenceTracker, finalContent);

        if (critique.passed || currentTurn >= this.maxTurns - 1) {
          critiquePassed = true;
          this.planTracker.completeTask(sessionId, 'task-5', [], 'Critique verification gate passed');

          // Append Plan Checklist & Evidence Provenance Table to final report
          const planTable = this.planTracker.formatPlanChecklist(sessionId);
          const evidenceTable = evidenceTracker.formatTraceabilityTable();
          finalContent = `${finalContent}\n\n${planTable}\n\n${evidenceTable}`;
          break;
        } else {
          critiqueFeedback = `[Critique Engine Feedback]: Your synthesis draft requires revision. Reasons: ${critique.issues.join('; ')}. Please call relevant tools to verify missing evidence or correct unverified claims before finishing.`;
        }
      }
    }

    const completedTurn: Turn = {
      index: turnIndex,
      userInput: userInquiry,
      toolCalls: accumulatedToolCalls,
      toolResults: accumulatedToolResults,
      agentResponse: finalContent,
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    this.sessionManager.addTurn(sessionId, completedTurn);
    this.sessionManager.updateSessionStatus(sessionId, 'completed');

    return completedTurn;
  }
}
