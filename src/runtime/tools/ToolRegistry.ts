import { ToolDefinition, ToolContext, ToolExecutionResult } from '../types/tools';
import { globalPermissionManager } from '../sandbox/PermissionManager';
import { globalEventBus } from '../core/EventBus';
import { ToolExecution } from '../../types/agent';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  public register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Overwriting existing tool: ${tool.name}`);
    }
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

    // Permission check
    const allowed = await globalPermissionManager.checkPermission(
      sessionId,
      tool.requiredPermission,
      name,
      `Execute tool ${name}`
    );

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
          category: tool.category as any,
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
        category: tool.category as any,
        duration,
        logs: [...logs, ...(result.execution.logs || [])],
      };

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
          category: tool.category as any,
          description: tool.description,
          status: 'failed',
          logs: [...logs, `Error: ${errorMsg}`],
        },
      };
    }
  }
}

export const globalToolRegistry = new ToolRegistry();
