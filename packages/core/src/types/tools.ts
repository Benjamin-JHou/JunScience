import { OperationType, ToolCategory, ToolExecution } from './runtime.js';
import type { EvidenceVerificationResult } from '../research-loop/EvidenceVerifier.js';

export interface ToolContext {
  sessionId: string;
  agentId: string;
  turnIndex: number;
  reportProgress: (log: string, percent?: number) => void;
}

export interface ToolExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  execution: ToolExecution;
  artifacts?: any[];
  citations?: any[];
  evidenceVerification?: EvidenceVerificationResult;
}

export interface ToolDefinition<Input = any> {
  name: string;
  description: string;
  category: ToolCategory;
  requiredPermission: OperationType;
  /** Concrete external origins/resources that must be authorized before execution. */
  permissionTargets?: string[];
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  execute(input: Input, context: ToolContext): Promise<ToolExecutionResult>;
}
