import React from 'react';
import { FolderKanban, LineChart, FileText, Clock } from 'lucide-react';
import { mockResearchStats } from '../../data/mockStats';

const statIcons: Record<string, React.ElementType> = {
  FolderKanban,
  LineChart,
  FileText,
  Clock,
};

export const ResearchStats: React.FC = () => {
  return (
    <section className="mt-4 select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mockResearchStats.map((stat) => {
          const Icon = statIcons[stat.iconName] || FileText;
          return (
            <div
              key={stat.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border transition-all shadow-sm"
            >
              <div className="p-2 rounded-lg bg-accent-soft text-accent">
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11.5px] text-text-muted leading-tight">
                  {stat.label}
                </span>
                <span className="text-[16px] font-bold text-text-primary tracking-tight mt-0.5 leading-none">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
