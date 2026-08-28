import { ModelProvider } from './ModelProvider';
import { ModelRequest, ModelResponse, ConnectionTestResult } from '../types/model';
export declare class ScientificMockProvider implements ModelProvider {
    name: string;
    listModels(): Promise<string[]>;
    testConnection(): Promise<ConnectionTestResult>;
    generate(request: ModelRequest): Promise<ModelResponse>;
    stream(request: ModelRequest, onDelta: (chunk: string) => void): Promise<ModelResponse>;
    private simulateScientificResponse;
}
export declare const fallbackMockProvider: ScientificMockProvider;
//# sourceMappingURL=ScientificMockProvider.d.ts.map