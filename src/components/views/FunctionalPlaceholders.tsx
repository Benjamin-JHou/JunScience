import React from 'react';
import {
  BookOpen,
  BarChart2,
  FlaskConical,
  Code2,
  Atom,
  BookMarked,
  Database,
  Play,
  CheckCircle,
} from 'lucide-react';
import { NavSection } from '../../types/navigation';
import { useAgent } from '../../context/AgentContext';
import { mockProjects } from '../../data/mockProjects';

interface FunctionalViewProps {
  section: NavSection;
}

export const FunctionalPlaceholders: React.FC<FunctionalViewProps> = ({ section }) => {
  const { submitPrompt, openProject } = useAgent();

  if (section === 'my-projects') {
    return (
      <div className="flex-1 overflow-y-auto p-8 max-w-[1000px] mx-auto w-full">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Research Projects</h2>
            <p className="text-sm text-text-secondary mt-1">
              Active scientific workspaces, pipeline runs, and target analyses.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-bg-surface border border-border text-accent">
            {mockProjects.length} Projects Total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {mockProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProject(project.id, project.title)}
              className="p-4 rounded-xl bg-bg-surface border border-border hover:border-accent/50 cursor-pointer transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-accent">
                  {project.category}
                </span>
                <span className="text-xs text-text-muted">{project.timeAgo}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-text-primary mt-2 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                {project.summary}
              </p>
              <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1 text-status-success">
                  <CheckCircle size={13} />
                  <span>Pipeline Converged</span>
                </span>
                <span className="text-accent group-hover:translate-x-0.5 transition-transform">
                  Open Project →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Configurations for each functional section
  const sectionConfigs: Record<
    string,
    { title: string; subtitle: string; icon: React.ElementType; examples: string[]; prompt: string }
  > = {
    literature: {
      title: 'Literature Search & Synthesis',
      subtitle: 'Real-time mining across PubMed, bioRxiv, medRxiv, Europe PMC, and OpenAlex.',
      icon: BookOpen,
      examples: [
        'Query 2026 Nature papers on IL-23 receptor crystal structures',
        'Summarize clinical efficacy of deucravacitinib in Phase III trials',
        'Extract kinetic inhibition constants (Ki, IC50) for JAK family kinase inhibitors',
      ],
      prompt: 'Execute literature search on target discovery in autoimmune diseases',
    },
    'data-analysis': {
      title: 'Scientific Data Analysis',
      subtitle: 'Automated bioinformatics workflows: single-cell RNA-seq, DESeq2, clustering, and pathway enrichment.',
      icon: BarChart2,
      examples: [
        'Run QC and SCTransform normalization on 10x Genomics dataset',
        'Perform GSEA pathway enrichment analysis on differential gene list',
        'Calculate Pearson correlation between drug sensitivity and gene expression',
      ],
      prompt: 'Perform differential gene expression analysis on PBMC dataset GSE181283',
    },
    'experiment-design': {
      title: 'Experiment Design & Protocol Formulation',
      subtitle: 'In silico assay design, CRISPR guide RNA scoring, and laboratory protocol synthesis.',
      icon: FlaskConical,
      examples: [
        'Design CRISPR knockout gRNA library targeting STAT4 SH2 domain',
        'Formulate multi-well dose-response assay protocol for kinase IC50 validation',
        'Calculate sample size and statistical power for RNA-seq perturbation experiment',
      ],
      prompt: 'Design CRISPR-Cas9 knockout validation protocol for STAT4',
    },
    'code-assistant': {
      title: 'Scientific Code Assistant',
      subtitle: 'Interactive computational biology and cheminformatics coding in Python, R, and Julia.',
      icon: Code2,
      examples: [
        'Generate Scanpy script for UMAP dimensionality reduction and Leiden clustering',
        'Write RDKit script for computing QED and Lipinski rule-of-five descriptors',
        'Build PyTorch model for graph neural network molecular property prediction',
      ],
      prompt: 'Write Python script using RDKit and Scanpy for target validation',
    },
    'molecule-explorer': {
      title: 'Molecule & Protein Explorer',
      subtitle: '3D structural modeling, AlphaFold confidence assessment, and pocket druggability scoring.',
      icon: Atom,
      examples: [
        'Fetch AlphaFold structure for TYK2 (P29597) and highlight JH2 pocket',
        'Run virtual docking screen using AutoDock Vina against 500 kinase candidates',
        'Compute electrostatic surface potential and binding free energy',
      ],
      prompt: 'Explore molecular pocket and docking score for TYK2 JH2 pseudokinase domain',
    },
    notebook: {
      title: 'Scientific Notebook',
      subtitle: 'Reproducible computational research notebooks linking code, datasets, figures, and provenance.',
      icon: BookMarked,
      examples: [
        'Lupus_Transcriptomic_Pipeline.ipynb (Last run: Today)',
        'Molecular_Dynamics_Trajectory_Analysis.ipynb (Last run: Yesterday)',
        'Kinome_Selectivity_Profiling.ipynb (Last run: 3 days ago)',
      ],
      prompt: 'Create new reproducible scientific notebook for target analysis',
    },
    'knowledge-base': {
      title: 'Scientific Knowledge Base',
      subtitle: 'Unified index of internal laboratory notes, curated chemical libraries, and reference databases.',
      icon: Database,
      examples: [
        'Indexed UniProtKB Human Proteome (20,434 proteins)',
        'ChEMBL Bioactivity Database (2.4M compounds)',
        'Gene Ontology & Reactome Pathway Hierarchy (2026 release)',
      ],
      prompt: 'Search knowledge base for autoimmune therapeutic targets',
    },
  };

  const config = sectionConfigs[section] || sectionConfigs.literature;
  const Icon = config.icon;

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-[880px] mx-auto w-full">
      <div className="p-6 rounded-2xl bg-bg-surface border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent-soft text-accent">
            <Icon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{config.title}</h2>
            <p className="text-xs text-text-muted mt-0.5">JunScience Capability Module</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-4 leading-relaxed">
          {config.subtitle}
        </p>

        <div className="mt-6 pt-5 border-t border-border-subtle">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Suggested Scientific Actions
          </h4>
          <div className="space-y-2">
            {config.examples.map((ex, idx) => (
              <div
                key={idx}
                onClick={() => submitPrompt(ex)}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated hover:bg-bg-hover cursor-pointer border border-border-subtle hover:border-accent/40 text-xs text-text-secondary hover:text-text-primary transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Play size={12} className="text-accent group-hover:scale-110 transition-transform" />
                  <span>{ex}</span>
                </div>
                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Run in Agent →
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 flex items-center justify-between">
          <button
            onClick={() => submitPrompt(config.prompt)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:brightness-110 text-white text-xs font-medium transition-all shadow-sm"
          >
            <Play size={13} />
            <span>Launch Agent Workflow</span>
          </button>
          <span className="text-xs text-text-muted">
            Bound to JunScience Agent Execution Engine
          </span>
        </div>
      </div>
    </div>
  );
};
