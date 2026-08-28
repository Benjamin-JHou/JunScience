import { OpenAIProtocol } from './protocols/OpenAIProtocol';
import { AnthropicProtocol } from './protocols/AnthropicProtocol';
export class GenericModelClient {
    name;
    profile;
    constructor(profile) {
        this.profile = profile;
        this.name = profile.name;
    }
    getProfile() {
        return { ...this.profile };
    }
    async listModels() {
        return [this.profile.model];
    }
    async generate(request) {
        const isAnthropic = this.profile.protocol === 'anthropic-compatible';
        const url = isAnthropic ? AnthropicProtocol.buildUrl(this.profile) : OpenAIProtocol.buildUrl(this.profile);
        const headers = isAnthropic ? AnthropicProtocol.buildHeaders(this.profile) : OpenAIProtocol.buildHeaders(this.profile);
        const body = isAnthropic ? AnthropicProtocol.buildPayload(request, false) : OpenAIProtocol.buildPayload(request, false);
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Model API error (${response.status} ${response.statusText}): ${errorText}`);
        }
        const json = await response.json();
        return isAnthropic ? AnthropicProtocol.parseResponse(json) : OpenAIProtocol.parseResponse(json);
    }
    async stream(request, onDelta) {
        const isAnthropic = this.profile.protocol === 'anthropic-compatible';
        const url = isAnthropic ? AnthropicProtocol.buildUrl(this.profile) : OpenAIProtocol.buildUrl(this.profile);
        const headers = isAnthropic ? AnthropicProtocol.buildHeaders(this.profile) : OpenAIProtocol.buildHeaders(this.profile);
        const body = isAnthropic ? AnthropicProtocol.buildPayload(request, true) : OpenAIProtocol.buildPayload(request, true);
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Model API stream error (${response.status} ${response.statusText}): ${errorText}`);
        }
        if (!response.body) {
            throw new Error('Response body is null, cannot stream.');
        }
        const streamState = {
            content: '',
            toolCallsMap: new Map(),
            finishReason: 'stop',
        };
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(':'))
                    continue; // Ignore empty lines and comments
                if (trimmed.startsWith('data:')) {
                    const dataStr = trimmed.slice(5).trim();
                    if (isAnthropic) {
                        AnthropicProtocol.processSseChunk(dataStr, streamState, onDelta);
                    }
                    else {
                        OpenAIProtocol.processSseChunk(dataStr, streamState, onDelta);
                    }
                }
            }
        }
        // Assemble final tool calls
        const assembledToolCalls = [];
        streamState.toolCallsMap.forEach((tc) => {
            let parsedArgs = {};
            try {
                parsedArgs = tc.argsStr ? JSON.parse(tc.argsStr) : {};
            }
            catch {
                parsedArgs = { raw: tc.argsStr };
            }
            assembledToolCalls.push({
                id: tc.id,
                name: tc.name,
                arguments: parsedArgs,
            });
        });
        return {
            content: streamState.content,
            toolCalls: assembledToolCalls.length > 0 ? assembledToolCalls : undefined,
            finishReason: assembledToolCalls.length > 0 ? 'tool_calls' : streamState.finishReason,
        };
    }
    async testConnection() {
        const startTime = Date.now();
        try {
            const pingRequest = {
                model: this.profile.model,
                messages: [{ role: 'user', content: 'Respond with OK' }],
                maxTokens: 10,
                temperature: 0.0,
            };
            const response = await this.generate(pingRequest);
            const latencyMs = Date.now() - startTime;
            return {
                success: true,
                latencyMs,
                model: this.profile.model,
                message: `Successfully connected to ${this.profile.name} (${this.profile.model}) in ${latencyMs}ms. Response: "${response.content.trim().slice(0, 30)}"`,
            };
        }
        catch (err) {
            const latencyMs = Date.now() - startTime;
            return {
                success: false,
                latencyMs,
                model: this.profile.model,
                error: err?.message || String(err),
                message: `Connection failed: ${err?.message || String(err)}`,
            };
        }
    }
}
//# sourceMappingURL=GenericModelClient.js.map