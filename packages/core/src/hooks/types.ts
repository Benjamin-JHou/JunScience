import { RuntimeSession, Turn, ToolCall, ToolResult, Artifact, Citation } from '../types/runtime.js';
import { EvidenceRecord, EvidenceTracker } from '../research-loop/EvidenceTracker.js';
import { EvidenceVerificationResult } from '../research-loop/EvidenceVerifier.js';
import { PlanTracker } from '../research-loop/PlanTracker.js';
import { SkillRegistry } from '../skills/SkillRegistry.js';

export type HookEventType = 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'Stop';

export interface HookContext {
  sessionId: string;
  turnIndex: number;
  agentId: string;
  event: HookEventType;
  timestamp: string;
}

export interface PreToolUsePayload {
  toolName: string;
  toolArguments: Record<string, any>;
  isExternalApi?: boolean;
}

export interface PostToolUsePayload {
  toolName: string;
  toolArguments: Record<string, any>;
  result: ToolResult;
  artifacts?: Artifact[];
  citations?: Citation[];
}

export interface SessionStartPayload {
  session: RuntimeSession;
  userInquiry: string;
  skillRegistry?: SkillRegistry;
}

export interface StopPayload {
  session: RuntimeSession;
  turnIndex: number;
  userInquiry: string;
  finalContent: string;
  evidenceTracker: EvidenceTracker;
  planTracker?: PlanTracker;
}

export type HookVerdict = 'PASSED' | 'ADOPTED' | 'FLAGGED' | 'REJECTED' | 'BLOCKED' | 'MODIFIED';

export interface HookResult {
  proceed: boolean;
  verdict?: HookVerdict;
  message?: string;
  mutatedArguments?: Record<string, any>;
  mutatedOutput?: any;
  evidenceVerification?: EvidenceVerificationResult;
  issues?: string[];
}

export interface HookDefinition {
  id: string;
  name: string;
  description: string;
  events: HookEventType[];
  priority?: number; // lower number = higher priority (e.g. 10 before 50)
  enabled: boolean;
  handler: (context: HookContext, payload: any) => Promise<HookResult> | HookResult;
}
