import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

interface AgentInputProps {
  className?: string;
  autoFocus?: boolean;
}

export const AgentInput: React.FC<AgentInputProps> = ({ className = '', autoFocus = false }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { submitPrompt, status } = useAgent();

  const isBusy = status === 'thinking' || status === 'tool_calling' || status === 'generating';

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isBusy) return;
    submitPrompt(prompt);
    setPrompt('');
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-bg-surface border border-border hover:border-accent/40 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft shadow-sm transition-all px-4 py-2.5 flex items-center gap-3 ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or describe your research..."
        rows={1}
        disabled={isBusy}
        className="w-full bg-transparent resize-none border-none outline-none text-[14.5px] placeholder:text-text-muted text-text-primary leading-normal disabled:opacity-50 py-1"
        style={{ minHeight: '34px', maxHeight: '120px' }}
      />

      {/* Action Button: Sleek rounded blue button with chevron right */}
      <button
        onClick={handleSubmit}
        disabled={!prompt.trim() || isBusy}
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm"
        title="Send query (Enter)"
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};
