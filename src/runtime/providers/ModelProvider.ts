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
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface ModelProvider {
  name: string;
  listModels(): Promise<string[]>;
  generate(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest, onDelta: (chunk: string) => void): Promise<ModelResponse>;
}
