export type AgentStatus = 'idle' | 'thinking' | 'planning' | 'tool_calling' | 'executing' | 'generating' | 'waiting_for_permission' | 'completed' | 'error' | 'cancelled';
export type ToolCategory = 'literature' | 'analysis' | 'code' | 'experiment' | 'molecule' | 'databases' | 'execution' | 'artifacts';
export interface ToolExecution {
    id: string;
    toolName: string;
    category: ToolCategory;
    description: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    logs: string[];
    duration?: string;
    resultSummary?: string;
}
export interface Artifact {
    id: string;
    type: 'figure' | 'dataset' | 'table' | 'protein' | 'molecule' | 'code' | 'report';
    title: string;
    description: string;
    metadata?: Record<string, string | number>;
    generatedFrom?: string;
}
export interface Citation {
    id: string;
    index: number;
    title: string;
    authors: string;
    journal: string;
    year: number;
    doi?: string;
    pmid?: string;
    abstractSnippet?: string;
    url?: string;
}
export type AgentId = 'research' | 'biology' | 'chemistry' | 'ml' | 'critic' | 'literature-reviewer' | 'plan';
export type OperationType = 'READ' | 'WRITE' | 'EXECUTE' | 'NETWORK' | 'INSTALL' | 'DELETE';
export type PermissionDecision = 'allow' | 'deny' | 'ask';
export interface PermissionRequest {
    id: string;
    operation: OperationType;
    target: string;
    reason: string;
    timestamp: string;
    decision?: PermissionDecision;
}
export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}
export interface ToolResult {
    callId: string;
    name: string;
    output: any;
    error?: string;
    execution: ToolExecution;
}
export interface Turn {
    index: number;
    userInput: string;
    thought?: string;
    toolCalls: ToolCall[];
    toolResults: ToolResult[];
    agentResponse: string;
    status: AgentStatus;
    startedAt: string;
    completedAt?: string;
}
export interface RuntimeSession {
    id: string;
    projectId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    activeAgent: AgentId;
    activeProfileId?: string;
    activeModel: string;
    status: AgentStatus;
    turns: Turn[];
    artifacts: Artifact[];
    citations: Citation[];
    metadata: Record<string, any>;
}
//# sourceMappingURL=runtime.d.ts.map