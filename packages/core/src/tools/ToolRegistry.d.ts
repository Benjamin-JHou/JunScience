import { ToolDefinition, ToolExecutionResult } from '../types/tools';
export declare class ToolRegistry {
    private tools;
    register(tool: ToolDefinition): void;
    get(name: string): ToolDefinition | undefined;
    list(): ToolDefinition[];
    listByCategory(category: string): ToolDefinition[];
    execute(name: string, input: any, sessionId: string, agentId: string, turnIndex?: number): Promise<ToolExecutionResult>;
}
export declare const globalToolRegistry: ToolRegistry;
//# sourceMappingURL=ToolRegistry.d.ts.map