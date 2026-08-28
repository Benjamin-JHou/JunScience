import { ModelProvider } from './ModelProvider';
import { ModelProfile, ModelRequest, ModelResponse, ConnectionTestResult } from '../types/model';
export declare class GenericModelClient implements ModelProvider {
    name: string;
    private profile;
    constructor(profile: ModelProfile);
    getProfile(): ModelProfile;
    listModels(): Promise<string[]>;
    generate(request: ModelRequest): Promise<ModelResponse>;
    stream(request: ModelRequest, onDelta: (chunk: string) => void): Promise<ModelResponse>;
    testConnection(): Promise<ConnectionTestResult>;
}
//# sourceMappingURL=GenericModelClient.d.ts.map