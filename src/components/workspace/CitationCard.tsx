import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Citation } from '../../types/agent';

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-bg-surface border border-border-subtle p-3 hover:border-border transition-all my-1.5 text-[12.5px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="flex-shrink-0 font-mono font-bold text-accent text-[12px] mt-0.5">
            [{citation.index}]
          </span>
          <div className="flex flex-col min-w-0">
            <h5 className="font-medium text-text-primary leading-snug">
              {citation.title}
            </h5>
            <div className="text-[11.5px] text-text-secondary mt-1">
              <span>{citation.authors}</span>
              <span className="mx-1.5 text-text-muted">•</span>
              <span className="italic font-medium text-text-primary">{citation.journal}</span>
              <span className="mx-1 text-text-muted">({citation.year})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={`https://doi.org/${citation.doi}`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded text-text-muted hover:text-accent hover:bg-bg-hover transition-colors"
            title={`Open DOI: ${citation.doi}`}
          >
            <ExternalLink size={13} />
          </a>
          {citation.abstractSnippet && (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              title={isExpanded ? 'Hide Abstract' : 'View Abstract'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && citation.abstractSnippet && (
        <div className="mt-2 pt-2 border-t border-border-subtle text-[11.5px] text-text-muted leading-relaxed bg-bg-elevated p-2 rounded">
          <span className="font-semibold text-text-secondary">Abstract: </span>
          {citation.abstractSnippet}
        </div>
      )}
    </div>
  );
};
