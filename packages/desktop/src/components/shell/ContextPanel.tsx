import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BarChart3,
  FlaskConical,
  Code2,
  Atom,
  PanelRightClose,
  PanelRight,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ListTodo,
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

  // Active Research Plan state
  const [tasks, setTasks] = useState([
    { id: 'task-1', title: 'Target Sequence, Structure & Topology', status: 'completed', evidenceIds: ['EV-1', 'EV-2'] },
    { id: 'task-2', title: 'Bioactivity (IC50/Ki) & SAR Exploration', status: 'completed', evidenceIds: ['EV-3'] },
    { id: 'task-3', title: 'Local Statistical Computation & Radiomics', status: 'in_progress', evidenceIds: ['EV-4'] },
    { id: 'task-4', title: 'Clinical Trials & FAERS Safety Screening', status: 'pending', evidenceIds: [] },
    { id: 'task-5', title: 'Synthesis & Evidence-Anchored Critique', status: 'pending', evidenceIds: [] },
  ]);

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
      className={`flex flex-col h-full w-[280px] lg:w-[300px] bg-bg-surface border-l border-border select-none overflow-y-auto transition-all ${className}`}
    >
      {/* Section 1: Explicit Plan & To-Do Tracker (DeepSeek Harness / Codex Style) */}
      <div className="p-4 border-b border-border-subtle bg-bg-subtle/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ListTodo size={16} className="text-accent" />
            <h3 className="text-[13.5px] font-semibold text-text-primary">
              Research Plan & To-Do
            </h3>
          </div>
          <button
            onClick={() => setIsContextPanelOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Collapse context panel"
          >
            <PanelRightClose size={15} />
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';
            const isProgress = task.status === 'in_progress';
            return (
              <div
                key={task.id}
                className={`p-2 rounded-md border text-[12px] transition-all ${
                  isDone
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-text-primary'
                    : isProgress
                    ? 'bg-accent/10 border-accent/30 text-accent font-medium shadow-sm'
                    : 'bg-bg-card/40 border-border-subtle text-text-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : isProgress ? (
                      <Clock size={14} className="text-accent animate-spin" />
                    ) : (
                      <Circle size={14} className="text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">{task.title}</p>
                    {task.evidenceIds && task.evidenceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.evidenceIds.map((ev) => (
                          <span
                            key={ev}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/15 text-accent border border-accent/25"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Scientific Tools */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[14px] font-semibold text-text-primary">
            Scientific Tools
          </h3>
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

      {/* Section 3: Tips */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-text-primary mb-1">
          Tips & Prompts
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
