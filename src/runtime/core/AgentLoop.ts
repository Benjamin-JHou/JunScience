import { RuntimeSession, Turn, ToolCall, ToolResult } from '../types/runtime';
import { ModelMessage, ModelRequest } from '../providers/ModelProvider';
import { globalModelProvider } from '../providers/ScientificMockProvider';
import { globalAgentRegistry } from '../agents/AgentRegistry';
import { globalToolRegistry } from '../tools/ToolRegistry';
import { globalSessionManager } from './SessionManager';
import { globalEventBus } from './EventBus';
import { Artifact, Citation } from '../../types/agent';

export interface AgentLoopOptions {
  maxTurns?: number;
  onDelta?: (chunk: string) => void;
}

export class AgentLoop {
  private maxTurns: number;

  constructor(options?: AgentLoopOptions) {
    this.maxTurns = options?.maxTurns || 5;
  }

  public async run(
    session: RuntimeSession,
    userInput: string,
    onDelta?: (chunk: string) => void
  ): Promise<Turn> {
    const agentId = session.activeAgent;
    const sessionId = session.id;
    const turnIndex = session.turns.length;

    // 1. Emit agent.started
    globalEventBus.emit({
      type: 'agent.started',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: { agentId, objective: userInput },
    });

    globalSessionManager.updateSessionStatus(sessionId, 'thinking');

    // 2. Assemble system prompt with agent role + dynamically discovered skills
    const systemPrompt = globalAgentRegistry.assembleSystemPrompt(agentId, userInput);
    const scopedTools = globalAgentRegistry.getScopedTools(agentId);

    // 3. Assemble message history
    const messages: ModelMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add previous turns
    session.turns.forEach((t) => {
      messages.push({ role: 'user', content: t.userInput });
      messages.push({ role: 'assistant', content: t.agentResponse });
    });

    // Add current user input
    messages.push({ role: 'user', content: userInput });

    let currentTurn = 0;
    const accumulatedToolCalls: ToolCall[] = [];
    const accumulatedToolResults: ToolResult[] = [];
    let finalContent = '';
    const turnStartTime = new Date().toISOString();

    while (currentTurn < this.maxTurns) {
      currentTurn++;

      globalEventBus.emit({
        type: 'agent.thinking',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: {
          thought: `Reasoning turn ${currentTurn}/${this.maxTurns} with ${scopedTools.length} active scientific tools...`,
          phase: currentTurn === 1 ? 'Planning' : 'Synthesizing',
        },
      });

      const modelRequest: ModelRequest = {
        model: session.activeModel,
        messages,
        tools: scopedTools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.inputSchema,
        })),
      };

      // Call provider
      const response = await globalModelProvider.generate(modelRequest);

      // Stream delta to listener if present
      if (response.content && onDelta) {
        onDelta(response.content);
      }

      finalContent = response.content;

      // Check if tool calls were requested
      if (response.finishReason === 'tool_calls' && response.toolCalls && response.toolCalls.length > 0) {
        globalSessionManager.updateSessionStatus(sessionId, 'tool_calling');

        for (const call of response.toolCalls) {
          const toolCall: ToolCall = {
            id: call.id,
            name: call.name,
            arguments: call.arguments,
          };
          accumulatedToolCalls.push(toolCall);

          // Execute tool via registry
          const result = await globalToolRegistry.execute(
            call.name,
            call.arguments,
            sessionId,
            agentId,
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

          // Collect produced artifacts & citations
          if (result.artifacts) {
            result.artifacts.forEach((art: Artifact) => {
              globalSessionManager.addArtifact(sessionId, art);
            });
          }
          if (result.citations) {
            result.citations.forEach((cit: Citation) => {
              globalSessionManager.addCitation(sessionId, cit);
            });
          }

          // Append tool result into model history for next turn
          messages.push({
            role: 'assistant',
            content: `Called tool ${call.name}`,
            toolCallId: call.id,
          });
          messages.push({
            role: 'tool',
            name: call.name,
            content: JSON.stringify(result.output || result.error),
            toolCallId: call.id,
          });
        }

        // Loop again to give model observation results
        continue;
      }

      // If stop or no more tools, loop is completed
      break;
    }

    const completedTurn: Turn = {
      index: turnIndex,
      userInput,
      toolCalls: accumulatedToolCalls,
      toolResults: accumulatedToolResults,
      agentResponse: finalContent,
      status: 'completed',
      startedAt: turnStartTime,
      completedAt: new Date().toISOString(),
    };

    globalSessionManager.addTurn(sessionId, completedTurn);
    globalSessionManager.updateSessionStatus(sessionId, 'completed');

    globalEventBus.emit({
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

export const globalAgentLoop = new AgentLoop();
