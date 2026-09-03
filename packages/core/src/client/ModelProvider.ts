import { ModelRequest, ModelResponse, ConnectionTestResult } from '../types/model.js';

export interface ModelProvider {
  name: string;
  /** Whether requests leave the local JunScience process/host boundary. */
  readonly isExternal?: boolean;
  listModels(): Promise<string[]>;
  generate(request: ModelRequest): Promise<ModelResponse>;
  stream(request: ModelRequest, onDelta: (chunk: string) => void): Promise<ModelResponse>;
  testConnection?(): Promise<ConnectionTestResult>;
}
