import React, { useRef, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import { AgentMessage } from '../workspace/AgentMessage';
import { WorkspaceComposer } from '../workspace/WorkspaceComposer';
import { Loader2 } from 'lucide-react';

export const DesktopWorkspaceView: React.FC = () => {
  const { currentSession, status } = useAgent();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(currentSession.messages.length);

  useEffect(() => {
    if (currentSession.messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = currentSession.messages.length;
  }, [currentSession.messages.length]);

  const isWorking = status === 'thinking' || status === 'tool_calling' || status === 'generating';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {currentSession.messages.map((message) => (
          <AgentMessage key={message.id} message={message} />
        ))}

        {isWorking && (
          <div className="max-w-[840px] mx-auto flex items-center gap-3 p-3.5 rounded-xl bg-bg-surface border border-border text-accent shadow-sm animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-mono">
              {status === 'thinking' && 'Agent is reasoning and planning scientific approach...'}
              {status === 'tool_calling' && 'Querying scientific tools and running pipeline...'}
              {status === 'generating' && 'Synthesizing evidence and generating artifacts...'}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Persistent Bottom Composer */}
      <WorkspaceComposer />
    </div>
  );
};
