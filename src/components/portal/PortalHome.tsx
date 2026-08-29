import React, { useState } from 'react';
import {
  ArrowRight,
  Github,
  Bot,
  Wrench,
  Layers,
  Users,
  Search,
  Dna,
  FlaskConical,
  Code2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Zap,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Activity,
  Cpu,
  Database,
  Pill,
  Sparkles,
  Sliders,
  DollarSign,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { PortalHeroVisual } from './PortalHeroVisual';
import { useNav } from '../../context/NavContext';

export const PortalHome: React.FC = () => {
  const { setActiveSection } = useNav();
  const [activeGalleryTab, setActiveGalleryTab] = useState<'desktop-light' | 'desktop-dark' | 'workspace' | 'cli'>('desktop-light');
  const [activeCliColor, setActiveCliColor] = useState<'green' | 'blue' | 'purple' | 'amber'>('green');
  const [activeCodeTab, setActiveCodeTab] = useState<'cli-curl' | 'cli-npm' | 'cli-npx' | 'git' | 'desktop' | 'sdk'>('cli-curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeModeDemo, setActiveModeDemo] = useState<'plan' | 'act'>('plan');

  const codeSnippets = {
    'cli-curl': `# Install JunScience CLI via one-line installer (macOS & Linux)
curl -fsSL https://benjamin-jhou.github.io/JunScience/install.sh | bash

# Launch interactive scientific agent
junscience`,
    'cli-npm': `# Install JunScience CLI globally via npm
npm install -g @junscience/cli

# Start interactive research REPL
junscience

# Or run one-shot scientific research task
junscience research "Analyze TYK2 JH2 pseudokinase binding"`,
    'cli-npx': `# Run instantly without installation via npx
npx @junscience/cli

# Run one-shot research directly
npx @junscience/cli research "Screen FAERS adverse events for Deucravacitinib"`,
    git: `# 1. Clone JunScience repository
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience

# 2. Install workspace dependencies
npm install

# 3. Launch autonomous research inquiry in CLI
npm run cli`,
    desktop: `# Launch the JunScience Desktop Electron interface
npm run desktop:dev

# Or build native desktop application (.dmg / .exe / .AppImage)
npm run build`,
    sdk: `import { AutonomousResearchEngine, globalToolRegistry } from '@junscience/core';

// Initialize the scientific research engine
const engine = new AutonomousResearchEngine({
  maxTurns: 16,
  modelProvider: activeModelProvider,
});

// Run evidence-anchored autonomous inquiry
const turn = await engine.run(session, "Screen FAERS adverse events for Deucravacitinib");
console.log(turn.agentResponse);`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-14 sm:space-y-20 py-4 sm:py-8 px-4 sm:px-8 max-w-[1240px] mx-auto">
      {/* 1. HERO SECTION */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pt-2 sm:pt-6">
        <div className="flex-1 max-w-2xl text-left space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[12px] font-medium">
              <Sparkles size={14} />
              <span>Evidence-First AI Agent Workstation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
              <span className="text-text-primary">JunScience</span>
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-secondary to-purple-600 bg-clip-text text-transparent">
                AI
              </span>{' '}
              <span className="text-text-primary font-bold">for Scientific Discovery</span>
            </h1>
            <p className="text-[14.5px] sm:text-[16px] text-text-secondary leading-relaxed pt-1">
              JunScience is an open-source AI agent framework for scientific research.
              It explores literature, queries biological databases, executes Python workflows,
              and generates reproducible research artifacts with full evidence traceability.
            </p>
          </div>

          {/* Quick One-Liner Install Banner */}
          <div className="p-3.5 rounded-xl border border-border bg-[#070A10] text-[#E2E8F0] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-accent font-semibold">
                <Terminal size={13} />
                <span>QUICK INSTALL (CLI AGENT)</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('curl -fsSL https://benjamin-jhou.github.io/JunScience/install.sh | bash');
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 font-mono text-[13px] text-emerald-400 select-all overflow-x-auto py-0.5">
              <span className="text-slate-500 select-none">$</span>
              <span>curl -fsSL https://benjamin-jhou.github.io/JunScience/install.sh | bash</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setActiveSection('installation')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold text-[13.5px] shadow-sm transition-all active:scale-98"
            >
              <Download size={16} />
              <span>Download Desktop App</span>
            </button>
            <button
              onClick={() => setActiveSection('cli')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent font-semibold text-[13.5px] shadow-2xs transition-all active:scale-98"
            >
              <Terminal size={16} />
              <span>Explore CLI Agent</span>
              <ArrowRight size={15} />
            </button>
            <a
              href="https://github.com/Benjamin-JHou/JunScience"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-bg-surface hover:bg-bg-hover text-text-secondary hover:text-text-primary font-medium text-[13.5px] transition-all shadow-2xs"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Hero Graphic Visual */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md lg:max-w-none">
          <PortalHeroVisual />
        </div>
      </section>

      {/* 2. CAPABILITY STRIP (4 Pillars) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-bg-surface border border-border shadow-xs">
        <div className="flex items-start gap-3.5 p-2">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-accent flex-shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary mb-1">AI-Powered Agents</h3>
            <p className="text-[12px] text-text-muted leading-relaxed">
              Plan Mode &amp; Act Mode orchestration with multi-hypothesis exploration.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
            <Wrench size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary mb-1">Scientific Tools</h3>
            <p className="text-[12px] text-text-muted leading-relaxed">
              PubMed, UniProt, ChEMBL, PDB, and sandboxed Python data compute.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 flex-shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary mb-1">Reproducible Research</h3>
            <p className="text-[12px] text-text-muted leading-relaxed">
              Immutable EV-xxx evidence anchors, provenance logs, and critique gating.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-text-primary mb-1">Open Source</h3>
            <p className="text-[12px] text-text-muted leading-relaxed">
              MIT License. Built for researchers, bioinformaticians, and developers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CLI AGENT WORKFLOW & COMMANDS SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-accent">
              <Terminal size={14} />
              <span>Interactive CLI Agent</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Powerful Terminal Agent. Fast, Hypothesis-Driven Discovery.
            </h2>
            <p className="text-[14px] text-text-secondary">
              Seamlessly switch between deliberative <strong>Plan Mode</strong> and autonomous <strong>Act Mode</strong>, configure models with <code>/model</code>, and track scientific evidence in real time.
            </p>
          </div>

          <button
            onClick={() => setActiveSection('cli')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline"
          >
            <span>View Full CLI Manual</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Dual Mode Switcher & Terminal Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Command & Mode Highlights */}
          <div className="lg:col-span-5 space-y-4">
            {/* Plan vs Act Mode Card */}
            <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3">
              <h3 className="font-bold text-[14px] text-text-primary flex items-center gap-2">
                <Sliders size={16} className="text-accent" />
                <span>Agent Execution Modes</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveModeDemo('plan')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    activeModeDemo === 'plan'
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'border-border bg-bg-elevated/40 text-text-muted hover:text-text-primary'
                  }`}
                >
                  <div className="text-[13px] font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    /plan Mode
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Structured planning, literature review, and hypothesis formulation without tool side effects.
                  </p>
                </button>

                <button
                  onClick={() => setActiveModeDemo('act')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    activeModeDemo === 'act'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-border bg-bg-elevated/40 text-text-muted hover:text-text-primary'
                  }`}
                >
                  <div className="text-[13px] font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    /act Mode
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Autonomous tool execution (PubMed, UniProt, ChEMBL, Python) &amp; artifact generation.
                  </p>
                </button>
              </div>
            </div>

            {/* Essential Commands Cheat Sheet */}
            <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-2.5 text-[12.5px]">
              <h3 className="font-bold text-[14px] text-text-primary flex items-center gap-2">
                <Code2 size={16} className="text-accent" />
                <span>Essential Slash Commands</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated/50 font-mono text-[12px]">
                  <span className="text-accent font-bold">/model</span>
                  <span className="text-text-secondary">Switch LLM or configure API key</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated/50 font-mono text-[12px]">
                  <span className="text-purple-500 font-bold">/plan | /act</span>
                  <span className="text-text-secondary">Toggle Planning vs Execution mode</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated/50 font-mono text-[12px]">
                  <span className="text-emerald-500 font-bold">/tools</span>
                  <span className="text-text-secondary">List registered scientific database tools</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated/50 font-mono text-[12px]">
                  <span className="text-amber-500 font-bold">/cost | /tokens</span>
                  <span className="text-text-secondary">Track session token usage &amp; API costs</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated/50 font-mono text-[12px]">
                  <span className="text-cyan-500 font-bold">/compact</span>
                  <span className="text-text-secondary">Compress context memory with EV anchors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Terminal View */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-[#070A10] text-[#E2E8F0] overflow-hidden shadow-lg flex flex-col">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-slate-300 ml-2 font-semibold">junscience — interactive scientific repl</span>
              </div>
              <span className="text-slate-500 font-mono">v1.0.0</span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-5 font-mono text-[12.5px] leading-relaxed space-y-3 flex-1 overflow-x-auto text-left">
              {activeModeDemo === 'plan' ? (
                <>
                  <div className="text-cyan-400">
                    junscience config set --model deepseek-chat --api-key sk-***
                  </div>
                  <div className="text-emerald-400">✔ Active model profile set: DeepSeek Chat (deepseek-chat)</div>
                  <div className="text-purple-400">
                    junscience &gt; /plan
                  </div>
                  <div className="text-purple-300">✔ Switched to PLAN MODE. Formulating 5-stage research strategy...</div>
                  <div className="text-slate-400 pt-1">
                    <span className="text-purple-400 font-bold">[PLAN] junscience &gt;</span> Evaluate TYK2 JH2 pseudokinase allosteric selectivity
                  </div>
                  <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-200 text-[12px] space-y-1">
                    <div className="font-bold text-purple-300">📋 Proposed 5-Stage Scientific Research Plan:</div>
                    <div>1. Query UniProt (P29597) for JH2 pseudokinase domain vs JH1 catalytic domain</div>
                    <div>2. Retrieve ChEMBL IC50 / Kd values for allosteric inhibitors (Deucravacitinib)</div>
                    <div>3. Cross-reference RCSB PDB structure 6NZP (JH2 complex) with JAK1/2/3 selectivity</div>
                    <div>4. Run Python PythonRunnerTool for sub-nanomolar selectivity fold ratio computation</div>
                    <div>5. Verify mathematical anomalies via EvidenceVerifier &amp; anchor EV-001..EV-004</div>
                  </div>
                  <div className="text-slate-500 text-[11px] italic">
                    Type /act to start autonomous tool execution and artifact synthesis.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-slate-400">
                    <span className="text-emerald-400 font-bold">[ACT] junscience &gt;</span> Execute TYK2 JH2 selectivity workflow
                  </div>
                  <div className="text-amber-400 flex items-center gap-2">
                    <span className="animate-pulse">⚡</span>
                    <span>Calling UniProtTool [query: P29597, domain: JH2]...</span>
                  </div>
                  <div className="text-slate-300 pl-4 border-l-2 border-emerald-500/50">
                    Found TYK2 (P29597): JH2 domain residues 590-880, JH1 kinase domain residues 881-1187.
                  </div>
                  <div className="text-amber-400 flex items-center gap-2">
                    <span className="animate-pulse">⚡</span>
                    <span>Calling ChEMBLTool [target: CHEMBL4630, type: IC50]...</span>
                  </div>
                  <div className="text-slate-300 pl-4 border-l-2 border-emerald-500/50">
                    Deucravacitinib (CHEMBL4297893): JH2 IC50 = 0.2 nM vs JAK1/2/3 IC50 &gt; 10,000 nM (&gt;1000x selective).
                  </div>
                  <div className="text-emerald-400 font-bold">
                    ✔ EvidenceVerifier: Verdict = ADOPTED (Confidence: 1.0, Evidence: EV-001)
                  </div>
                  <div className="text-cyan-300">
                    📄 Artifact generated: Figure_1_Selectivity_Radar.png &amp; TYK2_Selectivity_Report.md
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ARCHITECTURE OVERVIEW & FLOWCHART */}
      <section className="space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Architecture
          </h2>
          <p className="text-[14px] text-text-secondary">
            JunScience is built on a modular, extensible architecture with multiple agent harnesses.
          </p>
        </div>

        {/* Horizontal Flowchart Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-2 items-center">
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-accent font-semibold text-[13px]">
              <Eye size={15} />
              <span>User Interface</span>
            </div>
            <p className="text-[11.5px] text-text-muted">CLI Agent / Desktop App</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[13px]">
              <Cpu size={15} />
              <span>JunScience Core</span>
            </div>
            <p className="text-[11.5px] text-text-muted">Plan Mode / To-Do Tracker / Memory</p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[13px]">
              <Bot size={15} />
              <span>Agent Harness</span>
            </div>
            <p className="text-[11.5px] text-text-muted">DeepSeek Subagent Tree</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[13px]">
              <Wrench size={15} />
              <span>Scientific Tools</span>
            </div>
            <p className="text-[11.5px] text-text-muted">PubMed / UniProt / ChEMBL / PDB</p>
          </div>

          <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold text-[13px]">
              <FileText size={15} />
              <span>Verified Results</span>
            </div>
            <p className="text-[11.5px] text-text-muted">EV Anchors &amp; Citations</p>
          </div>
        </div>
      </section>

      {/* 5. QUICK START CODE SNIPPETS (Multi-Tab Installer) */}
      <section className="space-y-4">
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Installation &amp; Quick Start
          </h2>
          <p className="text-[14px] text-text-secondary">
            Get started with JunScience CLI or Desktop in seconds.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-border bg-bg-elevated/50 gap-2">
            <div className="flex flex-wrap items-center gap-1 text-[12px]">
              <button
                onClick={() => setActiveCodeTab('cli-curl')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'cli-curl' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                curl (macOS/Linux)
              </button>
              <button
                onClick={() => setActiveCodeTab('cli-npm')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'cli-npm' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                npm install -g
              </button>
              <button
                onClick={() => setActiveCodeTab('cli-npx')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'cli-npx' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                npx (Zero-Install)
              </button>
              <button
                onClick={() => setActiveCodeTab('git')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'git' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Git Clone
              </button>
              <button
                onClick={() => setActiveCodeTab('desktop')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'desktop' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Desktop App
              </button>
              <button
                onClick={() => setActiveCodeTab('sdk')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'sdk' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                TypeScript SDK
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11.5px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-4 text-[12.5px] font-mono text-text-primary overflow-x-auto bg-[#070A10] text-[#E2E8F0] leading-relaxed text-left">
            <code>{codeSnippets[activeCodeTab]}</code>
          </pre>
        </div>
      </section>

      {/* 6. REAL INTERFACE SHOWCASE (Real Screenshots Gallery) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              One Scientific Agent. Multiple Interfaces.
            </h2>
            <p className="text-[14px] text-text-secondary">
              Experience JunScience in native Desktop Electron or high-speed CLI terminal.
            </p>
          </div>

          {/* Gallery Switch Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-elevated border border-border text-[12px]">
            <button
              onClick={() => setActiveGalleryTab('desktop-light')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeGalleryTab === 'desktop-light' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Desktop Light
            </button>
            <button
              onClick={() => setActiveGalleryTab('desktop-dark')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeGalleryTab === 'desktop-dark' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Desktop Dark
            </button>
            <button
              onClick={() => setActiveGalleryTab('workspace')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeGalleryTab === 'workspace' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Workspace View
            </button>
            <button
              onClick={() => setActiveGalleryTab('cli')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeGalleryTab === 'cli' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              CLI Terminal
            </button>
          </div>
        </div>

        {/* Screenshot Container */}
        <div className="p-3 sm:p-5 rounded-2xl bg-bg-surface border border-border shadow-md overflow-hidden">
          {activeGalleryTab === 'desktop-light' && (
            <div className="space-y-3">
              <img
                src="./screenshots/screenshot_desktop_light.png"
                alt="JunScience Desktop Light Theme"
                className="w-full rounded-xl border border-border/80 shadow-sm"
              />
              <p className="text-[12px] text-text-muted text-center">
                JunScience Desktop Light Mode — High-density research workspace with real-time Plan &amp; To-Do tracker.
              </p>
            </div>
          )}

          {activeGalleryTab === 'desktop-dark' && (
            <div className="space-y-3">
              <img
                src="./screenshots/screenshot_desktop_dark.png"
                alt="JunScience Desktop Dark Theme"
                className="w-full rounded-xl border border-border/80 shadow-sm"
              />
              <p className="text-[12px] text-text-muted text-center">
                JunScience Desktop Dark Mode — Deep navy theme tailored for prolonged academic discovery.
              </p>
            </div>
          )}

          {activeGalleryTab === 'workspace' && (
            <div className="space-y-3">
              <img
                src="./screenshots/screenshot_m2_workspace.png"
                alt="JunScience Workspace Active Research Loop"
                className="w-full rounded-xl border border-border/80 shadow-sm"
              />
              <p className="text-[12px] text-text-muted text-center">
                Interactive Workspace — Autonomous ReAct execution with tool outputs, live logs, and EV-xxx provenance tags.
              </p>
            </div>
          )}

          {activeGalleryTab === 'cli' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[12px] text-text-muted">Color theme:</span>
                {(['green', 'blue', 'purple', 'amber'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveCliColor(color)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono capitalize border ${
                      activeCliColor === color
                        ? 'bg-accent/15 border-accent text-accent font-bold'
                        : 'border-border text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              <img
                src={`./screenshots/screenshot_cli_${activeCliColor}.png`}
                alt={`JunScience CLI ${activeCliColor} theme`}
                className="w-full max-w-4xl mx-auto rounded-xl border border-border/80 shadow-sm"
              />
              <p className="text-[12px] text-text-muted text-center">
                JunScience CLI — Ultra-fast terminal execution with live ASCII To-Do checklists and streaming thought flow.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
