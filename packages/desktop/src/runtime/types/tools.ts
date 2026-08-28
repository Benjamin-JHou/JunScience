import { OperationType } from './runtime';
import { ToolExecution } from '../../types/agent';

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
}

export interface ToolDefinition<Input = any> {
  name: string;
  description: string;
  category: 'literature' | 'databases' | 'execution' | 'artifacts' | 'analysis';
  requiredPermission: OperationType;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  execute(input: Input, context: ToolContext): Promise<ToolExecutionResult>;
}
