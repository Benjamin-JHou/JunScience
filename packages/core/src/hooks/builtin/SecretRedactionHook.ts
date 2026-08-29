import { HookDefinition, HookContext, PreToolUsePayload, HookResult } from '../types.js';

export class SecretRedactionHook {
  // Regex patterns for sensitive secrets and tokens
  private patterns: { name: string; regex: RegExp }[] = [
    { name: 'OpenAI/DeepSeek/API Key', regex: /\b(?:sk|pk)-[a-zA-Z0-9_-]{20,}\b/g },
    { name: 'Bearer Token', regex: /\bBearer\s+[a-zA-Z0-9_\-\.]{24,}\b/gi },
    { name: 'GitHub Personal Access Token', regex: /\bgh[pousr]_[a-zA-Z0-9]{36}\b/g },
    { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/g },
    { name: 'RSA/EC Private Key Header', regex: /-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH|ENCRYPTED|PRIVATE)?\s*KEY-----/i },
    { name: 'Chinese Resident ID Number', regex: /\b[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g },
    { name: 'Credit Card Number', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g },
  ];

  public getDefinition(): HookDefinition {
    return {
      id: 'secret-redaction',
      name: 'Secret & Credential Redaction Guard',
      description: 'Scans all outgoing tool inputs and external payloads for API keys, private credentials, and sensitive identification numbers before execution.',
      events: ['PreToolUse'],
      priority: 5, // Highest priority before tool execution
      enabled: true,
      handler: async (context: HookContext, payload: PreToolUsePayload): Promise<HookResult> => {
        const { toolName, toolArguments } = payload;
        const argStr = JSON.stringify(toolArguments || {});

        const detectedLeaks: string[] = [];

        for (const pattern of this.patterns) {
          if (pattern.regex.test(argStr)) {
            detectedLeaks.push(pattern.name);
          }
        }

        if (detectedLeaks.length > 0) {
          return {
            proceed: false,
            verdict: 'BLOCKED',
            message: `[SecretRedaction BLOCKED]: Sensitive credential / secret leak detected in tool arguments for "${toolName}": (${detectedLeaks.join(', ')}). Transmission intercepted.`,
            issues: detectedLeaks,
          };
        }

        return {
          proceed: true,
          verdict: 'PASSED',
        };
      },
    };
  }
}
