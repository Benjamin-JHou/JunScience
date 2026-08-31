import { ToolExecution, Artifact, Citation } from './runtime.js';

export interface BaseEvent<T extends string, P> {
  type: T;
  sessionId: string;
  timestamp: string;
  payload: P;
}

export type SessionCreatedEvent = BaseEvent<
  'session.created',
  { sessionId: string; title: string; agentId: string }
>;

export type SessionResumedEvent = BaseEvent<
  'session.resumed',
  { sessionId: string }
>;

export type SessionDeletedEvent = BaseEvent<
  'session.deleted',
  { sessionId: string }
>;

export type SessionRenamedEvent = BaseEvent<
  'session.renamed',
  { sessionId: string; title: string }
>;

export type AgentStartedEvent = BaseEvent<
  'agent.started',
  { agentId: string; objective: string }
>;

export type AgentThinkingEvent = BaseEvent<
  'agent.thinking',
  { thought: string; phase?: string }
>;

export type AgentMessageDeltaEvent = BaseEvent<
  'agent.message.delta',
  { messageId: string; delta: string }
>;

export type AgentMessageCompletedEvent = BaseEvent<
  'agent.message.completed',
  { messageId: string; fullContent: string }
>;

export type ToolStartedEvent = BaseEvent<
  'tool.started',
  { toolId: string; toolName: string; category: string; input: Record<string, any> }
>;

export type ToolProgressEvent = BaseEvent<
  'tool.progress',
  { toolId: string; log: string; percent?: number }
>;

export type ToolCompletedEvent = BaseEvent<
  'tool.completed',
  { toolId: string; execution: ToolExecution }
>;

export type ToolErrorEvent = BaseEvent<
  'tool.error',
  { toolId: string; error: string }
>;

export type ArtifactCreatedEvent = BaseEvent<
  'artifact.created',
  { artifact: Artifact }
>;

export type CitationCreatedEvent = BaseEvent<
  'citation.created',
  { citation: Citation }
>;

export type JobCreatedEvent = BaseEvent<
  'job.created',
  { jobId: string; name: string; target: string }
>;

export type JobProgressEvent = BaseEvent<
  'job.progress',
  { jobId: string; progress: number; statusText: string }
>;

export type JobCompletedEvent = BaseEvent<
  'job.completed',
  { jobId: string; resultSummary: string }
>;

export type PermissionRequestedEvent = BaseEvent<
  'permission.requested',
  { permissionId: string; operation: string; target: string; reason: string }
>;

export type PlanCreatedEvent = BaseEvent<
  'plan.created',
  { planId: string; inquiry: string; tasks: any[] }
>;

export type PlanTaskUpdatedEvent = BaseEvent<
  'plan.task.updated',
  { planId: string; taskId: string; status: string; task: any }
>;

export type PlanTaskCompletedEvent = BaseEvent<
  'plan.task.completed',
  { planId: string; taskId: string; evidenceIds: string[]; resultNote?: string }
>;

export type RuntimeEvent =
  | SessionCreatedEvent
  | SessionResumedEvent
  | SessionDeletedEvent
  | SessionRenamedEvent
  | AgentStartedEvent
  | AgentThinkingEvent
  | AgentMessageDeltaEvent
  | AgentMessageCompletedEvent
  | ToolStartedEvent
  | ToolProgressEvent
  | ToolCompletedEvent
  | ToolErrorEvent
  | ArtifactCreatedEvent
  | CitationCreatedEvent
  | JobCreatedEvent
  | JobProgressEvent
  | JobCompletedEvent
  | PermissionRequestedEvent
  | PlanCreatedEvent
  | PlanTaskUpdatedEvent
  | PlanTaskCompletedEvent;

export type EventType = RuntimeEvent['type'];
