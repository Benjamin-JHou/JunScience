export class AnthropicProtocol {
    static buildUrl(profile) {
        const base = profile.baseUrl.replace(/\/+$/, '');
        if (base.endsWith('/v1/messages')) {
            return base;
        }
        return `${base}/v1/messages`;
    }
    static buildHeaders(profile) {
        const headers = {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            ...profile.headers,
        };
        if (profile.apiKey) {
            headers['x-api-key'] = profile.apiKey;
        }
        return headers;
    }
    static buildPayload(request, stream = false) {
        const systemMessage = request.messages.find((m) => m.role === 'system');
        const nonSystemMessages = request.messages.filter((m) => m.role !== 'system');
        const payload = {
            model: request.model,
            messages: nonSystemMessages.map((m) => {
                if (m.role === 'tool') {
                    return {
                        role: 'user',
                        content: [
                            {
                                type: 'tool_result',
                                tool_use_id: m.toolCallId || 'call_default',
                                content: m.content,
                            },
                        ],
                    };
                }
                return {
                    role: m.role,
                    content: m.content,
                };
            }),
            max_tokens: request.maxTokens || 4096,
            temperature: request.temperature ?? 0.2,
            stream,
        };
        if (systemMessage) {
            payload.system = systemMessage.content;
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
    static parseResponse(json) {
        let content = '';
        const toolCalls = [];
        if (json.content && Array.isArray(json.content)) {
            json.content.forEach((block) => {
                if (block.type === 'text') {
                    content += block.text || '';
                }
                else if (block.type === 'tool_use') {
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
    static processSseChunk(dataStr, state, onDelta) {
        try {
            const json = JSON.parse(dataStr);
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
                const text = json.delta.text || '';
                state.content += text;
                onDelta?.(text);
            }
            else if (json.type === 'content_block_start' && json.content_block?.type === 'tool_use') {
                const index = json.index ?? state.toolCallsMap.size;
                state.toolCallsMap.set(index, {
                    id: json.content_block.id || `call_${Date.now()}_${index}`,
                    name: json.content_block.name || '',
                    argsStr: '',
                });
            }
            else if (json.type === 'content_block_delta' && json.delta?.type === 'input_json_delta') {
                const index = json.index ?? 0;
                const existing = state.toolCallsMap.get(index);
                if (existing) {
                    existing.argsStr += json.delta.partial_json || '';
                }
            }
            else if (json.type === 'message_delta' && json.delta?.stop_reason) {
                state.finishReason = json.delta.stop_reason === 'tool_use' ? 'tool_calls' : 'stop';
            }
        }
        catch {
            // Ignore non-json lines (e.g. event: ping)
        }
    }
}
//# sourceMappingURL=AnthropicProtocol.js.map