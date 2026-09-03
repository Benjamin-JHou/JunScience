import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types/tools.js';
import { globalPermissionManager } from '../sandbox/PermissionManager.js';
import { globalEventBus } from '../core/EventBus.js';
import { ToolExecution } from '../types/runtime.js';
import { globalHookRegistry } from '../hooks/HookRegistry.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public listByCategory(category: string): ToolDefinition[] {
    return this.list().filter((t) => t.category === category);
  }

  public async execute(
    name: string,
    input: any,
    sessionId: string,
    agentId: string,
    turnIndex: number = 0
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`[ToolRegistry] Tool '${name}' not found.`);
    }

    const toolId = `tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const startTime = Date.now();

    const hookContext = {
      sessionId,
      turnIndex,
      agentId,
      event: 'PreToolUse' as const,
      timestamp: new Date().toISOString(),
    };

    const preHookResult = await globalHookRegistry.triggerPreToolUse(hookContext, {
      toolName: name,
      toolArguments: input,
      isExternalApi: tool.requiredPermission === 'NETWORK',
    });
    if (!preHookResult.proceed) {
      const errorMsg = preHookResult.message || `Tool '${name}' was blocked by a mandatory pre-execution hook.`;
      return {
        success: false,
        output: null,
        error: errorMsg,
        execution: {
          id: toolId,
          toolName: name,
          category: tool.category,
          description: tool.description,
          status: 'failed',
          logs: [errorMsg],
        },
      };
    }

    // Permission check
    const permissionTargets = tool.permissionTargets?.length ? tool.permissionTargets : [name];
    let allowed = true;
    for (const target of permissionTargets) {
      if (!(await globalPermissionManager.checkPermission(sessionId, tool.requiredPermission, target, `Execute tool ${name}`))) {
        allowed = false;
        break;
      }
    }

    if (!allowed) {
      const errorMsg = `Permission denied for ${tool.requiredPermission} on ${name}`;
      globalEventBus.emit({
        type: 'tool.error',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: { toolId, error: errorMsg },
      });
      return {
        success: false,
        output: null,
        error: errorMsg,
        execution: {
          id: toolId,
          toolName: name,
          category: tool.category,
          description: tool.description,
          status: 'failed',
          logs: [errorMsg],
        },
      };
    }

    // Emit tool.started
    globalEventBus.emit({
      type: 'tool.started',
      sessionId,
      timestamp: new Date().toISOString(),
      payload: {
        toolId,
        toolName: name,
        category: tool.category,
        input,
      },
    });

    const logs: string[] = [];

    const context: ToolContext = {
      sessionId,
      agentId,
      turnIndex,
      reportProgress: (log: string, percent?: number) => {
        logs.push(log);
        globalEventBus.emit({
          type: 'tool.progress',
          sessionId,
          timestamp: new Date().toISOString(),
          payload: { toolId, log, percent },
        });
      },
    };

    try {
      const result = await tool.execute(input, context);
      const durationMs = Date.now() - startTime;
      const duration = `${(durationMs / 1000).toFixed(1)}s`;

      const execution: ToolExecution = {
        ...result.execution,
        id: toolId,
        toolName: name,
        category: tool.category,
        duration,
        logs: [...logs, ...(result.execution.logs || [])],
      };

      if (result.success) {
        const postHookResult = await globalHookRegistry.triggerPostToolUse(
          { ...hookContext, event: 'PostToolUse' },
          {
            toolName: name,
            toolArguments: input,
            result: { callId: toolId, name, output: result.output, error: result.error, execution },
            artifacts: result.artifacts,
            citations: result.citations,
          }
        );
        if (!postHookResult.proceed || postHookResult.verdict === 'REJECTED') {
          const errorMsg = postHookResult.message || `Tool '${name}' output was rejected by the evidence verifier.`;
          return {
            ...result,
            success: false,
            output: null,
            error: errorMsg,
            execution: { ...execution, status: 'failed', logs: [...execution.logs, errorMsg] },
            evidenceVerification: postHookResult.evidenceVerification,
          };
        }
        result.evidenceVerification = postHookResult.evidenceVerification;
      }

      globalEventBus.emit({
        type: 'tool.completed',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: { toolId, execution },
      });

      return {
        ...result,
        execution,
      };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      globalEventBus.emit({
        type: 'tool.error',
        sessionId,
        timestamp: new Date().toISOString(),
        payload: { toolId, error: errorMsg },
      });

      return {
        success: false,
        output: null,
        error: errorMsg,
        execution: {
          id: toolId,
          toolName: name,
          category: tool.category,
          description: tool.description,
          status: 'failed',
          logs: [...logs, `Error: ${errorMsg}`],
        },
      };
    }
  }
}

export const globalToolRegistry = new ToolRegistry();
