import React, { useState } from 'react';
import { ArrowRight, Paperclip, Database } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const WorkspaceComposer: React.FC = () => {
  const [input, setInput] = useState('');
  const { submitPrompt, status } = useAgent();

  const isBusy = status === 'thinking' || status === 'tool_calling' || status === 'generating';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isBusy) return;
    submitPrompt(input);
    setInput('');
  };

  return (
    <div className="border-t border-border bg-bg-surface p-4">
      <div className="max-w-[840px] mx-auto">
        <div className="relative rounded-xl bg-bg-elevated border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft transition-all p-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question, request tool rerun, or refine artifacts..."
            rows={2}
            disabled={isBusy}
            className="w-full bg-transparent resize-none border-none outline-none text-[13.5px] placeholder:text-text-muted text-text-primary leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs select-none">
            <div className="flex items-center gap-2 text-text-muted">
              <button
                type="button"
                className="p-1 rounded hover:bg-bg-hover hover:text-text-secondary transition-colors"
                title="Attach file / PDB / CSV"
              >
                <Paperclip size={14} />
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-bg-hover hover:text-text-secondary transition-colors"
                title="Select database connector"
              >
                <Database size={14} />
              </button>
              <span className="text-[11px] font-mono opacity-60">⌘K for commands</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isBusy}
                className="px-3 py-1.5 rounded-lg bg-accent hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Send</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
