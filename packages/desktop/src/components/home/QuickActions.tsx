import React from 'react';
import { BookOpen, BarChart2, FlaskConical, Code2, ChevronDown } from 'lucide-react';
import { mockQuickActions } from '../../data/mockTools';
import { useAgent } from '../../context/AgentContext';

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  BarChart2,
  FlaskConical,
  Code: Code2,
};

export const QuickActions: React.FC = () => {
  const { submitPrompt } = useAgent();

  return (
    <div className="flex flex-wrap items-center gap-2.5 mt-3 select-none">
      {mockQuickActions.map((action) => {
        const Icon = iconMap[action.iconName] || BookOpen;
        const isMore = action.id === 'qa-more';

        return (
          <button
            key={action.id}
            onClick={() => submitPrompt(action.prompt)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-bg-surface hover:bg-bg-hover hover:border-accent/40 text-text-secondary hover:text-text-primary text-[12.5px] font-medium transition-all group shadow-sm"
          >
            {!isMore ? (
              <Icon size={14} className="text-text-muted group-hover:text-accent transition-colors" />
            ) : null}
            <span>{action.label}</span>
            {isMore && <ChevronDown size={13} className="text-text-muted" />}
          </button>
        );
      })}
    </div>
  );
};
