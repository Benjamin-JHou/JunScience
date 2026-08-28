import { fallbackMockProvider } from '../client/ScientificMockProvider';
import { globalAgentRegistry } from '../agents/AgentRegistry';
import { globalToolRegistry } from '../tools/ToolRegistry';
import { globalSessionManager } from './SessionManager';
import { globalEventBus } from './EventBus';
export class AgentLoop {
    maxTurns;
    modelProvider;
    sessionManager;
    eventBus;
    toolRegistry;
    agentRegistry;
    constructor(options) {
        this.maxTurns = options?.maxTurns || 6;
        this.modelProvider = options?.modelProvider || fallbackMockProvider;
        this.sessionManager = options?.sessionManager || globalSessionManager;
        this.eventBus = options?.eventBus || globalEventBus;
        this.toolRegistry = options?.toolRegistry || globalToolRegistry;
        this.agentRegistry = options?.agentRegistry || globalAgentRegistry;
    }
    setModelProvider(provider) {
        this.modelProvider = provider;
    }
    getModelProvider() {
        return this.modelProvider;
    }
    async run(session, userInput, onDelta) {
        const agentId = session.activeAgent;
        const sessionId = session.id;
        const turnIndex = session.turns.length;
        // 1. Emit agent.started
        this.eventBus.emit({
            type: 'agent.started',
            sessionId,
            timestamp: new Date().toISOString(),
            payload: { agentId, objective: userInput },
        });
        this.sessionManager.updateSessionStatus(sessionId, 'thinking');
        // 2. Assemble system prompt with agent role + dynamically discovered skills
        const systemPrompt = this.agentRegistry.assembleSystemPrompt(agentId, userInput);
        const scopedTools = this.agentRegistry.getScopedTools(agentId);
        // 3. Assemble message history
        const messages = [
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
        const accumulatedToolCalls = [];
        const accumulatedToolResults = [];
        let finalContent = '';
        const turnStartTime = new Date().toISOString();
        while (currentTurn < this.maxTurns) {
            currentTurn++;
            this.eventBus.emit({
                type: 'agent.thinking',
                sessionId,
                timestamp: new Date().toISOString(),
                payload: {
                    thought: `Reasoning turn ${currentTurn}/${this.maxTurns} with ${scopedTools.length} active scientific tools...`,
                    phase: currentTurn === 1 ? 'Planning' : 'Synthesizing',
                },
            });
            const modelRequest = {
                model: session.activeModel,
                messages,
                tools: scopedTools.map((t) => ({
                    name: t.name,
                    description: t.description,
                    parameters: t.inputSchema,
                })),
            };
            // Call provider (stream or generate)
            let response;
            if (onDelta) {
                response = await this.modelProvider.stream(modelRequest, onDelta);
            }
            else {
                response = await this.modelProvider.generate(modelRequest);
            }
            finalContent = response.content;
            // Check if tool calls were requested
            if (response.finishReason === 'tool_calls' && response.toolCalls && response.toolCalls.length > 0) {
                this.sessionManager.updateSessionStatus(sessionId, 'tool_calling');
                for (const call of response.toolCalls) {
                    const toolCall = {
                        id: call.id,
                        name: call.name,
                        arguments: call.arguments,
                    };
                    accumulatedToolCalls.push(toolCall);
                    // Execute tool via registry
                    const result = await this.toolRegistry.execute(call.name, call.arguments, sessionId, agentId, turnIndex);
                    const toolResult = {
                        callId: call.id,
                        name: call.name,
                        output: result.output,
                        error: result.error,
                        execution: result.execution,
                    };
                    accumulatedToolResults.push(toolResult);
                    // Collect produced artifacts & citations
                    if (result.artifacts) {
                        result.artifacts.forEach((art) => {
                            this.sessionManager.addArtifact(sessionId, art);
                        });
                    }
                    if (result.citations) {
                        result.citations.forEach((cit) => {
                            this.sessionManager.addCitation(sessionId, cit);
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
                        content: typeof result.output === 'string' ? result.output : JSON.stringify(result.output || result.error),
                        toolCallId: call.id,
                    });
                }
                // Loop again to give model observation results
                continue;
            }
            // If stop or no more tools, loop is completed
            break;
        }
        const completedTurn = {
            index: turnIndex,
            userInput,
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
export const globalAgentLoop = new AgentLoop();
//# sourceMappingURL=AgentLoop.js.map