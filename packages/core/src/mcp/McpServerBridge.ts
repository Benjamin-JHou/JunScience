import { ToolRegistry, globalToolRegistry } from '../tools/ToolRegistry.js';
import { JsonRpcRequest, JsonRpcResponse, McpTool, McpCallToolResult } from './McpTypes.js';

export class McpServerBridge {
  private registry: ToolRegistry;

  constructor(registry: ToolRegistry = globalToolRegistry) {
    this.registry = registry;
  }

  public listTools(): McpTool[] {
    const tools = this.registry.list();
    return tools.map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema || { type: 'object' },
    }));
  }

  public async callTool(name: string, args: any, sessionId: string = 'mcp-session'): Promise<McpCallToolResult> {
    const result = await this.registry.execute(name, args, sessionId, 'mcp-client', 0);
    const textOutput = typeof result.output === 'string'
      ? result.output
      : JSON.stringify(result.output || result.error || {}, null, 2);

    return {
      content: [
        {
          type: 'text',
          text: textOutput,
        },
      ],
      isError: !result.success,
    };
  }

  public async handleJsonRpc(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (req.method === 'tools/list') {
      const tools = this.listTools();
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: { tools },
      };
    }

    if (req.method === 'tools/call') {
      const params = req.params || {};
      const { name, arguments: args } = params;
      if (!name) {
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: { code: -32602, message: 'Missing tool name in tools/call request' },
        };
      }

      try {
        const toolResult = await this.callTool(name, args);
        return {
          jsonrpc: '2.0',
          id: req.id,
          result: toolResult,
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: { code: -32000, message: err?.message || 'Tool execution error' },
        };
      }
    }

    if (req.method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: 'junscience-scientific-mcp',
            version: '1.0.0',
          },
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      error: { code: -32601, message: `Method not found: ${req.method}` },
    };
  }

  public startStdioServer(): void {
    let buffer = '';
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const req = JSON.parse(trimmed) as JsonRpcRequest;
          const res = await this.handleJsonRpc(req);
          process.stdout.write(JSON.stringify(res) + '\n');
        } catch (err: any) {
          const errRes: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: 0,
            error: { code: -32700, message: `Parse error: ${err.message}` },
          };
          process.stdout.write(JSON.stringify(errRes) + '\n');
        }
      }
    });
  }
}

export const globalMcpServerBridge = new McpServerBridge();
