export type AgentStatus =
  | 'idle'
  | 'thinking'
  | 'planning'
  | 'tool_calling'
  | 'executing'
  | 'generating'
  | 'waiting_for_permission'
  | 'completed'
  | 'error'
  | 'cancelled';

export type ToolCategory =
  | 'literature'
  | 'analysis'
  | 'code'
  | 'experiment'
  | 'molecule'
  | 'databases'
  | 'execution'
  | 'artifacts';

export interface ToolExecution {
  id: string;
  toolName: string;
  category: ToolCategory;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  logs: string[];
  duration?: string;
  resultSummary?: string;
}

export interface Artifact {
  id: string;
  type: 'figure' | 'dataset' | 'table' | 'protein' | 'molecule' | 'code' | 'report';
  title: string;
  description: string;
  metadata?: Record<string, string | number>;
  generatedFrom?: string;
  downloadUrl?: string;
  previewData?: any;
}

export interface Citation {
  id: string;
  index: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  pmid?: string;
  abstractSnippet?: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  status?: AgentStatus;
  toolExecutions?: ToolExecution[];
  artifacts?: Artifact[];
  citations?: Citation[];
}

export interface AgentSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: AgentStatus;
  messages: AgentMessage[];
}
