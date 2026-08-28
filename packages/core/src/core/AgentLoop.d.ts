import { RuntimeSession, Turn } from '../types/runtime';
import { ModelProvider } from '../client/ModelProvider';
import { AgentRegistry } from '../agents/AgentRegistry';
import { ToolRegistry } from '../tools/ToolRegistry';
import { SessionManager } from './SessionManager';
import { EventBus } from './EventBus';
export interface AgentLoopOptions {
    maxTurns?: number;
    modelProvider?: ModelProvider;
    sessionManager?: SessionManager;
    eventBus?: EventBus;
    toolRegistry?: ToolRegistry;
    agentRegistry?: AgentRegistry;
}
export declare class AgentLoop {
    private maxTurns;
    private modelProvider;
    private sessionManager;
    private eventBus;
    private toolRegistry;
    private agentRegistry;
    constructor(options?: AgentLoopOptions);
    setModelProvider(provider: ModelProvider): void;
    getModelProvider(): ModelProvider;
    run(session: RuntimeSession, userInput: string, onDelta?: (chunk: string) => void): Promise<Turn>;
}
export declare const globalAgentLoop: AgentLoop;
//# sourceMappingURL=AgentLoop.d.ts.map