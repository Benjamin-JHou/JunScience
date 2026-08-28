import { spawn } from 'node:child_process';
import { ToolRegistry, globalToolRegistry } from '../tools/ToolRegistry.js';
import { ToolDefinition } from '../types/tools.js';
import { McpServerConfig, McpTool, JsonRpcRequest, JsonRpcResponse } from './McpTypes.js';

export class McpClientManager {
  private registry: ToolRegistry;
  private activeServers: Map<string, McpServerConfig> = new Map();

  constructor(registry: ToolRegistry = globalToolRegistry) {
    this.registry = registry;
  }

  public async registerExternalMcpServer(config: McpServerConfig): Promise<ToolDefinition<any>[]> {
    if (config.transport !== 'stdio' || !config.command) {
      throw new Error(`Only stdio transport is currently supported for MCP server "${config.name}".`);
    }

    const registeredTools: ToolDefinition<any>[] = [];

    // Probe the external server via stdio
    const tools = await this.queryToolsFromStdio(config.command, config.args || [], config.env || {});

    for (const mcpTool of tools) {
      const toolDef: ToolDefinition<any> = {
        name: `${config.id}_${mcpTool.name}`,
        description: mcpTool.description || `External MCP tool from ${config.name}`,
        category: 'databases',
        requiredPermission: 'NETWORK',
        inputSchema: mcpTool.inputSchema || { type: 'object' },
        execute: async (input, context) => {
          context.reportProgress(`Calling external MCP tool: ${mcpTool.name}...`, 30);
          const result = await this.callStdioTool(
            config.command!,
            config.args || [],
            config.env || {},
            mcpTool.name,
            input
          );
          return {
            success: !result.isError,
            output: result.content?.map((c: any) => c.text).join('\n') || result,
            execution: {
              id: '',
              toolName: `${config.id}_${mcpTool.name}`,
              category: 'databases',
              description: `Executed external MCP tool ${mcpTool.name}`,
              status: result.isError ? 'failed' : 'completed',
              logs: [`Server: ${config.name}`, `Tool: ${mcpTool.name}`],
            },
          };
        },
      };

      this.registry.register(toolDef);
      registeredTools.push(toolDef);
    }

    this.activeServers.set(config.id, config);
    return registeredTools;
  }

  private queryToolsFromStdio(
    cmd: string,
    args: string[],
    env: Record<string, string>
  ): Promise<McpTool[]> {
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args, {
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error(`Timeout querying tools from MCP server ${cmd}`));
      }, 8000);

      proc.stdout.on('data', (chunk) => {
        stdout += chunk.toString('utf-8');
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const res = JSON.parse(line.trim()) as JsonRpcResponse;
            if (res.result?.tools) {
              clearTimeout(timer);
              proc.kill();
              resolve(res.result.tools);
              return;
            }
          } catch {
            // ignore partial json
          }
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      const listReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
      };
      proc.stdin.write(JSON.stringify(listReq) + '\n');
    });
  }

  private callStdioTool(
    cmd: string,
    args: string[],
    env: Record<string, string>,
    toolName: string,
    toolArgs: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args, {
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error(`Timeout executing MCP tool ${toolName}`));
      }, 15000);

      proc.stdout.on('data', (chunk) => {
        stdout += chunk.toString('utf-8');
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const res = JSON.parse(line.trim()) as JsonRpcResponse;
            if (res.id === 2) {
              clearTimeout(timer);
              proc.kill();
              resolve(res.result || { isError: true, content: [{ text: res.error?.message }] });
              return;
            }
          } catch {
            // ignore partial json
          }
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      const callReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs,
        },
      };
      proc.stdin.write(JSON.stringify(callReq) + '\n');
    });
  }
}

export const globalMcpClientManager = new McpClientManager();
