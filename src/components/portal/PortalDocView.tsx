import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Zap,
  Compass,
  Code2,
  FlaskConical,
  Terminal,
  Layers,
  Cpu,
  CheckCircle2,
  GitPullRequest,
  History,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Database,
  Activity,
  FileText,
  Sliders,
  DollarSign,
  Boxes,
  HelpCircle,
  Key,
} from 'lucide-react';
import { PortalSection } from '../../types/navigation';
import { useNav } from '../../context/NavContext';

interface PortalDocViewProps {
  section: PortalSection;
}

export const PortalDocView: React.FC<PortalDocViewProps> = ({ section }) => {
  const { setActiveSection } = useNav();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderCodeBlock = (code: string, language: string = 'bash', key: string) => (
    <div className="rounded-xl border border-border bg-[#070A10] text-[#E2E8F0] overflow-hidden my-3 shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-[11px] font-mono text-slate-400">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={() => copyToClipboard(code, key)}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copiedKey === key ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copiedKey === key ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 text-[12.5px] font-mono overflow-x-auto leading-relaxed text-left">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-8 max-w-[980px] mx-auto text-left space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-text-muted">
        <button onClick={() => setActiveSection('home')} className="hover:text-text-primary hover:underline">
          Home
        </button>
        <span>/</span>
        <span className="capitalize font-medium text-text-primary">
          {section === 'cli' ? 'CLI Agent Manual' : section}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: CLI AGENT MANUAL (Claude Code style)                            */}
      {/* ========================================================================= */}
      {section === 'cli' && (
        <article className="space-y-8">
          <div className="space-y-2 border-b border-border pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-bold text-[11px] font-mono">
              <Terminal size={12} />
              <span>TERMINAL AGENT WORKSTATION</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">JunScience CLI Agent Manual</h1>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              A high-performance, developer-first command-line research agent for empirical scientific discovery.
              Featuring dual-mode execution (<strong>Plan Mode</strong> vs <strong>Act Mode</strong>), model switching with <code>/model</code>, real-time tool execution, and cryptographic evidence anchoring.
            </p>
          </div>

          {/* 1. Quick Installation */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <span>1. Quick Installation</span>
            </h2>
            <p className="text-[13.5px] text-text-secondary">
              Install JunScience CLI via our official one-line script or globally via npm:
            </p>

            <div className="space-y-2">
              <div className="text-[12.5px] font-semibold text-text-primary">Option A: One-Line Bash Installer (macOS &amp; Linux)</div>
              {renderCodeBlock(
                `curl -fsSL https://benjamin-jhou.github.io/JunScience/install.sh | bash`,
                'bash',
                'cli-install-curl'
              )}

              <div className="text-[12.5px] font-semibold text-text-primary pt-2">Option B: Global npm Package</div>
              {renderCodeBlock(
                `# Install globally
npm install -g @junscience/cli

# Run anywhere
junscience`,
                'bash',
                'cli-install-npm'
              )}

              <div className="text-[12.5px] font-semibold text-text-primary pt-2">Option C: Zero-Install Instant Run (npx)</div>
              {renderCodeBlock(
                `npx @junscience/cli`,
                'bash',
                'cli-install-npx'
              )}
            </div>
          </div>

          {/* 2. Dual Agent Execution Modes (Plan vs Act) */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Sliders size={20} className="text-accent" />
              <span>2. Execution Modes: Plan Mode vs Act Mode</span>
            </h2>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">
              JunScience provides explicit operational mode switching to ensure researchers can deliberate on study designs before triggering autonomous tool executions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-purple-500 text-white">
                    /plan Mode
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Deliberative Planning</span>
                </div>
                <h3 className="font-bold text-[14px] text-text-primary">Hypothesis &amp; Protocol Design</h3>
                <ul className="text-[12px] text-text-secondary space-y-1 list-disc list-inside">
                  <li>Formulates 5-stage research plans and hypothesis trees.</li>
                  <li>Performs read-only literature searches and syntheses.</li>
                  <li>Drafts required <code>EV-xxx</code> evidence anchors without running mutating sandbox code.</li>
                  <li>Ideal for aligning on experimental parameters.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-500 text-white">
                    /act Mode (or /run)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Autonomous Execution</span>
                </div>
                <h3 className="font-bold text-[14px] text-text-primary">Task Execution &amp; Artifact Synthesis</h3>
                <ul className="text-[12px] text-text-secondary space-y-1 list-disc list-inside">
                  <li>Autonomously invokes UniProt, ChEMBL, PDB, PubMed tools.</li>
                  <li>Executes Python data analysis scripts in kernel sandboxes.</li>
                  <li>Evaluates mathematical boundaries via <code>EvidenceVerifier</code>.</li>
                  <li>Generates publication figures and markdown reports.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-surface border border-border text-[13px] text-text-secondary">
              <span className="font-bold text-text-primary">💡 Switching Modes:</span> In the interactive CLI REPL, simply type <code className="text-purple-500 font-bold">/plan</code> or <code className="text-emerald-500 font-bold">/act</code>, or type <code className="text-accent font-bold">/mode</code> to toggle back and forth.
            </div>
          </div>

          {/* 3. Essential Slash Commands Cheat Sheet */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Code2 size={20} className="text-accent" />
              <span>3. CLI Slash Commands Reference</span>
            </h2>
            <p className="text-[13.5px] text-text-secondary">
              The JunScience CLI REPL supports interactive slash commands:
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-bg-surface shadow-xs">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-bg-elevated/70 border-b border-border text-text-muted font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Command</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Example Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/model</td>
                    <td className="p-3 text-text-secondary">List, switch, or configure active LLM model provider and API keys</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/model set --model deepseek-chat --api-key sk-...</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-purple-500">/plan</td>
                    <td className="p-3 text-text-secondary">Switch agent to Plan Mode (deliberative reasoning &amp; hypothesis tree)</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/plan</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-emerald-500">/act (or /run)</td>
                    <td className="p-3 text-text-secondary">Switch agent to Act Mode (autonomous tool execution &amp; artifact generation)</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/act</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-yellow-500">/mode</td>
                    <td className="p-3 text-text-secondary">Toggle between Plan Mode and Act Mode</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/mode</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/tools</td>
                    <td className="p-3 text-text-secondary">List registered scientific database, literature, and computation tools</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/tools</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/skills</td>
                    <td className="p-3 text-text-secondary">List active domain SOP skills (Pathway enrichment, SAR mapping, etc.)</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/skills</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/cost (or /tokens)</td>
                    <td className="p-3 text-text-secondary">Display session token metrics, prompt cache hits, and estimated API costs</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/cost</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/compact</td>
                    <td className="p-3 text-text-secondary">Compress context memory while preserving all immutable EV-xxx evidence anchors</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/compact</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/mcp</td>
                    <td className="p-3 text-text-secondary">Inspect and bridge Model Context Protocol (MCP) servers and tools</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/mcp</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/export</td>
                    <td className="p-3 text-text-secondary">Export current research findings and evidence index to Markdown/LaTeX</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/export</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/new</td>
                    <td className="p-3 text-text-secondary">Start a fresh scientific research session and clear working context</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/new</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/clear</td>
                    <td className="p-3 text-text-secondary">Clear terminal screen while retaining active session memory</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/clear</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/help</td>
                    <td className="p-3 text-text-secondary">Show interactive command palette and keybindings</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/help</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-accent">/exit (or /quit)</td>
                    <td className="p-3 text-text-secondary">Safely exit JunScience CLI REPL</td>
                    <td className="p-3 font-mono text-[11.5px] text-text-muted"><code>/exit</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Model & API Key Configuration */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Key size={20} className="text-accent" />
              <span>4. Configuring LLM Models and Providers</span>
            </h2>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">
              JunScience includes built-in offline mock providers for instant testing. You can easily link OpenAI, Anthropic, DeepSeek, or local Ollama / vLLM models:
            </p>

            <div className="space-y-2">
              <div className="text-[12.5px] font-semibold text-text-primary">1. DeepSeek API (Recommended for scientific reasoning):</div>
              {renderCodeBlock(
                `junscience config set \\
  --name "DeepSeek V3" \\
  --model "deepseek-chat" \\
  --base-url "https://api.deepseek.com/v1" \\
  --api-key "sk-your-key-here"`,
                'bash',
                'cfg-deepseek'
              )}

              <div className="text-[12.5px] font-semibold text-text-primary pt-2">2. Anthropic Claude 3.7 Sonnet:</div>
              {renderCodeBlock(
                `junscience config set \\
  --name "Claude 3.7" \\
  --model "claude-3-7-sonnet-20250219" \\
  --protocol "anthropic-compatible" \\
  --base-url "https://api.anthropic.com/v1" \\
  --api-key "sk-ant-..."`,
                'bash',
                'cfg-anthropic'
              )}

              <div className="text-[12.5px] font-semibold text-text-primary pt-2">3. Local Ollama / vLLM Endpoint (Air-Gapped / Private):</div>
              {renderCodeBlock(
                `junscience config set \\
  --name "Local Llama 3" \\
  --model "llama3.3:70b" \\
  --base-url "http://localhost:11434/v1" \\
  --protocol "openai-compatible"`,
                'bash',
                'cfg-ollama'
              )}
            </div>
          </div>

          {/* 5. One-Shot Command Execution */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Zap size={20} className="text-accent" />
              <span>5. One-Shot Direct Research Commands</span>
            </h2>
            <p className="text-[13.5px] text-text-secondary">
              For scripted CI pipelines or fast command-line queries, you can bypass the interactive REPL and run research directly:
            </p>
            {renderCodeBlock(
              `# Execute direct scientific inquiry
junscience research "Investigate TYK2 JH2 allosteric pseudokinase binding versus ATP catalytic domain"

# Run with custom output path
junscience research "Extract FAERS adverse event signals for GLP-1 agonists" --export ./glp1_report.md`,
              'bash',
              'cli-oneshot'
            )}
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: DOCS (Overview & Concepts)                                       */}
      {/* ========================================================================= */}
      {section === 'docs' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Documentation &amp; Core Concepts</h1>
            <p className="text-[15px] text-text-secondary">
              Understand the core design philosophy, evidence-first execution model, and scientific runtime architecture.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">1. What is JunScience?</h2>
            <p>
              JunScience is an open-source AI Agent framework engineered specifically for <strong>empirical scientific and biomedical discovery</strong>.
              Unlike conversational chatbots, JunScience operates with strict scientific skepticism: all conclusions must be derived from verified data retrieved from authoritative databases or computed in isolated sandboxes.
            </p>

            <h2 className="text-xl font-bold text-text-primary pt-2">2. The 3 Core Tenets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <ShieldCheck size={20} className="text-accent mb-2" />
                <h3 className="font-bold text-[14px] text-text-primary mb-1">Pre-Adoption Verification</h3>
                <p className="text-[12px] text-text-muted">
                  The Codex-style <code>EvidenceVerifier</code> screens all outputs for mathematical anomalies, physics boundaries, and non-empty artifacts before admitting findings.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <Layers size={20} className="text-emerald-500 mb-2" />
                <h3 className="font-bold text-[14px] text-text-primary mb-1">Hypothesis Subagent Tree</h3>
                <p className="text-[12px] text-text-muted">
                  DeepSeek Harness forks concurrent subagent branches to explore competing targets or mechanisms in parallel and merges evidence into a comparison matrix.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <CheckCircle2 size={20} className="text-purple-500 mb-2" />
                <h3 className="font-bold text-[14px] text-text-primary mb-1">Explicit Plan &amp; To-Do Tracker</h3>
                <p className="text-[12px] text-text-muted">
                  Every inquiry generates an explicit 5-stage research plan, broadcasting live task status and immutable <code>EV-xxx</code> evidence anchors to CLI and Desktop UI.
                </p>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: INSTALLATION                                                     */}
      {/* ========================================================================= */}
      {section === 'installation' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Installation Guide</h1>
            <p className="text-[15px] text-text-secondary">
              Desktop application downloads, CLI one-line installer, prerequisites, and monorepo setup.
            </p>
          </div>

          <div className="space-y-6 text-[14px] text-text-secondary leading-relaxed">
            {/* 1. Desktop App (First) */}
            <div>
              <h2 className="text-xl font-bold text-text-primary">1. Download Desktop App (v1.1.0)</h2>
              <p className="text-[13px] text-text-muted mt-1">
                Official native scientific workstations with integrated multi-agent tree engine, real-time Plan &amp; To-Do tracker, and interactive evidence cards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
                <a
                  href="https://github.com/Benjamin-JHou/JunScience/releases/download/v1.1.0/JunScience-1.1.0-arm64.dmg"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-bg-surface border border-border hover:border-accent hover:shadow-xs flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-[13.5px] text-text-primary block">macOS Apple Silicon</span>
                    <span className="text-[11px] text-text-muted">M1/M2/M3/M4 (.dmg, 93.2 MB)</span>
                  </div>
                  <Download size={16} className="text-text-muted group-hover:text-accent" />
                </a>

                <a
                  href="https://github.com/Benjamin-JHou/JunScience/releases/download/v1.1.0/JunScience-1.1.0.dmg"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-bg-surface border border-border hover:border-accent hover:shadow-xs flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-[13.5px] text-text-primary block">macOS Intel</span>
                    <span className="text-[11px] text-text-muted">x86_64 (.dmg, 98.0 MB)</span>
                  </div>
                  <Download size={16} className="text-text-muted group-hover:text-accent" />
                </a>

                <a
                  href="https://github.com/Benjamin-JHou/JunScience/releases/download/v1.1.0/JunScience.Setup.1.1.0.exe"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-bg-surface border border-border hover:border-accent hover:shadow-xs flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-[13.5px] text-text-primary block">Windows Setup</span>
                    <span className="text-[11px] text-text-muted">NSIS Installer (73.9 MB)</span>
                  </div>
                  <Download size={16} className="text-text-muted group-hover:text-accent" />
                </a>

                <a
                  href="https://github.com/Benjamin-JHou/JunScience/releases/download/v1.1.0/JunScience.1.1.0.exe"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-bg-surface border border-border hover:border-accent hover:shadow-xs flex items-center justify-between group transition-all"
                >
                  <div>
                    <span className="font-bold text-[13.5px] text-text-primary block">Windows Portable</span>
                    <span className="text-[11px] text-text-muted">Standalone (.exe, 73.7 MB)</span>
                  </div>
                  <Download size={16} className="text-text-muted group-hover:text-accent" />
                </a>
              </div>
            </div>

            {/* 2. CLI Agent (Second) */}
            <div className="pt-2">
              <h2 className="text-xl font-bold text-text-primary">2. Quick Install CLI</h2>
              <p className="text-[13px] text-text-muted mt-1">
                Fast terminal-based scientific agent with dual Plan/Act mode execution:
              </p>
              {renderCodeBlock(
                `# Option A: One-line bash installer (macOS & Linux)
curl -fsSL https://benjamin-jhou.github.io/JunScience/install.sh | bash

# Option B: Global npm package
npm install -g @junscience/cli

# Option C: Zero-install instant run
npx @junscience/cli`,
                'bash',
                'install-quick'
              )}
            </div>

            {/* 3. Prerequisites */}
            <div className="pt-2">
              <h2 className="text-xl font-bold text-text-primary">3. Prerequisites</h2>
              <ul className="list-disc list-inside space-y-1 text-[13.5px] text-text-secondary mt-1">
                <li><strong>Node.js</strong>: version 20.x or 22.x LTS</li>
                <li><strong>Python</strong>: version 3.10+ (standard library for sandboxed compute)</li>
                <li><strong>Git</strong>: latest version</li>
              </ul>
            </div>

            {/* 4. Build From Source */}
            <div className="pt-2">
              <h2 className="text-xl font-bold text-text-primary">4. Build From Source (Monorepo)</h2>
              {renderCodeBlock(
                `# Clone repository
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience

# Install all workspace dependencies
npm install

# Build all packages (@junscience/core, @junscience/cli, @junscience/desktop)
npm run build

# Start CLI or Desktop Dev Server
npm run cli
npm run desktop:dev`,
                'bash',
                'install-mono'
              )}
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: QUICKSTART                                                       */}
      {/* ========================================================================= */}
      {section === 'quickstart' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Quick Start Tutorial</h1>
            <p className="text-[15px] text-text-secondary">
              Run your first evidence-anchored scientific research loop in under 2 minutes.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">Step 1: Start Interactive REPL</h2>
            {renderCodeBlock(
              `junscience`,
              'bash',
              'qs-start'
            )}

            <h2 className="text-xl font-bold text-text-primary pt-2">Step 2: Switch to Plan Mode &amp; Inquire</h2>
            <p>
              In the REPL, type <code>/plan</code> to engage deliberate multi-hypothesis exploration:
            </p>
            {renderCodeBlock(
              `junscience [PLAN] > Evaluate the allosteric selectivity of TYK2 JH2 pseudokinase vs ATP catalytic domain across JAK family kinases`,
              'bash',
              'qs-plan'
            )}

            <h2 className="text-xl font-bold text-text-primary pt-2">Step 3: Switch to Act Mode &amp; Execute Tools</h2>
            <p>
              Type <code>/act</code> to autonomously invoke UniProt, ChEMBL, and Python statistical verification:
            </p>
            {renderCodeBlock(
              `junscience [ACT] > Execute the research plan and compute fold selectivity`,
              'bash',
              'qs-act'
            )}
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: USER GUIDE                                                       */}
      {/* ========================================================================= */}
      {section === 'userguide' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">User Guide</h1>
            <p className="text-[15px] text-text-secondary">
              Detailed workflow manual for scientific discovery with JunScience CLI &amp; Desktop.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">1. Planning Mode vs Autonomous Execution</h2>
            <p>
              JunScience operates under a dual-mode interaction model. In <strong>Plan Mode</strong>, the agent focuses on study design, hypothesis trees, and evidence checklists. In <strong>Act Mode</strong>, the agent executes Python scripts, calls biomedical REST APIs, passes the <code>EvidenceVerifier</code> gate, and outputs immutable research artifacts.
            </p>

            <h2 className="text-xl font-bold text-text-primary pt-2">2. Evidence Verification &amp; EV Anchors</h2>
            <p>
              Every claim made by the agent includes a link to an immutable evidence anchor (e.g. <code>[Evidence: EV-001]</code>). These anchors contain the exact raw database response, execution duration, sandbox integrity status, and mathematical sanity verification.
            </p>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: EXAMPLES                                                         */}
      {/* ========================================================================= */}
      {section === 'examples' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Scientific Examples &amp; Workflows</h1>
            <p className="text-[15px] text-text-secondary">
              End-to-end research questions, execution logs, and generated artifacts.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2">
              <h3 className="font-bold text-[15px] text-text-primary">Example 1: Kinase Allosteric Selectivity Profiling</h3>
              <p className="text-[13px] text-text-muted">
                <strong>Inquiry:</strong> &quot;Compare TYK2 JH2 pseudokinase domain vs JAK1/2/3 catalytic domains for Deucravacitinib binding.&quot;
              </p>
              <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-mono">
                Tools called: UniProtTool (P29597, P23458), ChEMBLTool (CHEMBL4297893), PythonRunnerTool (IC50 fold calculation).
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2">
              <h3 className="font-bold text-[15px] text-text-primary">Example 2: FAERS Adverse Event Signal Screening</h3>
              <p className="text-[13px] text-text-muted">
                <strong>Inquiry:</strong> &quot;Screen FDA FAERS adverse event reports for GLP-1 receptor agonists and compute Proportional Reporting Ratios (PRR).&quot;
              </p>
              <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-mono">
                Tools called: openFDATool, PythonRunnerTool (2x2 contingency table &amp; PRR statistics), ClinicalDataGate.
              </div>
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: USE CASES                                                        */}
      {/* ========================================================================= */}
      {section === 'usecases' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Scientific Use Cases</h1>
            <p className="text-[15px] text-text-secondary">
              Where JunScience delivers rigorous, evidence-traceable research acceleration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <h3 className="font-bold text-[15px] text-text-primary">Target Identification &amp; Validation</h3>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Mine PubMed, UniProt, and OpenTargets for target-disease associations and validate druggability with ChEMBL bioactivities.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <h3 className="font-bold text-[15px] text-text-primary">Structural Biology &amp; SAR Mapping</h3>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Fetch PDB macromolecular structures, compute active site binding pockets, and plot SAR activity cliffs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <h3 className="font-bold text-[15px] text-text-primary">Clinical Evidence &amp; Trial Matching</h3>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Synthesize ClinicalTrials.gov v2 inclusion criteria, track phase transitions, and audit adverse event reporting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <h3 className="font-bold text-[15px] text-text-primary">Medical Multimodal Research</h3>
              <p className="text-[12px] text-text-muted leading-relaxed">
                Run local radiomics on DICOM CT/MRI imaging with strict privacy shielding via <code>ClinicalDataGate</code>.
              </p>
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: API REFERENCE                                                    */}
      {/* ========================================================================= */}
      {section === 'apireference' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">TypeScript API Reference</h1>
            <p className="text-[15px] text-text-secondary">
              Core SDK classes and methods available in <code>@junscience/core</code>.
            </p>
          </div>

          <div className="space-y-6 text-[14px] text-text-secondary leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-text-primary font-mono text-accent">EvidenceVerifier</h2>
              <p className="text-[13px] text-text-muted mt-1">
                Codex-style verification middleware for empirical tool outputs.
              </p>
              {renderCodeBlock(
                `import { EvidenceVerifier } from '@junscience/core';

const verifier = new EvidenceVerifier();
const result = verifier.verify(
  'python_runner',
  'computation',
  'IC50 calculation',
  { ic50: 12.5, pValue: 0.002 }
);

// Returns: { verdict: 'ADOPTED' | 'FLAGGED_WITH_WARNING' | 'REJECTED', confidenceScore: 1.0 }`,
                'typescript',
                'api-verifier'
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-text-primary font-mono text-accent">SubagentTreeEngine</h2>
              <p className="text-[13px] text-text-muted mt-1">
                DeepSeek Harness parallel hypothesis branch orchestrator and matrix synthesizer.
              </p>
              {renderCodeBlock(
                `import { SubagentTreeEngine, HypothesisNode } from '@junscience/core';

const engine = new SubagentTreeEngine();
const { hypothesisTree, comparisonMatrix } = await engine.exploreHypothesesParallel(
  sessionId,
  [
    { id: 'hyp-1', targetEntity: 'TYK2', statement: 'JH2 allosteric binding' },
    { id: 'hyp-2', targetEntity: 'JAK1', statement: 'Orthosteric cross-reactivity' },
  ],
  evidenceTracker,
  3 // maxConcurrency
);`,
                'typescript',
                'api-subagent'
              )}
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: ARCHITECTURE                                                     */}
      {/* ========================================================================= */}
      {section === 'architecture' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Architecture &amp; Security Sandboxing</h1>
            <p className="text-[15px] text-text-secondary">
              Deep dive into OS kernel isolation, multi-harness design, and patient data privacy gates.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <div className="rounded-xl overflow-hidden border border-border shadow-xs bg-bg-surface p-2">
              <img
                src={`${import.meta.env.BASE_URL}screenshots/architecture.png`}
                alt="JunScience Core Architecture"
                className="w-full rounded-lg"
              />
            </div>

            <h2 className="text-xl font-bold text-text-primary pt-2">1. Multi-Platform OS Kernel Sandboxing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <span className="font-bold text-[13.5px] text-text-primary block mb-1">macOS Seatbelt</span>
                <p className="text-[12px] text-text-muted">
                  Enforces <code>sandbox-exec</code> kernel policies with air-gapped network blocking (<code>(deny default)</code>) for all Python scripts.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <span className="font-bold text-[13.5px] text-text-primary block mb-1">Linux Bubblewrap</span>
                <p className="text-[12px] text-text-muted">
                  Unprivileged LSM containerization with <code>bwrap --ro-bind / / --proc /proc --unshare-net</code>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border">
                <span className="font-bold text-[13.5px] text-text-primary block mb-1">Windows MIC</span>
                <p className="text-[12px] text-text-muted">
                  Mandatory Integrity Control (<code>Low Integrity Token</code>) + strict workspace ACL directory isolation.
                </p>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: AGENT SKILLS                                                     */}
      {/* ========================================================================= */}
      {section === 'skills' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Scientific Skills &amp; SOP Library (19 Total)</h1>
            <p className="text-[15px] text-text-secondary">
              Standard Operating Procedures (SOPs) packaged as domain-specific skills with sandboxed execution scripts and empirical evidence verification.
            </p>
          </div>

          {/* Skill Management CLI */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
            <h3 className="font-bold text-[14px] text-text-primary flex items-center gap-2">
              <Cpu size={16} className="text-accent" />
              <span>Skill Security Installer (OpenScience-Compatible)</span>
            </h3>
            <p className="text-[13px] text-text-secondary">
              Install verified third-party scientific skills with pre-adoption static security auditing (RCE, path traversal, and gate tampering detection):
            </p>
            {renderCodeBlock(
              `# List all 19 bundled core skills and user-installed skills
junscience skill list

# Install third-party skill from Git or local directory with security check
junscience skill install https://github.com/OpenScience/custom-crispr-screening.git

# Remove user-installed skill
junscience skill remove custom-crispr-screening`,
              'bash',
              'skill-cli'
            )}
          </div>

          {/* 6 Categories Grid */}
          <div className="space-y-6 pt-2">
            {/* Category 1 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>🧬 1. Molecular &amp; Structural Biology</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">sequence-alignment</h3>
                  <p className="text-[12px] text-text-muted">Pairwise &amp; multiple sequence alignment with conserved catalytic/allosteric motif scoring (e.g. TYK2 vs JAK1 JH2 pocket).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">structure-superposition</h3>
                  <p className="text-[12px] text-text-muted">Kabsch 3D coordinate superposition and C-alpha RMSD calculation across PDB crystal structures (PDB 8Q4O).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">protein-domain-architect</h3>
                  <p className="text-[12px] text-text-muted">Deconstructs multidomain protein topological architecture and active site residue annotations from Swiss-Prot.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">pathway-enrichment</h3>
                  <p className="text-[12px] text-text-muted">Hypergeometric over-representation and FDR-adjusted pathway enrichment across KEGG and Reactome datasets.</p>
                </div>
              </div>
            </div>

            {/* Category 2 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>🧪 2. Cheminformatics</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">admet-prediction</h3>
                  <p className="text-[12px] text-text-muted">Lipinski Rule of 5, Veber bioavailability rules, TPSA, and QED drug-likeness scoring.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">chemical-similarity-search</h3>
                  <p className="text-[12px] text-text-muted">Morgan / ECFP4 fingerprint hashing and Tanimoto similarity distance matrix calculation.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">sar-pharmacophore-mapping</h3>
                  <p className="text-[12px] text-text-muted">Correlates chemical substituent modifications with bioactivity and identifies activity cliffs.</p>
                </div>
              </div>
            </div>

            {/* Category 3 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>📊 3. Statistics &amp; Bioinformatics</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">differential-expression-analysis</h3>
                  <p className="text-[12px] text-text-muted">Two-group bulk/single-cell RNA-seq differential gene expression with volcano plot thresholds (MASLD hepatic transcriptome).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">survival-analysis</h3>
                  <p className="text-[12px] text-text-muted">Non-parametric Kaplan-Meier survival curves, Log-Rank hypothesis testing, and hazard ratios.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">meta-analysis-forest-plot</h3>
                  <p className="text-[12px] text-text-muted">Fixed and random-effects clinical trial meta-analysis with Cochran Q and I² heterogeneity statistics.</p>
                </div>
              </div>
            </div>

            {/* Category 4 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>🏥 4. Clinical &amp; Pharmacovigilance</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">adverse-event-signal-detection</h3>
                  <p className="text-[12px] text-text-muted">openFDA FAERS reporting disproportionality (ROR / PRR) with 95% confidence intervals.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">clinical-trial-eligibility-matching</h3>
                  <p className="text-[12px] text-text-muted">Matches patient clinical parameters against ClinicalTrials.gov Protocol Section criteria (e.g. MAESTRO-NASH NCT03900429).</p>
                </div>
              </div>
            </div>

            {/* Category 5 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>📚 5. Literature &amp; Systematic Review</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">systematic-review-prisma</h3>
                  <p className="text-[12px] text-text-muted">PRISMA 2020 4-phase systematic review flow tracking: Identification, Deduplication, Screening, and Inclusion.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">citation-network-mapping</h3>
                  <p className="text-[12px] text-text-muted">Directed citation/co-citation graphs and in-degree hub authority identification.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">bibliometric-analysis</h3>
                  <p className="text-[12px] text-text-muted">Publication velocity trends, journal impact distributions, and collaborative author clusters.</p>
                </div>
              </div>
            </div>

            {/* Category 6 */}
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2.5 flex items-center gap-2">
                <span>🔬 6. Imaging, Writing &amp; Reproducibility</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">radiomics-feature-extraction</h3>
                  <p className="text-[12px] text-text-muted">Quantitative abdominal CT hepatic attenuation (HU) and GLCM texture features.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">manuscript-formatting</h3>
                  <p className="text-[12px] text-text-muted">Structures trial results into publication-ready manuscripts (e.g. Journal of Hepatology).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">figure-generation</h3>
                  <p className="text-[12px] text-text-muted">300 DPI publication-grade vector graphics with Okabe-Ito colorblind palettes.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-bg-surface border border-border space-y-1">
                  <h3 className="font-bold text-[14px] text-text-primary">reproducibility-packaging</h3>
                  <p className="text-[12px] text-text-muted">Deterministic reproducibility bundles with SHA-256 digests and environment manifests.</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: CONTRIBUTING                                                     */}
      {/* ========================================================================= */}
      {section === 'contributing' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Contributing to JunScience</h1>
            <p className="text-[15px] text-text-secondary">
              How to add scientific tools, write domain skills, and improve the agent runtime.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">Development Workflow</h2>
            {renderCodeBlock(
              `# 1. Fork and clone the repository
git clone https://github.com/Benjamin-JHou/JunScience.git

# 2. Install dependencies
npm install

# 3. Run test suites
npm test`,
              'bash',
              'contrib-setup'
            )}
          </div>
        </article>
      )}

      {/* ========================================================================= */}
      {/* SECTION: CHANGELOG                                                        */}
      {/* ========================================================================= */}
      {section === 'changelog' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Changelog &amp; Releases</h1>
            <p className="text-[15px] text-text-secondary">
              Official releases, verifiable improvements, and roadmap milestones.
            </p>
          </div>

          <div className="space-y-6 text-[14px]">
            {/* Release v1.1.0 */}
            <div className="p-5 rounded-2xl bg-bg-surface border border-accent/30 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-accent text-white">v1.1.0</span>
                  <span className="font-bold text-[15px] text-text-primary">Expanded Scientific Skills &amp; Security Guardrail Release</span>
                </div>
                <span className="text-[12px] text-text-muted font-mono">August 2026</span>
              </div>
              <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
                <li><strong>Confined Workspace File Editor (<code>FileEditorTool</code>)</strong>: Dedicated workspace text editor with view, str_replace, line insertion, and append with zero host escape.</li>
                <li><strong>Skill Security Installer (<code>SkillInstaller</code>)</strong>: Automated static security audit against RCE, path traversal, hook bypass, and token snooping with capability cards.</li>
                <li><strong>19 Domain-Specific Scientific Skills</strong>: Expanded from 4 to 19 skills across Molecular Biology, Cheminformatics, Statistics, Clinical, Literature, and Imaging with 100% real-data verification.</li>
                <li><strong>Formal Lifecycle Guardrail Hooks (<code>HookRegistry</code>)</strong>: PreToolUse secret redaction, EvidenceVerifier gate, ClinicalDataGate, and evidence completeness checking.</li>
                <li><strong>Subagent Hypothesis Tree &amp; Explicit Plan Tracker</strong>: Parallel hypothesis exploration with empirical confidence differentiation and 5-stage milestone tracking.</li>
                <li><strong>Real-World Clinical Grounding</strong>: Direct integration with ClinicalTrials.gov v2 (MAESTRO-NASH NCT03900429), openFDA FAERS, RxNorm, and DailyMed.</li>
              </ul>
            </div>

            {/* Release v0.1.0 */}
            <div className="p-5 rounded-2xl bg-bg-surface border border-border space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-slate-500 text-white">v0.1.0</span>
                  <span className="font-bold text-[15px] text-text-primary">JunScience Initial Architecture Release</span>
                </div>
                <span className="text-[12px] text-text-muted font-mono">August 2026</span>
              </div>
              <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
                <li><strong>Interactive CLI Agent with Dual-Mode Execution</strong>: Interactive REPL with <code>/model</code>, <code>/plan</code>, <code>/act</code>, <code>/cost</code>, and streaming tool progress.</li>
                <li><strong>EvidenceVerifier Gate</strong>: Sanity bounds, numerical limits (p ∈ [0,1], IC50 &gt; 0, HU ∈ [-1024,3071]) and anomaly prevention.</li>
                <li><strong>Cross-Platform OS Sandboxes</strong>: macOS Seatbelt, Linux Bubblewrap, Windows Low-Integrity verified on GitHub Actions CI.</li>
              </ul>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
