import React, { useState } from 'react';
import {
  FileImage,
  Table as TableIcon,
  Atom,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Artifact } from '../../types/agent';

interface ArtifactCardProps {
  artifact: Artifact;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderContent = () => {
    if (artifact.type === 'figure') {
      return (
        <div className="mt-3 p-3 rounded-lg bg-bg-elevated border border-border-subtle flex flex-col items-center">
          {/* Interactive Scientific Volcano Plot */}
          <div className="w-full max-w-[580px] h-[220px] relative select-none">
            <svg viewBox="0 0 500 220" className="w-full h-full">
              {/* Grid lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="50" y1="80" x2="480" y2="80" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="50" y1="140" x2="480" y2="140" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="50" y1="180" x2="480" y2="180" stroke="var(--border-color)" strokeWidth="1.5" />
              <line x1="260" y1="20" x2="260" y2="180" stroke="var(--border-subtle)" strokeDasharray="2 2" />

              {/* Threshold Lines */}
              <line x1="180" y1="20" x2="180" y2="180" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              <line x1="340" y1="20" x2="340" y2="180" stroke="#10B981" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

              {/* Axis Labels */}
              <text x="260" y="208" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="sans-serif">
                Log2 Fold Change (SLE vs Control)
              </text>
              <text x="18" y="100" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="sans-serif" transform="rotate(-90 18 100)">
                -Log10 (P-value)
              </text>

              {/* Background Non-significant Genes */}
              <circle cx="240" cy="165" r="2" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="270" cy="155" r="2" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="255" cy="140" r="2.5" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="230" cy="150" r="2" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="285" cy="160" r="2" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="215" cy="145" r="2" fill="var(--text-muted)" opacity="0.4" />
              <circle cx="295" cy="135" r="2" fill="var(--text-muted)" opacity="0.4" />

              {/* Downregulated Genes (Left side - Blue) */}
              <circle cx="140" cy="70" r="4" fill="#3B82F6" />
              <text x="135" y="60" fill="var(--text-secondary)" fontSize="10" fontWeight="600" textAnchor="end">FOXP3</text>
              
              <circle cx="160" cy="95" r="3.5" fill="#3B82F6" />
              <text x="155" y="110" fill="var(--text-secondary)" fontSize="10" textAnchor="end">TGFBR2</text>

              {/* Upregulated Targets (Right side - Cyan/Emerald/Red) */}
              <circle cx="390" cy="35" r="5" fill="#10B981" />
              <text x="395" y="32" fill="#10B981" fontSize="11" fontWeight="bold">TYK2 (+3.12)</text>

              <circle cx="370" cy="48" r="5" fill="#00D2FF" />
              <text x="375" y="55" fill="var(--accent-color)" fontSize="11" fontWeight="bold">STAT4 (+2.84)</text>

              <circle cx="410" cy="60" r="4" fill="#818CF8" />
              <text x="415" y="72" fill="var(--text-secondary)" fontSize="10">CXCL10</text>

              <circle cx="355" cy="80" r="3.5" fill="#10B981" />
              <text x="360" y="92" fill="var(--text-secondary)" fontSize="10">IFIT1</text>

              <circle cx="345" cy="100" r="3" fill="#10B981" />
              <text x="350" y="112" fill="var(--text-secondary)" fontSize="10">IRF5</text>
            </svg>
          </div>

          <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-border-subtle text-xs text-text-muted">
            <span>Cutoffs: FDR &lt; 0.01, |log2FC| &gt; 1.5</span>
            <span className="font-mono text-[11px] text-accent">784 Upregulated • 463 Downregulated</span>
          </div>
        </div>
      );
    }

    if (artifact.type === 'table' && Array.isArray(artifact.previewData)) {
      return (
        <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-bg-elevated">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-bg-surface border-b border-border text-text-muted uppercase text-[10.5px] tracking-wider font-semibold">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Gene</th>
                <th className="py-2 px-3">Log2FC</th>
                <th className="py-2 px-3">p-Adj</th>
                <th className="py-2 px-3">Target Class</th>
                <th className="py-2 px-3">Clinical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-[12px]">
              {artifact.previewData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-bg-hover transition-colors">
                  <td className="py-2 px-3 text-text-muted">{row.rank}</td>
                  <td className="py-2 px-3 font-semibold text-accent">{row.gene}</td>
                  <td className="py-2 px-3 text-status-success">{row.log2FC}</td>
                  <td className="py-2 px-3 text-text-muted">{row.pAdj}</td>
                  <td className="py-2 px-3 font-sans text-text-secondary">{row.class}</td>
                  <td className="py-2 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-accent-soft text-accent border border-accent/20">
                      {row.drugStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (artifact.type === 'protein') {
      return (
        <div className="mt-3 p-3 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent-soft text-accent">
              <Atom size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-text-primary">
                  AlphaFold AF-P29597-F1
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10.5px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  pLDDT 92.4
                </span>
              </div>
              <p className="text-[11.5px] text-text-muted mt-0.5">
                Allosteric Pocket: 482 Å³ volume • Cryo-EM aligned (1.8 Å resolution)
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover border border-border text-text-primary text-xs font-medium transition-colors">
            <span>3D View</span>
            <ExternalLink size={12} />
          </button>
        </div>
      );
    }

    return null;
  };

  const getArtifactIcon = () => {
    switch (artifact.type) {
      case 'figure':
        return FileImage;
      case 'table':
        return TableIcon;
      case 'protein':
        return Atom;
      default:
        return FileImage;
    }
  };

  const TypeIcon = getArtifactIcon();

  return (
    <div className="rounded-xl bg-bg-surface border border-border p-4 my-3 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-accent-soft text-accent">
            <TypeIcon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {artifact.type}
              </span>
              {artifact.generatedFrom && (
                <span className="text-[11px] font-mono text-text-muted">
                  via {artifact.generatedFrom}
                </span>
              )}
            </div>
            <h4 className="text-[14px] font-semibold text-text-primary leading-tight mt-0.5">
              {artifact.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Export / Download Artifact"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      <p className="text-[12.5px] text-text-secondary mt-1.5 leading-relaxed">
        {artifact.description}
      </p>

      {/* Artifact Specific Data Visualization */}
      {renderContent()}
    </div>
  );
};
