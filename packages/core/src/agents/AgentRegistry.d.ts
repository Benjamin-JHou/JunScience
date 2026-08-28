import { AgentId } from '../types/runtime';
import { AgentConfig } from './BaseAgent';
import { ToolDefinition } from '../types/tools';
export declare class AgentRegistry {
    private agents;
    constructor();
    get(id: AgentId): AgentConfig | undefined;
    list(): AgentConfig[];
    getScopedTools(agentId: AgentId): ToolDefinition[];
    assembleSystemPrompt(agentId: AgentId, userQuery: string): string;
}
export declare const globalAgentRegistry: AgentRegistry;
//# sourceMappingURL=AgentRegistry.d.ts.map