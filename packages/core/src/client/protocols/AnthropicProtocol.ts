import { ModelProfile, ModelRequest, ModelResponse, ModelToolCall, ModelContentPart } from '../../types/model.js';

export class AnthropicProtocol {
  public static buildUrl(profile: ModelProfile): string {
    const base = profile.baseUrl.replace(/\/+$/, '');
    if (base.endsWith('/v1/messages')) {
      return base;
    }
    return `${base}/v1/messages`;
  }

  public static buildHeaders(profile: ModelProfile): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      ...profile.headers,
    };
    if (profile.apiKey) {
      headers['x-api-key'] = profile.apiKey;
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
        const url = part.image_url.url;
        if (url.startsWith('data:')) {
          const parts = url.split(';base64,');
          const mediaType = parts[0].replace('data:', '') || 'image/jpeg';
          const data = parts[1] || '';
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data,
            },
          };
        }
        // Fallback for http URL (or wrap in text)
        return {
          type: 'text',
          text: `[Image: ${url}]`,
        };
      }
      return part;
    });
  }

  public static buildPayload(request: ModelRequest, stream: boolean = false): Record<string, any> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const nonSystemMessages = request.messages.filter((m) => m.role !== 'system');

    const payload: Record<string, any> = {
      model: request.model,
      messages: nonSystemMessages.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: m.toolCallId || 'call_default',
                content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
              },
            ],
          };
        }
        return {
          role: m.role,
          content: AnthropicProtocol.formatContent(m.content),
        };
      }),
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.2,
      stream,
    };

    if (systemMessage) {
      payload.system = typeof systemMessage.content === 'string' ? systemMessage.content : JSON.stringify(systemMessage.content);
    }

    if (request.tools && request.tools.length > 0) {
      payload.tools = request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters || t.inputSchema || {},
      }));
    }

    return payload;
  }

  public static parseResponse(json: any): ModelResponse {
    let content = '';
    const toolCalls: ModelToolCall[] = [];

    if (json.content && Array.isArray(json.content)) {
      json.content.forEach((block: any) => {
        if (block.type === 'text') {
          content += block.text || '';
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id || `call_${Math.random().toString(36).slice(2, 7)}`,
            name: block.name || '',
            arguments: block.input || {},
          });
        }
      });
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: json.stop_reason === 'tool_use' ? 'tool_calls' : 'stop',
      usage: json.usage
        ? {
            promptTokens: json.usage.input_tokens || 0,
            completionTokens: json.usage.output_tokens || 0,
            totalTokens: (json.usage.input_tokens || 0) + (json.usage.output_tokens || 0),
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
    try {
      const json = JSON.parse(dataStr);
      if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
        const text = json.delta.text || '';
        state.content += text;
        onDelta?.(text);
      } else if (json.type === 'content_block_start' && json.content_block?.type === 'tool_use') {
        const index = json.index ?? state.toolCallsMap.size;
        state.toolCallsMap.set(index, {
          id: json.content_block.id || `call_${Date.now()}_${index}`,
          name: json.content_block.name || '',
          argsStr: '',
        });
      } else if (json.type === 'content_block_delta' && json.delta?.type === 'input_json_delta') {
        const index = json.index ?? 0;
        const existing = state.toolCallsMap.get(index);
        if (existing) {
          existing.argsStr += json.delta.partial_json || '';
        }
      } else if (json.type === 'message_delta' && json.delta?.stop_reason) {
        state.finishReason = json.delta.stop_reason === 'tool_use' ? 'tool_calls' : 'stop';
      }
    } catch {
      // Ignore non-json lines (e.g. event: ping)
    }
  }
}
