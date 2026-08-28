import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-xl bg-[#060910] text-[#E2E8F0] border border-border overflow-hidden my-3 shadow-panel">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0B101B] border-b border-[#1E293B] text-xs">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          {filename ? (
            <span className="font-mono text-text-secondary">{filename}</span>
          ) : (
            <span className="font-mono uppercase text-text-muted">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#162035] hover:bg-[#1E2C48] text-text-muted hover:text-white transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code lines with line numbers */}
      <div className="p-3 font-mono text-[12px] leading-relaxed overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                <td className="w-8 select-none text-right pr-3 text-text-muted/40 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre text-text-primary">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
