import { ModelRequest, ModelResponse, ConnectionTestResult } from '../types/model';
export interface ModelProvider {
    name: string;
    listModels(): Promise<string[]>;
    generate(request: ModelRequest): Promise<ModelResponse>;
    stream(request: ModelRequest, onDelta: (chunk: string) => void): Promise<ModelResponse>;
    testConnection?(): Promise<ConnectionTestResult>;
}
//# sourceMappingURL=ModelProvider.d.ts.map