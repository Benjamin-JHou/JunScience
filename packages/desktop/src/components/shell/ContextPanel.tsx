import React from 'react';
import {
  BookOpen,
  BarChart3,
  FlaskConical,
  Code2,
  Atom,
  PanelRightClose,
  PanelRight,
} from 'lucide-react';
import { mockContextTools } from '../../data/mockTools';
import { mockContextTips as tipsList } from '../../data/mockStats';
import { useNav } from '../../context/NavContext';
import { useAgent } from '../../context/AgentContext';

interface ContextPanelProps {
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  BarChart3,
  FlaskConical,
  Code2,
  Atom,
};

export const ContextPanel: React.FC<ContextPanelProps> = ({ className = '' }) => {
  const { isContextPanelOpen, setIsContextPanelOpen } = useNav();
  const { submitPrompt } = useAgent();

  if (!isContextPanelOpen) {
    return (
      <div className="flex flex-col items-center py-3 border-l border-border bg-bg-surface w-[44px] transition-all">
        <button
          onClick={() => setIsContextPanelOpen(true)}
          className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Open Context Panel"
        >
          <PanelRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={`flex flex-col h-full w-[260px] lg:w-[280px] bg-bg-surface border-l border-border select-none overflow-y-auto transition-all ${className}`}
    >
      {/* Section 1: Tools */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[14px] font-semibold text-text-primary">
            Tools
          </h3>
          <button
            onClick={() => setIsContextPanelOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Collapse context panel"
          >
            <PanelRightClose size={15} />
          </button>
        </div>

        <div className="space-y-3">
          {mockContextTools.map((tool) => {
            const Icon = iconMap[tool.iconName] || BookOpen;
            return (
              <div
                key={tool.id}
                onClick={() => submitPrompt(`Launch ${tool.name} workflow and retrieve current active records.`)}
                className="group flex items-start gap-3 p-1.5 rounded-lg hover:bg-bg-hover cursor-pointer transition-all"
              >
                <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                  <Icon size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {tool.name}
                  </span>
                  <span className="text-[11px] text-text-muted leading-tight mt-0.5">
                    {tool.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Tips */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-text-primary mb-1">
          Tips
        </h3>
        <p className="text-[12px] text-text-secondary mb-2.5">Try asking:</p>
        <div className="space-y-1.5 text-[12.5px]">
          {tipsList.map((tip) => (
            <button
              key={tip.id}
              onClick={() => submitPrompt(`${tip.prompt} using our current project datasets.`)}
              className="w-full text-left flex items-center gap-2 px-1.5 py-1 rounded text-text-secondary hover:text-accent transition-colors group"
            >
              <span className="text-text-muted group-hover:text-accent">•</span>
              <span className="truncate">{tip.prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
