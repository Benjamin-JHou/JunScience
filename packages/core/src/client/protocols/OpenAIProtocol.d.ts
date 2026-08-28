import { ModelProfile, ModelRequest, ModelResponse } from '../../types/model';
export declare class OpenAIProtocol {
    static buildUrl(profile: ModelProfile): string;
    static buildHeaders(profile: ModelProfile): Record<string, string>;
    static buildPayload(request: ModelRequest, stream?: boolean): Record<string, any>;
    static parseResponse(json: any): ModelResponse;
    static processSseChunk(dataStr: string, state: {
        content: string;
        toolCallsMap: Map<number, {
            id: string;
            name: string;
            argsStr: string;
        }>;
        finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
    }, onDelta?: (chunk: string) => void): void;
}
//# sourceMappingURL=OpenAIProtocol.d.ts.map