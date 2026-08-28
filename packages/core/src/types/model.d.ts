export type ProtocolType = 'openai-compatible' | 'anthropic-compatible' | 'custom';
export interface ModelProfile {
    id: string;
    name: string;
    protocol: ProtocolType;
    baseUrl: string;
    model: string;
    apiKey?: string;
    contextWindow?: number;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
    toolCalling?: boolean;
    headers?: Record<string, string>;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface ModelMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    toolCallId?: string;
    name?: string;
}
export interface ModelToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}
export interface ModelRequest {
    model: string;
    messages: ModelMessage[];
    tools?: any[];
    temperature?: number;
    maxTokens?: number;
}
export interface ModelResponse {
    content: string;
    toolCalls?: ModelToolCall[];
    finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface ConnectionTestResult {
    success: boolean;
    latencyMs: number;
    message: string;
    model?: string;
    error?: string;
}
//# sourceMappingURL=model.d.ts.map