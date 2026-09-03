import {
  HookDefinition,
  HookEventType,
  HookContext,
  PreToolUsePayload,
  PostToolUsePayload,
  SessionStartPayload,
  StopPayload,
  HookResult,
} from './types.js';
import { EvidenceVerifierHook } from './builtin/EvidenceVerifierHook.js';
import { ClinicalDataGateHook } from './builtin/ClinicalDataGateHook.js';
import { SecretRedactionHook } from './builtin/SecretRedactionHook.js';
import { EvidenceCompletenessHook } from './builtin/EvidenceCompletenessHook.js';

export class HookRegistry {
  private hooks: Map<string, HookDefinition> = new Map();

  constructor(autoRegisterBuiltins: boolean = true) {
    if (autoRegisterBuiltins) {
      this.registerBuiltinHooks();
    }
  }

  private registerBuiltinHooks(): void {
    const secretRedaction = new SecretRedactionHook();
    const clinicalGate = new ClinicalDataGateHook();
    const evidenceVerifier = new EvidenceVerifierHook();
    const evidenceCompleteness = new EvidenceCompletenessHook();

    this.register(secretRedaction.getDefinition());
    this.register(clinicalGate.getDefinition());
    this.register(evidenceVerifier.getDefinition());
    this.register(evidenceCompleteness.getDefinition());
  }

  public register(hook: HookDefinition): void {
    this.hooks.set(hook.id, hook);
  }

  public unregister(hookId: string): boolean {
    return this.hooks.delete(hookId);
  }

  public get(hookId: string): HookDefinition | undefined {
    return this.hooks.get(hookId);
  }

  public list(): HookDefinition[] {
    return Array.from(this.hooks.values()).sort((a, b) => (a.priority || 50) - (b.priority || 50));
  }

  public listByEvent(event: HookEventType): HookDefinition[] {
    return this.list().filter((h) => h.enabled && h.events.includes(event));
  }

  public enableHook(hookId: string): boolean {
    const hook = this.hooks.get(hookId);
    if (hook) {
      hook.enabled = true;
      return true;
    }
    return false;
  }

  public disableHook(hookId: string): boolean {
    const hook = this.hooks.get(hookId);
    if (hook) {
      hook.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * Trigger all PreToolUse hooks before a tool executes.
   */
  public async triggerPreToolUse(context: HookContext, payload: PreToolUsePayload): Promise<HookResult> {
    const hooks = this.listByEvent('PreToolUse');
    for (const hook of hooks) {
      const res = await hook.handler(context, payload);
      if (!res.proceed) {
        return res; // Block tool execution immediately
      }
    }
    return { proceed: true, verdict: 'PASSED' };
  }

  /**
   * Trigger all PostToolUse hooks after a tool execution completes.
   */
  public async triggerPostToolUse(context: HookContext, payload: PostToolUsePayload): Promise<HookResult> {
    const hooks = this.listByEvent('PostToolUse');
    let compositeResult: HookResult = { proceed: true, verdict: 'PASSED' };

    for (const hook of hooks) {
      const res = await hook.handler(context, payload);
      if (!res.proceed) {
        return res; // Immediate rejection
      }
      if (res.verdict === 'FLAGGED' || res.verdict === 'ADOPTED') {
        compositeResult = res;
      }
    }
    return compositeResult;
  }

  /**
   * Trigger SessionStart hooks at the start of a research run.
   */
  public async triggerSessionStart(context: HookContext, payload: SessionStartPayload): Promise<HookResult> {
    const hooks = this.listByEvent('SessionStart');
    for (const hook of hooks) {
      const res = await hook.handler(context, payload);
      if (!res.proceed) {
        return res;
      }
    }
    return { proceed: true, verdict: 'PASSED' };
  }

  /**
   * Trigger Stop hooks at task completion.
   */
  public async triggerStop(context: HookContext, payload: StopPayload): Promise<HookResult> {
    const hooks = this.listByEvent('Stop');
    const allIssues: string[] = [];
    let hasWarning = false;
    let shouldProceed = true;

    for (const hook of hooks) {
      const res = await hook.handler(context, payload);
      if (!res.proceed) {
        shouldProceed = false;
      }
      if (res.issues) {
        allIssues.push(...res.issues);
      }
      if (res.verdict === 'FLAGGED' || res.verdict === 'REJECTED') {
        hasWarning = true;
      }
    }

    return {
      proceed: shouldProceed,
      verdict: hasWarning ? 'FLAGGED' : 'PASSED',
      issues: allIssues,
      message: allIssues.length > 0 ? `Stop validation completed with ${allIssues.length} issue(s).` : 'Stop validation passed cleanly.',
    };
  }
}

export const globalHookRegistry = new HookRegistry();
