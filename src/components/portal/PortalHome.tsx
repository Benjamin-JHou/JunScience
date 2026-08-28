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
} from 'lucide-react';
import { PortalHeroVisual } from './PortalHeroVisual';
import { useNav } from '../../context/NavContext';

export const PortalHome: React.FC = () => {
  const { setActiveSection } = useNav();
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'desktop-light' | 'desktop-dark' | 'workspace' | 'cli'>('desktop-light');
  const [activeCliColor, setActiveCliColor] = useState<'green' | 'blue' | 'purple' | 'amber'>('green');
  const [activeCodeTab, setActiveCodeTab] = useState<'cli' | 'desktop' | 'sdk'>('cli');
  const [copiedCode, setCopiedCode] = useState(false);

  const citationText = `Hou, B., et al. (2025). JunScience: An Open-Source AI Agent Framework for Scientific Discovery. (Coming soon)`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const codeSnippets = {
    cli: `# 1. Clone JunScience repository
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience

# 2. Install workspace dependencies
npm install

# 3. Launch autonomous research inquiry in CLI
npm run cli research "Investigate TYK2 JH2 allosteric domain vs ATP orthosteric binding selectivity"`,
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
      {/* 1. HERO SECTION (Matching 1.png) */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pt-2 sm:pt-6">
        <div className="flex-1 max-w-2xl text-left space-y-4 sm:space-y-6">
          <div className="space-y-2">
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
              It understands, explores, analyzes, and generates — accelerating
              research across biology, chemistry, materials, physics, and beyond.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveSection('quickstart')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-[13.5px] shadow-sm transition-all active:scale-98"
            >
              <span>Quick Start</span>
              <ArrowRight size={15} />
            </button>
            <a
              href="https://github.com/Benjamin-JHou/JunScience"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-bg-surface hover:bg-bg-hover text-text-primary font-medium text-[13.5px] transition-all shadow-2xs"
            >
              <Github size={16} />
              <span>GitHub Repo</span>
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
              Autonomous agents collaborate to complete complex scientific research.
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
              16+ built-in tools for literature, molecules, clinical data, and more.
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
              Provenance tracking, citations, EV anchors, and environment capture.
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
              Built for researchers. Open for everyone under MIT License.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURE OVERVIEW & FLOWCHART (Matching 1.png) */}
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
          {/* Card 1: User Interface */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-accent font-semibold text-[13px]">
              <Eye size={15} />
              <span>User Interface</span>
            </div>
            <p className="text-[11.5px] text-text-muted">Desktop / CLI / Web</p>
          </div>

          {/* Card 2: JunScience Core */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[13px]">
              <Cpu size={15} />
              <span>JunScience Core</span>
            </div>
            <p className="text-[11.5px] text-text-muted">Agent Orchestration / Memory / Planning</p>
          </div>

          {/* Card 3: Agent Harnesses */}
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[13px]">
              <Layers size={15} />
              <span>Agent Harnesses</span>
            </div>
            <p className="text-[11.5px] text-text-muted">DeepSeek / Pi / Codex Runtime</p>
          </div>

          {/* Card 4: Scientific Tools & Skills */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[13px]">
              <Wrench size={15} />
              <span>Scientific Tools & Skills</span>
            </div>
            <p className="text-[11.5px] text-text-muted">Databases / Python / Domain Skills</p>
          </div>

          {/* Card 5: Results & Artifacts */}
          <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 text-center space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold text-[13px]">
              <FileText size={15} />
              <span>Results & Artifacts</span>
            </div>
            <p className="text-[11.5px] text-text-muted">Reports / Figures / Provenance</p>
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            onClick={() => setActiveSection('architecture')}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover hover:underline"
          >
            <span>Learn more about architecture</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* 4. THREE-CARD ARCHITECTURE DETAILS GRID (Matching 1.png) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Agent Harnesses */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">Agent Harnesses</h3>
              <p className="text-[12px] text-text-muted">Run JunScience on multiple powerful harnesses.</p>
            </div>

            <div className="space-y-3 pt-1">
              {/* DeepSeek */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-bg-elevated/60 border border-border-subtle">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-accent flex-shrink-0 mt-0.5">
                  <Bot size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-text-primary">DeepSeek Harness</span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Available
                    </span>
                  </div>
                  <p className="text-[11.5px] text-text-muted mt-0.5 leading-snug">
                    Event-driven runtime with parallel hypothesis subagent tree and tool execution.
                  </p>
                </div>
              </div>

              {/* Pi */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-bg-elevated/60 border border-border-subtle">
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
                  <Zap size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-text-primary">Pi Harness</span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-slate-500/10 text-text-muted border border-slate-500/20">
                      Planned
                    </span>
                  </div>
                  <p className="text-[11.5px] text-text-muted mt-0.5 leading-snug">
                    Modular agent core with unified LLM API and streaming abstraction.
                  </p>
                </div>
              </div>

              {/* Codex */}
              <div className="flex items-start gap-3 p-2 rounded-lg bg-bg-elevated/60 border border-border-subtle">
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 flex-shrink-0 mt-0.5">
                  <Code2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-text-primary">Codex Harness</span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Experimental
                    </span>
                  </div>
                  <p className="text-[11.5px] text-text-muted mt-0.5 leading-snug">
                    Code-first agent runtime with terminal, coding, and evidence patch verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4">
            <button
              onClick={() => setActiveSection('architecture')}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-hover"
            >
              <span>Explore harnesses</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: Key Capabilities */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">Key Capabilities</h3>
              <p className="text-[12px] text-text-muted">Repository-backed scientific functions.</p>
            </div>

            <div className="space-y-2.5 pt-1 text-[12.5px]">
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Search size={15} className="text-accent flex-shrink-0" />
                <span>Literature search &amp; knowledge mining</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Dna size={15} className="text-accent-secondary flex-shrink-0" />
                <span>Molecular &amp; biological data analysis</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Sparkles size={15} className="text-purple-500 flex-shrink-0" />
                <span>Experiment design &amp; hypothesis generation</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Terminal size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Python execution &amp; data visualization</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <ShieldCheck size={15} className="text-cyan-500 flex-shrink-0" />
                <span>Critique, revision &amp; reproducible reporting</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <CheckCircle2 size={15} className="text-accent flex-shrink-0" />
                <span>Citations, provenance &amp; evidence tracking</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4">
            <button
              onClick={() => setActiveSection('docs')}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-hover"
            >
              <span>View all features</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 3: Use Cases */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-text-primary">Use Cases</h3>
              <p className="text-[12px] text-text-muted">Real-world research applications.</p>
            </div>

            <div className="space-y-2.5 pt-1 text-[12.5px]">
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Pill size={15} className="text-purple-500 flex-shrink-0" />
                <span>Drug discovery &amp; repurposing</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Dna size={15} className="text-blue-500 flex-shrink-0" />
                <span>Single-cell / multi-omics analysis</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Layers size={15} className="text-cyan-500 flex-shrink-0" />
                <span>Materials design &amp; simulation</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <FileText size={15} className="text-emerald-500 flex-shrink-0" />
                <span>Scientific writing &amp; literature review</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Activity size={15} className="text-amber-500 flex-shrink-0" />
                <span>Data analysis &amp; visualization</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Bot size={15} className="text-accent flex-shrink-0" />
                <span>Education &amp; research assistance</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4">
            <button
              onClick={() => setActiveSection('usecases')}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-hover"
            >
              <span>See more use cases</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. SCIENTIFIC RESEARCH WORKFLOW (Section 9 in MD) */}
      <section className="space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Scientific Research Workflow
          </h2>
          <p className="text-[14px] text-text-secondary">
            From natural language inquiry to verified, reproducible scientific report.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
          {[
            { step: '1. Ask', desc: 'Define scientific hypothesis', icon: Bot, color: 'text-blue-500' },
            { step: '2. Plan', desc: 'Explicit To-Do task checklist', icon: CheckCircle2, color: 'text-cyan-500' },
            { step: '3. Search', desc: 'Query 4-pillar data sources', icon: Search, color: 'text-purple-500' },
            { step: '4. Verify', desc: 'Codex-style EvidenceVerifier', icon: ShieldCheck, color: 'text-emerald-500' },
            { step: '5. Compute', desc: 'Python sandbox radiomics', icon: Terminal, color: 'text-amber-500' },
            { step: '6. Critique', desc: 'PMID/NCT authenticity gate', icon: Activity, color: 'text-red-500' },
            { step: '7. Report', desc: 'EV-xxx Traceability Index', icon: FileText, color: 'text-accent' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-bg-surface border border-border flex flex-col items-center space-y-2 shadow-2xs">
                <div className={`p-2 rounded-lg bg-bg-elevated ${item.color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <span className="text-[13px] font-bold text-text-primary block">{item.step}</span>
                  <span className="text-[11px] text-text-muted leading-tight block mt-0.5">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FOUR DATA PILLARS GRID */}
      <section className="space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Authoritative Biomedical &amp; Scientific Data Pillars
          </h2>
          <p className="text-[14px] text-text-secondary">
            Pure empirical connections to official databases and open research repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-accent font-bold text-[14px]">
              <Search size={16} />
              <span>Literature &amp; Benchmarks</span>
            </div>
            <ul className="text-[12px] text-text-secondary space-y-1.5">
              <li>• <strong>PubMed (NCBI)</strong>: 36M+ peer-reviewed papers</li>
              <li>• <strong>arXiv &amp; bioRxiv</strong>: Preprints &amp; medical AI</li>
              <li>• <strong>OpenAlex / CrossRef</strong>: Citation graph &amp; DOIs</li>
              <li>• <strong>Papers With Code / HF Hub</strong>: SOTA code &amp; models</li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-[14px]">
              <Dna size={16} />
              <span>Molecular &amp; Structure</span>
            </div>
            <ul className="text-[12px] text-text-secondary space-y-1.5">
              <li>• <strong>UniProtKB</strong>: Swiss-Prot curated sequences</li>
              <li>• <strong>RCSB PDB</strong>: Search v2 3D crystal structures</li>
              <li>• <strong>AlphaFold DB</strong>: 3D structure predictions &amp; pLDDT</li>
              <li>• <strong>InterPro</strong>: Domain topologies &amp; motifs</li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-purple-500 font-bold text-[14px]">
              <FlaskConical size={16} />
              <span>Chemistry &amp; Pharmacology</span>
            </div>
            <ul className="text-[12px] text-text-secondary space-y-1.5">
              <li>• <strong>ChEMBL</strong>: Bioactivities (IC50/Ki) &amp; SAR assays</li>
              <li>• <strong>PubChem</strong>: PUG REST chemical structures</li>
              <li>• <strong>RxNorm / RxNav</strong>: RxCUI, NLM Drug-Drug Interactions</li>
              <li>• <strong>DailyMed</strong>: Official FDA package labels</li>
            </ul>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-500 font-bold text-[14px]">
              <Activity size={16} />
              <span>Clinical &amp; Multimodal AI</span>
            </div>
            <ul className="text-[12px] text-text-secondary space-y-1.5">
              <li>• <strong>ClinicalTrials.gov v2</strong>: Study phases &amp; criteria</li>
              <li>• <strong>openFDA</strong>: FAERS adverse events &amp; safety signals</li>
              <li>• <strong>Local Radiomics</strong>: 3D CT/MRI feature extraction</li>
              <li>• <strong>ClinicalDataGate</strong>: Patient privacy protection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. REAL INTERFACE SHOWCASE (Real Screenshots Gallery) */}
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

      {/* 8. QUICK START CODE SNIPPETS (Section 13 in MD) */}
      <section className="space-y-4">
        <div className="text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Quick Start
          </h2>
          <p className="text-[14px] text-text-secondary">
            Get started with JunScience in under two minutes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-surface overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-elevated/50">
            <div className="flex items-center gap-1.5 text-[12px]">
              <button
                onClick={() => setActiveCodeTab('cli')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeCodeTab === 'cli' ? 'bg-bg-surface text-accent shadow-xs' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                CLI Agent
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
                TypeScript Core SDK
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

          <pre className="p-4 text-[12.5px] font-mono text-text-primary overflow-x-auto bg-[#070A10] text-[#E2E8F0] leading-relaxed">
            <code>{codeSnippets[activeCodeTab]}</code>
          </pre>
        </div>
      </section>

      {/* 9. ACADEMIC CITATION BANNER (Matching 1.png bottom banner) */}
      <section className="p-4 sm:p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-accent text-white">
            Cite JunScience
          </span>
          <span className="text-[12.5px] text-text-secondary">
            {citationText}
          </span>
        </div>

        <button
          onClick={handleCopyCitation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-bg-surface hover:bg-bg-hover text-[12px] font-medium text-text-primary transition-all shadow-2xs"
        >
          {copiedCitation ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          <span>{copiedCitation ? 'Copied' : 'Copy Citation'}</span>
        </button>
      </section>
    </div>
  );
};
