import { AgentId } from '../types/runtime';
export interface AgentConfig {
    id: AgentId;
    name: string;
    title: string;
    description: string;
    systemPrompt: string;
    allowedToolCategories: string[];
    defaultSkills: string[];
}
export declare const builtInAgents: AgentConfig[];
//# sourceMappingURL=BaseAgent.d.ts.map