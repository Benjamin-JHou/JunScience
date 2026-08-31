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
    // 1. Combine all system messages into a single system prompt (preserving compacted memory blocks)
    const systemMessages = request.messages.filter((m) => m.role === 'system');
    const combinedSystemPrompt = systemMessages
      .map((m) => (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)))
      .filter((s) => s.trim().length > 0)
      .join('\n\n---\n\n');

    // 2. Filter non-system messages and normalize role alternation & tool blocks
    const rawNonSystem = request.messages.filter((m) => m.role !== 'system');
    const normalizedMessages: any[] = [];

    for (const m of rawNonSystem) {
      if (m.role === 'tool') {
        const toolResultBlock = {
          type: 'tool_result',
          tool_use_id: m.toolCallId || 'call_default',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        };

        // Merge into previous user message if previous message was also user/tool
        const prevMsg = normalizedMessages[normalizedMessages.length - 1];
        if (prevMsg && prevMsg.role === 'user' && Array.isArray(prevMsg.content)) {
          prevMsg.content.push(toolResultBlock);
        } else if (prevMsg && prevMsg.role === 'user' && typeof prevMsg.content === 'string') {
          prevMsg.content = [{ type: 'text', text: prevMsg.content }, toolResultBlock];
        } else {
          normalizedMessages.push({
            role: 'user',
            content: [toolResultBlock],
          });
        }
      } else if (m.role === 'assistant') {
        const contentBlocks: any[] = [];
        if (m.content) {
          const textContent = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
          if (textContent.trim()) {
            contentBlocks.push({ type: 'text', text: textContent });
          }
        }
        if (m.toolCalls && Array.isArray(m.toolCalls)) {
          for (const tc of m.toolCalls) {
            contentBlocks.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.name,
              input: typeof tc.arguments === 'string' ? JSON.parse(tc.arguments || '{}') : tc.arguments || {},
            });
          }
        }

        const prevMsg = normalizedMessages[normalizedMessages.length - 1];
        if (prevMsg && prevMsg.role === 'assistant') {
          if (Array.isArray(prevMsg.content)) {
            prevMsg.content.push(...contentBlocks);
          } else if (typeof prevMsg.content === 'string') {
            prevMsg.content = [{ type: 'text', text: prevMsg.content }, ...contentBlocks];
          }
        } else {
          normalizedMessages.push({
            role: 'assistant',
            content: contentBlocks.length > 0 ? contentBlocks : [{ type: 'text', text: '' }],
          });
        }
      } else {
        // User message
        const formattedContent = AnthropicProtocol.formatContent(m.content);
        const prevMsg = normalizedMessages[normalizedMessages.length - 1];
        if (prevMsg && prevMsg.role === 'user') {
          if (typeof prevMsg.content === 'string' && typeof formattedContent === 'string') {
            prevMsg.content += `\n\n${formattedContent}`;
          } else if (Array.isArray(prevMsg.content)) {
            if (Array.isArray(formattedContent)) {
              prevMsg.content.push(...formattedContent);
            } else {
              prevMsg.content.push({ type: 'text', text: typeof formattedContent === 'string' ? formattedContent : JSON.stringify(formattedContent) });
            }
          } else {
            prevMsg.content = [{ type: 'text', text: String(prevMsg.content) }, { type: 'text', text: String(formattedContent) }];
          }
        } else {
          normalizedMessages.push({
            role: 'user',
            content: formattedContent,
          });
        }
      }
    }

    const payload: Record<string, any> = {
      model: request.model,
      messages: normalizedMessages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.2,
      stream,
    };

    if (combinedSystemPrompt) {
      payload.system = combinedSystemPrompt;
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
