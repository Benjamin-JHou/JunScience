import React from 'react';
import { User, Database, BookOpen, Layers } from 'lucide-react';
import { AgentMessage as AgentMessageType } from '../../types/agent';
import { ToolExecutionCard } from './ToolExecutionCard';
import { ArtifactCard } from './ArtifactCard';
import { CitationCard } from './CitationCard';
import { JunScienceLogo } from '../common/JunScienceLogo';

interface AgentMessageProps {
  message: AgentMessageType;
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start gap-3.5 my-6 max-w-[840px] mx-auto">
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={16} />
        </div>
        <div className="flex-1 bg-bg-surface border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1 select-none">
            <span className="font-semibold text-text-primary">You (Researcher)</span>
            <span>{message.timestamp}</span>
          </div>
          <div className="text-[14.5px] text-text-primary leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Agent Response
  return (
    <div className="flex items-start gap-3.5 my-6 max-w-[840px] mx-auto">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent/20 to-accent-secondary/20 border border-accent/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <JunScienceLogo size={20} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Agent Name & Header */}
        <div className="flex items-center justify-between text-xs text-text-muted mb-2 select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">JunScience Agent</span>
            <span className="font-mono text-[10.5px] px-1.5 py-0.2 rounded bg-accent-soft text-accent border border-accent/20">
              AI Research Partner
            </span>
          </div>
          <span>{message.timestamp}</span>
        </div>

        {/* Executed Tools Section */}
        {message.toolExecutions && message.toolExecutions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 select-none">
              <Layers size={13} className="text-accent" />
              <span>Tool Executions ({message.toolExecutions.length})</span>
            </div>
            <div className="space-y-2">
              {message.toolExecutions.map((tool) => (
                <ToolExecutionCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* Main Synthesized Text Content */}
        <div className="p-4 rounded-2xl bg-bg-surface border border-border text-[14px] text-text-primary leading-relaxed space-y-3 shadow-sm">
          {message.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-[16px] font-bold text-text-primary pt-1">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
              return (
                <div key={idx} className="pl-2 border-l-2 border-accent/40 py-0.5 my-2">
                  <p className="text-text-secondary">{paragraph}</p>
                </div>
              );
            }
            return (
              <p key={idx} className="text-text-secondary">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Generated Scientific Artifacts */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 select-none">
              <Database size={13} className="text-accent" />
              <span>Scientific Artifacts ({message.artifacts.length})</span>
            </div>
            {message.artifacts.map((art) => (
              <ArtifactCard key={art.id} artifact={art} />
            ))}
          </div>
        )}

        {/* Scientific Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 select-none">
              <BookOpen size={13} className="text-accent" />
              <span>Evidence & Citations ({message.citations.length})</span>
            </div>
            <div className="space-y-1">
              {message.citations.map((cit) => (
                <CitationCard key={cit.id} citation={cit} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
