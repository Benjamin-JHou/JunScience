import { ModelMessage } from '../types/model.js';
import { EvidenceTracker } from './EvidenceTracker.js';

export interface MemoryCompactorOptions {
  messageThreshold?: number;
  recentTurnsToKeep?: number;
}

export class MemoryCompactor {
  private messageThreshold: number;
  private recentTurnsToKeep: number;

  constructor(options?: MemoryCompactorOptions) {
    this.messageThreshold = options?.messageThreshold || 8; // Trigger if messages > 8
    this.recentTurnsToKeep = options?.recentTurnsToKeep || 4; // Keep last 4 messages verbatim
  }

  public shouldCompact(messages: ModelMessage[]): boolean {
    return messages.length > this.messageThreshold;
  }

  public compact(
    messages: ModelMessage[],
    evidenceTracker: EvidenceTracker,
    inquiry: string
  ): { compactedMessages: ModelMessage[]; summarizedCount: number } {
    if (messages.length <= this.recentTurnsToKeep + 2) {
      return { compactedMessages: messages, summarizedCount: 0 };
    }

    const systemPrompt = messages[0];
    const initialUserPrompt = messages[1];

    // Messages to compress: from index 2 to (length - recentTurnsToKeep)
    const splitIndex = messages.length - this.recentTurnsToKeep;
    const oldMessages = messages.slice(2, splitIndex);
    const recentMessages = messages.slice(splitIndex);

    // Extract tool calls and reasoning from old messages
    const toolInteractions: { tool: string; snippet: string }[] = [];
    const reasoningThoughts: string[] = [];

    for (const msg of oldMessages) {
      if (msg.role === 'tool' && msg.name) {
        const contentStr = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        toolInteractions.push({
          tool: msg.name,
          snippet: contentStr.slice(0, 150).replace(/\n/g, ' '),
        });
      } else if (msg.role === 'assistant' && msg.content && !msg.content.startsWith('Called tool')) {
        reasoningThoughts.push(msg.content.slice(0, 200).replace(/\n/g, ' '));
      }
    }

    // Build structured compacted summary retaining all EV-xxx references
    const evidenceLog = evidenceTracker.formatEvidenceContext();

    let summaryBlock = `### 🧠 Compacted Scientific Working Memory (Lossless Evidence Anchors)\n`;
    summaryBlock += `**Target Inquiry:** "${inquiry}"\n\n`;
    summaryBlock += `**Compressed Investigation History (${oldMessages.length} steps summarized):**\n`;
    
    if (reasoningThoughts.length > 0) {
      summaryBlock += `- *Prior Analytical Trajectory:* ${reasoningThoughts.slice(-3).join(' ➔ ')}\n`;
    }

    summaryBlock += `- *Completed Tool Probes:* ${toolInteractions.map((t) => `${t.tool} (${t.snippet.slice(0, 40)}...)`).join('; ') || 'None'}\n\n`;
    summaryBlock += `**Active Empirical Evidence Register (All EV-xxx records immutable):**\n`;
    summaryBlock += `${evidenceLog}\n\n`;
    summaryBlock += `*Instruction:* Continue investigation using new tool probes or proceed to synthesis. Reference evidence using [Evidence: EV-x].`;

    const compactedMessage: ModelMessage = {
      role: 'system',
      content: summaryBlock,
    };

    const compactedMessages: ModelMessage[] = [
      systemPrompt,
      initialUserPrompt,
      compactedMessage,
      ...recentMessages,
    ];

    return {
      compactedMessages,
      summarizedCount: oldMessages.length,
    };
  }
}

export const globalMemoryCompactor = new MemoryCompactor();
