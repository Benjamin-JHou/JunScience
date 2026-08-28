import { ModelProfile, ModelRequest, ModelResponse, ModelToolCall, ModelContentPart } from '../../types/model.js';

export class OpenAIProtocol {
  public static buildUrl(profile: ModelProfile): string {
    const base = profile.baseUrl.replace(/\/+$/, '');
    if (base.endsWith('/chat/completions')) {
      return base;
    }
    return `${base}/chat/completions`;
  }

  public static buildHeaders(profile: ModelProfile): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...profile.headers,
    };
    if (profile.apiKey) {
      headers['Authorization'] = `Bearer ${profile.apiKey}`;
    }
    return headers;
  }

  private static formatContent(content: string | ModelContentPart[]): any {
    if (typeof content === 'string') {
      return content;
    }
    return content.map((part) => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text };
      }
      if (part.type === 'image_url') {
        return {
          type: 'image_url',
          image_url: {
            url: part.image_url.url,
            detail: part.image_url.detail || 'auto',
          },
        };
      }
      return part;
    });
  }

  public static buildPayload(request: ModelRequest, stream: boolean = false): Record<string, any> {
    const payload: Record<string, any> = {
      model: request.model,
      messages: request.messages.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'tool',
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
            tool_call_id: m.toolCallId || 'call_default',
          };
        }
        return {
          role: m.role,
          content: OpenAIProtocol.formatContent(m.content),
        };
      }),
      temperature: request.temperature ?? 0.2,
      stream,
    };

    if (request.maxTokens) {
      payload.max_tokens = request.maxTokens;
    }

    if (request.tools && request.tools.length > 0) {
      payload.tools = request.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters || t.inputSchema || {},
        },
      }));
    }

    return payload;
  }

  public static parseResponse(json: any): ModelResponse {
    const choice = json.choices?.[0];
    if (!choice) {
      throw new Error(`Invalid OpenAI response format: ${JSON.stringify(json)}`);
    }

    const message = choice.message || {};
    const content = message.content || '';
    const toolCalls: ModelToolCall[] = [];

    if (message.tool_calls && Array.isArray(message.tool_calls)) {
      message.tool_calls.forEach((tc: any) => {
        let args = {};
        try {
          args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function?.arguments || {};
        } catch {
          args = { raw: tc.function?.arguments };
        }
        toolCalls.push({
          id: tc.id || `call_${Math.random().toString(36).slice(2, 7)}`,
          name: tc.function?.name || '',
          arguments: args,
        });
      });
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: choice.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop',
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens || 0,
            completionTokens: json.usage.completion_tokens || 0,
            totalTokens: json.usage.total_tokens || 0,
          }
        : undefined,
    };
  }

  public static processSseChunk(
    dataStr: string,
    state: {
      content: string;
      toolCallsMap: Map<number, { id: string; name: string; argsStr: string }>;
      finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
    },
    onDelta?: (chunk: string) => void
  ): void {
    if (dataStr === '[DONE]') return;
    try {
      const json = JSON.parse(dataStr);
      const choice = json.choices?.[0];
      if (!choice) return;

      if (choice.finish_reason) {
        state.finishReason = choice.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop';
      }

      const delta = choice.delta;
      if (!delta) return;

      if (delta.content) {
        state.content += delta.content;
        onDelta?.(delta.content);
      }

      if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
        delta.tool_calls.forEach((tc: any) => {
          const index = tc.index ?? 0;
          if (!state.toolCallsMap.has(index)) {
            state.toolCallsMap.set(index, {
              id: tc.id || `call_${Date.now()}_${index}`,
              name: tc.function?.name || '',
              argsStr: '',
            });
          } else {
            const existing = state.toolCallsMap.get(index)!;
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name += tc.function.name;
            if (tc.function?.arguments) existing.argsStr += tc.function.arguments;
          }
        });
      }
    } catch {
      // Ignore unparseable partial chunk
    }
  }
}
