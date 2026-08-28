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

  constructor(options: AutonomousResearchEngineOptions) {
    this.maxTurns = options.maxTurns || 16; // Expanded default budget to 16 turns
    this.modelProvider = options.modelProvider;
    this.sessionManager = options.sessionManager || globalSessionManager;
    this.eventBus = options.eventBus || globalEventBus;
    this.toolRegistry = options.toolRegistry || globalToolRegistry;
    this.agentRegistry = options.agentRegistry || globalAgentRegistry;
    this.critiqueEngine = options.critiqueEngine || globalCritiqueEngine;
    this.memoryCompactor = options.memoryCompactor || globalMemoryCompactor;
    this.skillRegistry = options.skillRegistry || globalSkillRegistry;
  }

  public setModelProvider(provider: ModelProvider): void {
    this.modelProvider = provider;
  }

  public getModelProvider(): ModelProvider {
    return this.modelProvider;
  }

  public async run(
    session: RuntimeSession,
    userInquiry: string,
    onDelta?: (chunk: string) => void
  ): Promise<Turn> {
    const sessionId = session.id;
    const turnIndex = session.turns.length;
    const evidenceTracker = new EvidenceTracker();

    // 1. Emit start
    this.eventBus.emit({
      type: 'agent.started',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: { agentId: session.activeAgent, objective: userInquiry },
    });
    this.sessionManager.updateSessionStatus(sessionId, 'thinking');

    // 2. Discover scoped tools
    const scopedTools = this.agentRegistry.getScopedTools(session.activeAgent);
    const toolDefinitions = scopedTools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    }));

    const systemPrompt = `You are the Lead Scientific AI Research Partner in JunScience.
You conduct rigorous, evidence-grounded scientific investigations.

CRITICAL OPERATING RULES:
1. Every scientific claim MUST be grounded in empirical data from tool calls (PubMed, UniProt, ChEMBL, PubChem, PDB, Python).
2. DO NOT fabricate PMIDs, DOIs, or chemical structures. All citations are verified against live NCBI indices.
3. Formulate clear hypotheses. If database evidence contradicts your initial hypothesis, PIVOT your plan and explain why.
4. When writing your final report:
   - Ground each finding with evidence tags [Evidence: EV-1], [Evidence: EV-2].
   - Provide exact PMIDs/DOIs retrieved during literature searches.
   - Include biological mechanism, druggability/pocket metrics, and statistical caveats.`;

    const skillPrompt = this.skillRegistry.formatPromptForInquiry(userInquiry);
    const fullSystemPrompt = `${systemPrompt}${skillPrompt}`;

    let messages: ModelMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      { role: 'user', content: userInquiry },
    ];

    let currentTurn = 0;
    let finalContent = '';
    const accumulatedToolCalls: ToolCall[] = [];
    const accumulatedToolResults: ToolResult[] = [];
    let critiquePassed = false;
    let critiqueFeedback: string | null = null;
    const turnStartTime = new Date().toISOString();

    while (currentTurn < this.maxTurns) {
      currentTurn++;

      // Memory Compaction: Check if message context needs compression
      if (this.memoryCompactor.shouldCompact(messages)) {
        const { compactedMessages, summarizedCount } = this.memoryCompactor.compact(
          messages,
          evidenceTracker,
          userInquiry
        );
        if (summarizedCount > 0) {
          messages = compactedMessages;
          this.eventBus.emit({
            type: 'agent.thinking',
            sessionId,
            timestamp: new Date().toISOString(),
            payload: {
              thought: `[Memory Compaction] Compacted ${summarizedCount} earlier investigation steps into working memory snapshot while retaining all ${evidenceTracker.count()} evidence records (EV-xxx).`,
              phase: 'Memory Compaction',
            },
          });
        }
      }

      // Check for mid-run user steering guidance
      const pendingSteering = this.sessionManager.popSteering(sessionId);
      if (pendingSteering) {
        messages.push({
          role: 'user',
          content: `[User Steering Guidance: Mid-Run Direction Adjustment] ${pendingSteering}. Please immediately incorporate this guidance, pivot your current research/search strategy, and focus on this specified requirement.`,
        });
        this.eventBus.emit({
          type: 'agent.thinking',
          sessionId,
          timestamp: new Date().toISOString(),
          payload: {
            thought: `[🧭 Mid-Run Steering Injected] "${pendingSteering}" -> Pivoting research trajectory...`,
            phase: 'User Steering',
          },
        });
      }

      // Inform user of dynamic reasoner state
      const phaseName = currentTurn === 1 ? 'Hypothesis Formulation' : critiqueFeedback ? 'Refining & Re-searching' : 'Evidence Gathering & Analysis';
      this.eventBus.emit({
        type: 'agent.thinking',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          thought: `[Turn ${currentTurn}/${this.maxTurns}] ${phaseName} with ${evidenceTracker.count()} verified evidence records...`,
          phase: phaseName,
        },
      });

      // Assemble dynamic context for model
      const modelRequest: ModelRequest = {
        model: session.activeModel || 'gpt-4o',
        messages,
        tools: toolDefinitions,
      };

      // Call Model
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

          // Register in Evidence Tracker
          const queryStr = call.arguments?.query || call.arguments?.accessionOrGene || call.arguments?.targetOrCompound || call.arguments?.compoundNameOrCID || call.arguments?.pdbIdOrUniProt || call.arguments?.scriptName || JSON.stringify(call.arguments);
          evidenceTracker.record(
            call.name,
            result.execution?.category || 'databases',
            String(queryStr),
            result.execution?.resultSummary || 'Tool executed successfully',
            result.output,
            result.citations,
            result.artifacts
          );

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

        // Clear previous critique feedback after successful tool execution
        critiqueFeedback = null;
        continue;
      }

      // If model generated a final text draft (stop): Run Critique Gate
      if (response.finishReason === 'stop' || !response.toolCalls || response.toolCalls.length === 0) {
        // Run Critique verification
        const critique = await this.critiqueEngine.evaluate(userInquiry, evidenceTracker, finalContent);

        if (critique.passed || currentTurn >= this.maxTurns - 1) {
          critiquePassed = true;
          // Append Evidence Provenance Table to final report
          const evidenceTable = evidenceTracker.formatTraceabilityTable();
          finalContent = `${finalContent}\n\n${evidenceTable}`;
          break;
        } else {
          // Critique rejected the draft -> Feed feedback back to model and loop again!
          critiqueFeedback = critique.issues.join('; ');
          messages.push({
            role: 'assistant',
            content: finalContent,
          });
          messages.push({
            role: 'user',
            content: `[Critique Feedback: Draft Rejected] ${critiqueFeedback}. Recommendations: ${critique.recommendations.join('; ')}. Please call tools to retrieve missing data or correct the unverified claims.`,
          });
          continue;
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
      startedAt: turnStartTime,
      completedAt: new Date().toISOString(),
    };

    this.sessionManager.addTurn(sessionId, completedTurn);
    this.sessionManager.updateSessionStatus(sessionId, 'completed');

    this.eventBus.emit({
      type: 'agent.message.completed',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: {
        messageId: `msg-${Date.now()}`,
        fullContent: finalContent,
      },
    });

    return completedTurn;
  }
}
