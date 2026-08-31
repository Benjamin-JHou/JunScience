import React, { useState, useRef, useEffect } from 'react';
import { JunScienceLogo } from '../common/JunScienceLogo';
import { useTheme } from '../../context/ThemeContext';
import { CliTheme } from '../../types/theme';

interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'tool' | 'result' | 'error' | 'divider';
  content: string;
  symbol?: string;
}

export const CliView: React.FC = () => {
  const { cliTheme, setCliTheme, setViewMode } = useTheme();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [cliTheme]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isExecuting]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const userPromptLine: TerminalLine = {
      id: `line-${Date.now()}-prompt`,
      type: 'prompt',
      content: `junscience> ${trimmed}`,
    };

    setHistory((prev) => [...prev, userPromptLine]);
    setInputVal('');

    const lower = trimmed.toLowerCase();

    // Command: help
    if (lower === 'help') {
      const helpLines: TerminalLine[] = [
        {
          id: `line-${Date.now()}-h1`,
          type: 'output',
          content: 'JunScience Agent Terminal Commands:',
        },
        {
          id: `line-${Date.now()}-h2`,
          type: 'output',
          content: '  [1] literature    Query PubMed, bioRxiv & chemical literature',
        },
        {
          id: `line-${Date.now()}-h3`,
          type: 'output',
          content: '  [2] analysis      Run single-cell RNA-seq & DESeq2 pipeline',
        },
        {
          id: `line-${Date.now()}-h4`,
          type: 'output',
          content: '  [3] experiment    Formulate CRISPR-Cas9 assay protocol',
        },
        {
          id: `line-${Date.now()}-h5`,
          type: 'output',
          content: '  [4] code          Execute Python / R computational scripts',
        },
        {
          id: `line-${Date.now()}-h6`,
          type: 'output',
          content: '  [5] molecule      Inspect AlphaFold structures & pocket scores',
        },
        {
          id: `line-${Date.now()}-h7`,
          type: 'output',
          content: '  [6] project       Open Autoimmune Target Discovery workspace',
        },
        {
          id: `line-${Date.now()}-h8`,
          type: 'output',
          content: '  theme <name>      Switch CLI theme: green | blue | purple | amber',
        },
        {
          id: `line-${Date.now()}-h9`,
          type: 'output',
          content: '  desktop           Return to JunScience Desktop Workstation',
        },
        {
          id: `line-${Date.now()}-h10`,
          type: 'output',
          content: '  clear             Clear terminal screen',
        },
      ];
      setHistory((prev) => [...prev, ...helpLines]);
      return;
    }

    // Command: clear
    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    // Command: desktop
    if (lower === 'desktop') {
      setViewMode('desktop');
      return;
    }

    // Command: theme <color>
    if (lower.startsWith('theme ')) {
      const targetTheme = lower.split(' ')[1] as CliTheme;
      if (['green', 'blue', 'purple', 'amber'].includes(targetTheme)) {
        setCliTheme(targetTheme);
        setHistory((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-th`,
            type: 'result',
            content: `✓ Switched CLI theme to: ${targetTheme.toUpperCase()}`,
          },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-err`,
            type: 'error',
            content: `✗ Invalid theme. Available: green, blue, purple, amber`,
          },
        ]);
      }
      return;
    }

    // Interactive execution for quick actions or custom research prompts
    setIsExecuting(true);

    if (lower.startsWith('research ') || (!['1', '2', '3', '4', '5', '6'].includes(lower) && lower.length > 5)) {
      const inquiry = lower.startsWith('research ') ? cmd.slice(9) : cmd;
      setHistory((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-plan`,
          type: 'tool',
          symbol: '◌',
          content: `◌ Research Planner: Formulating hypothesis and query strategy for "${inquiry.slice(0, 50)}"...`,
        },
      ]);

      if (window.junscience?.agent) {
        window.junscience.agent.submitPrompt(inquiry).then((result) => {
          const citationsCount = result.session?.citations?.length || 0;
          const artifactsCount = result.session?.artifacts?.length || 0;
          const responseText = result.turn?.agentResponse || 'Research turn completed.';

          setHistory((prev) => [
            ...prev,
            {
              id: `line-${Date.now()}-t1`,
              type: 'tool',
              symbol: '✓',
              content: `✓ Autonomous Research Engine completed turn with ${citationsCount} verified citations and ${artifactsCount} artifacts.`,
            },
            {
              id: `line-${Date.now()}-res`,
              type: 'result',
              content: `[Synthesized Findings]\n${responseText.slice(0, 600)}...`,
            },
          ]);
          setIsExecuting(false);
        }).catch((err) => {
          setHistory((prev) => [
            ...prev,
            {
              id: `line-${Date.now()}-err`,
              type: 'error',
              content: `✗ Execution error: ${err?.message || String(err)}`,
            },
          ]);
          setIsExecuting(false);
        });
      } else {
        // Fallback for browser preview environment
        setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            {
              id: `line-${Date.now()}-t1`,
              type: 'tool',
              symbol: '✓',
              content: `✓ Autonomous Research Engine completed simulated exploration for: "${inquiry.slice(0, 45)}..."`,
            },
            {
              id: `line-${Date.now()}-res`,
              type: 'result',
              content: `[Synthesized Findings]\n• Pathogenic Type-I IFN signature verified (STAT4 log2FC=+2.84, TYK2 log2FC=+3.12)\n• Allosteric TYK2 JH2 pseudokinase pocket targetable with nanomolar potency (IC50=0.2 nM)\n• Complete interactive artifacts and figures loaded in Desktop Workspace.`,
            },
          ]);
          setIsExecuting(false);
        }, 1200);
      }
      return;
    }

    let steps: { symbol: string; text: string; delay: number }[] = [];

    if (lower === '1' || lower.includes('literature')) {
      steps = [
        { symbol: '◌', text: 'Literature Search: Searching PubMed, bioRxiv...', delay: 300 },
        { symbol: '✓', text: 'Retrieved 142 relevant manuscripts on SLE targets', delay: 700 },
        { symbol: '✓', text: 'Found consensus: STAT4 and TYK2 axis hyperactivated in memory CD4+ T cells', delay: 1100 },
      ];
    } else if (lower === '2' || lower.includes('analysis')) {
      steps = [
        { symbol: '◌', text: 'Data Analysis: Loading 10x Genomics dataset GSE181283...', delay: 300 },
        { symbol: '◌', text: 'Quality Control: 14,200 cells passing filters (<8% mito, >1500 genes)', delay: 700 },
        { symbol: '✓', text: 'Differential expression: 1,247 significant genes (FDR < 0.01)', delay: 1200 },
      ];
    } else if (lower === '3' || lower.includes('experiment')) {
      steps = [
        { symbol: '◌', text: 'Experiment Design: Generating sgRNA candidates for STAT4 SH2 domain...', delay: 300 },
        { symbol: '✓', text: 'Identified top 4 non-overlapping guide RNAs (Doench score > 0.88)', delay: 800 },
        { symbol: '✓', text: 'Drafted 96-well electroporation & flow cytometry readout protocol', delay: 1200 },
      ];
    } else if (lower === '4' || lower.includes('code')) {
      steps = [
        { symbol: '◌', text: 'Python: Running volcano_plot.py on GSE181283 differential expression...', delay: 300 },
        { symbol: '✓', text: 'Artifact generated: volcano_plot_sle_targets.svg (300 DPI)', delay: 800 },
      ];
    } else if (lower === '5' || lower.includes('molecule')) {
      steps = [
        { symbol: '◌', text: 'Molecule Explorer: Querying AlphaFold AF-P29597-F1 for human TYK2...', delay: 300 },
        { symbol: '✓', text: 'Structural confidence pLDDT: 92.4. JH2 allosteric pocket volume: 482 Å³', delay: 800 },
      ];
    } else if (lower === '6' || lower.includes('project')) {
      steps = [
        { symbol: '✓', text: 'Project "Autoimmune Target Discovery" loaded with 3 active pipelines', delay: 400 },
      ];
    } else {
      steps = [
        { symbol: '◌', text: `JunScience Agent: Reasoning on scientific query...`, delay: 300 },
        { symbol: '◌', text: `Querying scientific databases and literature...`, delay: 700 },
        { symbol: '✓', text: `Evidence synthesis converged. Results available in desktop workspace.`, delay: 1200 },
      ];
    }

    steps.forEach((step, index) => {
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            id: `line-${Date.now()}-${index}`,
            type: step.symbol === '✓' ? 'result' : 'tool',
            symbol: step.symbol,
            content: `${step.symbol} ${step.text}`,
          },
        ]);
        if (index === steps.length - 1) {
          setIsExecuting(false);
        }
      }, step.delay);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(inputVal);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#030604] overflow-y-auto">
      {/* Terminal Window Container */}
      <div
        className="w-full max-w-[900px] min-h-[580px] rounded-xl overflow-hidden terminal-window flex flex-col transition-all duration-300"
        onClick={() => inputRef.current?.focus()}
      >
        {/* macOS Window Header Bar */}
        <div
          className="flex items-center justify-between px-4 h-[38px] border-b select-none"
          style={{
            backgroundColor: 'var(--term-window-bar)',
            borderColor: 'var(--term-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/90 inline-block cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/90 inline-block cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]/90 inline-block cursor-pointer" />
          </div>

          <div
            className="text-xs font-mono font-medium tracking-wide"
            style={{ color: 'var(--term-muted)' }}
          >
            junscience
          </div>

          {/* Quick Theme Switcher Pills inside window header */}
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
            {(['green', 'blue', 'purple', 'amber'] as CliTheme[]).map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  setCliTheme(t);
                }}
                className={`px-1.5 py-0.5 rounded capitalize transition-colors ${
                  cliTheme === t
                    ? 'font-bold border'
                    : 'opacity-50 hover:opacity-100'
                }`}
                style={{
                  color: cliTheme === t ? 'var(--term-accent)' : 'var(--term-muted)',
                  borderColor: cliTheme === t ? 'var(--term-accent)' : 'transparent',
                }}
              >
                {t}
              </button>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('desktop');
              }}
              className="ml-2 px-1.5 py-0.5 rounded opacity-70 hover:opacity-100 border border-transparent hover:border-current"
              style={{ color: 'var(--term-muted)' }}
              title="Switch to Desktop Mode"
            >
              Desktop
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          className="flex-1 p-5 sm:p-6 terminal-font text-[13px] leading-relaxed space-y-4 overflow-y-auto"
          style={{ color: 'var(--term-text)' }}
        >
          {/* Header Block with Wireframe Logo */}
          <div className="flex items-start gap-5 pb-2">
            <div className="flex-shrink-0">
              <JunScienceLogo size={70} variant="wireframe-cli" />
            </div>
            <div className="flex flex-col pt-1">
              <h2
                className="text-[19px] font-bold tracking-tight terminal-accent-glow"
                style={{ color: 'var(--term-accent)' }}
              >
                JunScience Agent
              </h2>
              <p
                className="text-[13px] font-medium"
                style={{ color: 'var(--term-text-dim)' }}
              >
                AI Research Assistant
              </p>
              <p
                className="text-[12px] opacity-80 mt-1"
                style={{ color: 'var(--term-muted)' }}
              >
                Type 'help' for available commands
              </p>
            </div>
          </div>

          {/* Quick Actions Box */}
          <div
            className="p-3 rounded-lg terminal-box"
            style={{ borderColor: 'var(--term-border-box)' }}
          >
            <div
              className="text-[11.5px] font-bold mb-2 tracking-wide select-none"
              style={{ color: 'var(--term-accent)' }}
            >
              - Quick Actions
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[12.5px]">
              <button
                onClick={() => runCommand('1')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[1]</span> literature
              </button>
              <button
                onClick={() => runCommand('2')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[2]</span> analysis
              </button>
              <button
                onClick={() => runCommand('3')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[3]</span> experiment
              </button>
              <button
                onClick={() => runCommand('4')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[4]</span> code
              </button>
              <button
                onClick={() => runCommand('5')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[5]</span> molecule
              </button>
              <button
                onClick={() => runCommand('6')}
                className="text-left hover:underline cursor-pointer"
                style={{ color: 'var(--term-text)' }}
              >
                <span style={{ color: 'var(--term-accent)' }}>[6]</span> project
              </button>
            </div>
          </div>

          {/* Recent Research Tasks Box */}
          <div
            className="p-3 rounded-lg terminal-box"
            style={{ borderColor: 'var(--term-border-box)' }}
          >
            <div className="space-y-1 text-[12.5px]">
              <div
                onClick={() => runCommand('Autoimmune Target Discovery')}
                className="flex items-center justify-between cursor-pointer hover:underline"
              >
                <span>• Recent: Autoimmune Target Discovery</span>
                <span style={{ color: 'var(--term-muted)' }}>[Today]</span>
              </div>
              <div
                onClick={() => runCommand('Molecular Docking Analysis')}
                className="flex items-center justify-between cursor-pointer hover:underline"
              >
                <span>• Recent: Molecular Docking Analysis</span>
                <span style={{ color: 'var(--term-muted)' }}>[Yesterday]</span>
              </div>
              <div
                onClick={() => runCommand('Single-cell RNA-seq Analysis')}
                className="flex items-center justify-between cursor-pointer hover:underline"
              >
                <span>• Recent: Single-cell RNA-seq Analysis</span>
                <span style={{ color: 'var(--term-muted)' }}>[2 days ago]</span>
              </div>
              <div
                onClick={() => runCommand('Protein Structure Prediction')}
                className="flex items-center justify-between cursor-pointer hover:underline"
              >
                <span>• Recent: Protein Structure Prediction</span>
                <span style={{ color: 'var(--term-muted)' }}>[3 days ago]</span>
              </div>
            </div>
          </div>

          {/* Dynamic Execution History */}
          {history.length > 0 && (
            <div className="pt-2 space-y-1.5 border-t" style={{ borderColor: 'var(--term-border)' }}>
              {history.map((line) => (
                <div
                  key={line.id}
                  className="whitespace-pre-wrap break-words"
                  style={{
                    color:
                      line.type === 'prompt'
                        ? 'var(--term-accent-bright)'
                        : line.type === 'result'
                        ? 'var(--term-accent)'
                        : line.type === 'error'
                        ? '#EF4444'
                        : line.type === 'tool'
                        ? 'var(--term-text-dim)'
                        : 'var(--term-text)',
                  }}
                >
                  {line.content}
                </div>
              ))}
            </div>
          )}

          {/* Active Terminal Prompt Input Line */}
          <div className="flex items-center gap-2 pt-2">
            <span
              className="font-bold select-none"
              style={{ color: 'var(--term-accent)' }}
            >
              junscience&gt;
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isExecuting}
                className="w-full bg-transparent border-none outline-none font-mono text-[13px] p-0"
                style={{ color: 'var(--term-accent-bright)' }}
                autoFocus
              />
              {!inputVal && !isExecuting && (
                <span className="terminal-cursor" />
              )}
            </div>
          </div>

          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
