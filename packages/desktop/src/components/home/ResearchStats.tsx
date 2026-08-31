import React from 'react';
import { FolderKanban, FlaskConical, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

export const ResearchStats: React.FC = () => {
  const { sessions } = useAgent();

  const totalCitations = sessions.reduce((acc, s) => {
    return acc + (s.messages?.reduce((mAcc, m) => mAcc + (m.citations?.length || 0), 0) || 0);
  }, 0);

  const stats = [
    {
      id: 'stat-sessions',
      label: 'Research Sessions',
      value: sessions.length.toString(),
      icon: FolderKanban,
      color: 'text-accent',
    },
    {
      id: 'stat-skills',
      label: 'Scientific Skills',
      value: '19 Loaded',
      icon: FlaskConical,
      color: 'text-purple-500',
    },
    {
      id: 'stat-evidence',
      label: 'Verified Evidence',
      value: `${totalCitations} Records`,
      icon: ShieldCheck,
      color: 'text-emerald-500',
    },
    {
      id: 'stat-guardrails',
      label: 'Guardrail Hooks',
      value: '4 Enforced',
      icon: CheckCircle,
      color: 'text-blue-500',
    },
  ];

  return (
    <section className="mt-4 select-none text-left">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface border border-border transition-all shadow-xs"
            >
              <div className={`p-2 rounded-lg bg-bg-elevated ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted leading-tight">
                  {stat.label}
                </span>
                <span className="text-[14.5px] font-bold text-text-primary tracking-tight mt-0.5 leading-none">
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
