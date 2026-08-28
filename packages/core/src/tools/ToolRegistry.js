import { globalPermissionManager } from '../sandbox/PermissionManager';
import { globalEventBus } from '../core/EventBus';
export class ToolRegistry {
    tools = new Map();
    register(tool) {
        this.tools.set(tool.name, tool);
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return Array.from(this.tools.values());
    }
    listByCategory(category) {
        return this.list().filter((t) => t.category === category);
    }
    async execute(name, input, sessionId, agentId, turnIndex = 0) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`[ToolRegistry] Tool '${name}' not found.`);
        }
        const toolId = `tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const startTime = Date.now();
        // Permission check
        const allowed = await globalPermissionManager.checkPermission(sessionId, tool.requiredPermission, name, `Execute tool ${name}`);
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
        const logs = [];
        const context = {
            sessionId,
            agentId,
            turnIndex,
            reportProgress: (log, percent) => {
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
            const execution = {
                ...result.execution,
                id: toolId,
                toolName: name,
                category: tool.category,
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
        }
        catch (err) {
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
//# sourceMappingURL=ToolRegistry.js.map