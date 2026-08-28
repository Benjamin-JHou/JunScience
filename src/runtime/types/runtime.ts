import { AgentStatus, ToolExecution, Artifact, Citation } from '../../types/agent';

export type AgentId =
  | 'research'
  | 'biology'
  | 'chemistry'
  | 'ml'
  | 'critic'
  | 'literature-reviewer'
  | 'plan';

export type OperationType =
  | 'READ'
  | 'WRITE'
  | 'EXECUTE'
  | 'NETWORK'
  | 'INSTALL'
  | 'DELETE';

export type PermissionDecision = 'allow' | 'deny' | 'ask';

export interface PermissionRequest {
  id: string;
  operation: OperationType;
  target: string;
  reason: string;
  timestamp: string;
  decision?: PermissionDecision;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  callId: string;
  name: string;
  output: any;
  error?: string;
  execution: ToolExecution;
}

export interface Turn {
  index: number;
  userInput: string;
  thought?: string;
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
  agentResponse: string;
  status: AgentStatus;
  startedAt: string;
  completedAt?: string;
}

export interface RuntimeSession {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeAgent: AgentId;
  activeModel: string;
  status: AgentStatus;
  turns: Turn[];
  artifacts: Artifact[];
  citations: Citation[];
  metadata: Record<string, any>;
}
