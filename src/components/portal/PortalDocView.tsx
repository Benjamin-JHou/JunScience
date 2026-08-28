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
  AlertTriangle,
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
      <pre className="p-4 text-[12.5px] font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-8 max-w-[960px] mx-auto text-left space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-text-muted">
        <button onClick={() => setActiveSection('home')} className="hover:text-text-primary hover:underline">
          Home
        </button>
        <span>/</span>
        <span className="capitalize font-medium text-text-primary">{section}</span>
      </div>

      {/* SECTION: DOCS (Overview & Concepts) */}
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

      {/* SECTION: INSTALLATION */}
      {section === 'installation' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Installation Guide</h1>
            <p className="text-[15px] text-text-secondary">
              Prerequisites, repository setup, CLI execution, and Desktop installer downloads.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">1. Prerequisites</h2>
            <ul className="list-disc list-inside space-y-1 text-[13.5px] text-text-secondary">
              <li><strong>Node.js</strong>: version 20.x or 22.x LTS</li>
              <li><strong>Python</strong>: version 3.10+ (standard library only for sandbox execution)</li>
              <li><strong>Git</strong>: latest version</li>
            </ul>

            <h2 className="text-xl font-bold text-text-primary pt-2">2. Install Monorepo</h2>
            {renderCodeBlock(
              `# Clone repository
git clone https://github.com/Benjamin-JHou/JunScience.git
cd JunScience

# Install all workspace dependencies
npm install

# Build all packages (@junscience/core, @junscience/cli, @junscience/desktop)
npm run build`,
              'bash',
              'install-mono'
            )}

            <h2 className="text-xl font-bold text-text-primary pt-2">3. Download Prebuilt Desktop Binaries (v0.1.0)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
              <a
                href="https://github.com/Benjamin-JHou/JunScience/releases/tag/v0.1.0"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-bg-surface border border-border hover:border-accent flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="font-bold text-[13px] text-text-primary block">macOS (.dmg)</span>
                  <span className="text-[11px] text-text-muted">Apple Silicon &amp; Intel</span>
                </div>
                <Download size={16} className="text-text-muted group-hover:text-accent" />
              </a>

              <a
                href="https://github.com/Benjamin-JHou/JunScience/releases/tag/v0.1.0"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-bg-surface border border-border hover:border-accent flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="font-bold text-[13px] text-text-primary block">Windows (.exe)</span>
                  <span className="text-[11px] text-text-muted">NSIS Installer &amp; Portable</span>
                </div>
                <Download size={16} className="text-text-muted group-hover:text-accent" />
              </a>

              <a
                href="https://github.com/Benjamin-JHou/JunScience/releases/tag/v0.1.0"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-bg-surface border border-border hover:border-accent flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="font-bold text-[13px] text-text-primary block">Linux (.AppImage)</span>
                  <span className="text-[11px] text-text-muted">Ubuntu / Debian / Fedora</span>
                </div>
                <Download size={16} className="text-text-muted group-hover:text-accent" />
              </a>
            </div>
          </div>
        </article>
      )}

      {/* SECTION: QUICKSTART */}
      {section === 'quickstart' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Quick Start Tutorial</h1>
            <p className="text-[15px] text-text-secondary">
              Run your first evidence-anchored scientific research loop in seconds.
            </p>
          </div>

          <div className="space-y-4 text-[14px] text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-text-primary">Step 1: Configure Model API (Optional)</h2>
            <p>
              JunScience includes a built-in <strong>ScientificMockProvider</strong> with verified biological responses for offline testing.
              To connect real LLMs (DeepSeek, OpenAI, Anthropic, or local vLLM/Ollama), configure your environment:
            </p>
            {renderCodeBlock(
              `export OPENAI_API_KEY="sk-..."
export DEEPSEEK_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-..."`,
              'bash',
              'quick-env'
            )}

            <h2 className="text-xl font-bold text-text-primary pt-2">Step 2: Run a Scientific Inquiry</h2>
            {renderCodeBlock(
              `# Inquire about target kinase selectivity
npm run cli research "Evaluate the allosteric selectivity of TYK2 JH2 pseudokinase vs ATP catalytic domain across JAK family kinases"`,
              'bash',
              'quick-run'
            )}

            <h2 className="text-xl font-bold text-text-primary pt-2">Step 3: Inspect Output and Traceability Index</h2>
            <p>
              The agent will initialize an explicit To-Do plan, call UniProtKB, RCSB PDB, ChEMBL, and PubMed, run Python statistics, pass the Critique Gate, and output an immutable <strong>Evidence Traceability Index</strong>.
            </p>
          </div>
        </article>
      )}

      {/* SECTION: API REFERENCE */}
      {section === 'apireference' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">TypeScript API Reference</h1>
            <p className="text-[15px] text-text-secondary">
              Explore the core SDK classes, methods, and types available in <code>@junscience/core</code>.
            </p>
          </div>

          <div className="space-y-6 text-[14px] text-text-secondary leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-text-primary font-mono text-accent">EvidenceVerifier</h2>
              <p className="text-[13px] text-text-muted mt-1">
                Codex-style patch verification middleware for empirical tool outputs.
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

            <div>
              <h2 className="text-xl font-bold text-text-primary font-mono text-accent">PlanTracker</h2>
              <p className="text-[13px] text-text-muted mt-1">
                Explicit milestone manager and EventBus broadcaster for scientific research plans.
              </p>
              {renderCodeBlock(
                `import { PlanTracker, globalEventBus } from '@junscience/core';

const tracker = new PlanTracker(globalEventBus);
const plan = tracker.createPlan(sessionId, "Investigate Deucravacitinib safety profile");
tracker.startTask(sessionId, 'task-1');
tracker.completeTask(sessionId, 'task-1', ['EV-1'], 'Target resolved');`,
                'typescript',
                'api-plan'
              )}
            </div>
          </div>
        </article>
      )}

      {/* SECTION: ARCHITECTURE */}
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
                src="./screenshots/architecture.png"
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

            <h2 className="text-xl font-bold text-text-primary pt-2">2. Clinical Data Privacy Gate (ClinicalDataGate)</h2>
            <p>
              Under strict medical ethics guidelines, raw patient EHR texts and DICOM pixel arrays <strong>never leave the local sandbox</strong> without explicit user authorization. Only de-identified NER features and radiomics statistics are synthesized.
            </p>
          </div>
        </article>
      )}

      {/* SECTION: AGENT SKILLS */}
      {section === 'skills' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Built-In Scientific Skills</h1>
            <p className="text-[15px] text-text-secondary">
              Standard Operating Procedures (SOPs) packaged as executable skill definitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-accent font-bold">Bundled Skill</span>
              <h3 className="font-bold text-[15px] text-text-primary">Pathway Enrichment Skill</h3>
              <p className="text-[12px] text-text-muted">
                Executes hypergeometric pathway enrichment tests across KEGG and Reactome datasets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold">Bundled Skill</span>
              <h3 className="font-bold text-[15px] text-text-primary">Bibliometric Analysis Skill</h3>
              <p className="text-[12px] text-text-muted">
                Performs co-citation clustering, year-by-year publication velocity, and key author analysis.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-500 font-bold">Bundled Skill</span>
              <h3 className="font-bold text-[15px] text-text-primary">SAR Pharmacophore Mapping Skill</h3>
              <p className="text-[12px] text-text-muted">
                Extracts Substructure-Activity Relationships and plots IC50 distribution histograms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500 font-bold">Bundled Skill</span>
              <h3 className="font-bold text-[15px] text-text-primary">Protein Domain Architect Skill</h3>
              <p className="text-[12px] text-text-muted">
                Resolves full-length domain boundaries, pseudokinase vs catalytic topologies from UniProt &amp; InterPro.
              </p>
            </div>
          </div>
        </article>
      )}

      {/* SECTION: CHANGELOG */}
      {section === 'changelog' && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Changelog &amp; Roadmap</h1>
            <p className="text-[15px] text-text-secondary">
              Official releases, verifiable improvements, and roadmap milestones.
            </p>
          </div>

          <div className="space-y-6 text-[14px]">
            <div className="p-5 rounded-2xl bg-bg-surface border border-border space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500 text-white">v0.1.0</span>
                  <span className="font-bold text-[15px] text-text-primary">JunScience Initial Scientific Release</span>
                </div>
                <span className="text-[12px] text-text-muted font-mono">August 2026</span>
              </div>
              <ul className="text-[13px] text-text-secondary space-y-1.5 list-disc list-inside">
                <li><strong>Codex-Style EvidenceVerifier Gate</strong>: Sanity bounds, numerical limits (p ∈ [0,1], IC50 &gt; 0, HU ∈ [-1024,3071]) and NaN/ZeroDivision anomaly prevention.</li>
                <li><strong>DeepSeek Harness Subagent Tree</strong>: Parallel hypothesis forking across competing targets/mechanisms with consolidated comparison matrix.</li>
                <li><strong>Explicit Plan Mode &amp; Interactive To-Do Tracker</strong>: Live milestone event broadcasting across CLI and Desktop interfaces.</li>
                <li><strong>4 Authoritative Biomedical Data Pillars</strong>: PubMed, arXiv, UniProtKB, RCSB PDB, ChEMBL, PubChem, ClinicalTrials.gov v2, openFDA, RxNorm, DailyMed.</li>
                <li><strong>Cross-Platform OS Sandboxes</strong>: macOS Seatbelt, Linux Bubblewrap, Windows Low-Integrity verified on GitHub Actions CI.</li>
              </ul>
            </div>
          </div>
        </article>
      )}

      {/* FALLBACK FOR OTHER SECTIONS (Examples, User Guide, Use Cases, Contributing) */}
      {!['docs', 'installation', 'quickstart', 'apireference', 'architecture', 'skills', 'changelog'].includes(section) && (
        <article className="space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight capitalize">{section}</h1>
            <p className="text-[15px] text-text-secondary">
              Official documentation and guides for {section}.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-surface border border-border space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Verifiable Scientific Workflows</h2>
            <p className="text-[13.5px] text-text-secondary leading-relaxed">
              JunScience integrates verified empirical data across molecular biology, chemistry, and clinical medicine.
              All research workflows can be triggered either through the desktop UI, CLI terminal, or programmatically via the TypeScript SDK.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveSection('quickstart')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors"
              >
                <span>Try Quick Start Workflow</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
