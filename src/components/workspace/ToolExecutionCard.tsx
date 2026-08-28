import React, { useState } from 'react';
import {
  BookOpen,
  BarChart2,
  Code2,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { ToolExecution } from '../../types/agent';

interface ToolExecutionCardProps {
  tool: ToolExecution;
}

const categoryIcons: Record<string, React.ElementType> = {
  literature: BookOpen,
  analysis: BarChart2,
  code: Code2,
  experiment: FlaskConical,
  molecule: Terminal,
};

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({ tool }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryIcons[tool.category] || Terminal;

  const isCompleted = tool.status === 'completed';
  const isRunning = tool.status === 'running';
  const isFailed = tool.status === 'failed';

  return (
    <div className="rounded-xl bg-bg-surface border border-border overflow-hidden transition-all shadow-sm my-2.5">
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-bg-hover transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-accent-soft text-accent">
            <Icon size={16} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">
                {tool.toolName}
              </span>
              {tool.duration && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                  {tool.duration}
                </span>
              )}
            </div>
            <span className="text-[12px] text-text-muted truncate mt-0.5">
              {tool.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <Loader2 size={14} className="animate-spin" />
              <span className="hidden sm:inline font-mono text-[11px]">Executing...</span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 text-xs text-status-success">
              <CheckCircle2 size={15} />
              <span className="hidden sm:inline font-mono text-[11px]">Done</span>
            </div>
          )}
          {isFailed && (
            <div className="flex items-center gap-1 text-xs text-status-error">
              <AlertCircle size={15} />
              <span className="hidden sm:inline font-mono text-[11px]">Failed</span>
            </div>
          )}

          <div className="text-text-muted">
            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </div>
        </div>
      </div>

      {/* Expanded Console Logs */}
      {isExpanded && (
        <div className="px-3.5 py-2.5 bg-bg-elevated border-t border-border-subtle font-mono text-[11.5px] space-y-1 text-text-secondary overflow-x-auto">
          {tool.resultSummary && (
            <div className="text-accent font-medium pb-1 mb-1 border-b border-border-subtle flex items-center gap-1.5">
              <span>➔</span>
              <span>{tool.resultSummary}</span>
            </div>
          )}
          {tool.logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 text-text-muted">
              <span className="select-none text-accent/50">$</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
