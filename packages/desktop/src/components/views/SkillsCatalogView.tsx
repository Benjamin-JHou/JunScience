import React, { useState } from 'react';
import {
  FlaskConical,
  Dna,
  Search,
  Atom,
  BarChart3,
  Stethoscope,
  BookOpen,
  Activity,
  Play,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useNav } from '../../context/NavContext';

interface SkillItem {
  id: string;
  category: string;
  categoryIcon: React.ElementType;
  name: string;
  summary: string;
  sopSteps: string[];
  sampleInquiry: string;
  connectors: string[];
}

const skillsCatalog: SkillItem[] = [
  // 1. Molecular Biology & Structural Genomics
  {
    id: 'alphafold-structure-analysis',
    category: 'Molecular Biology',
    categoryIcon: Dna,
    name: 'AlphaFold Structure & Domain Analysis',
    summary: 'Predicts full-length 3D structure, calculates pLDDT confidence scores, and identifies cryptic druggable pockets.',
    sopSteps: ['Fetch UniProt sequence', 'Query AlphaFold DB / ColabFold', 'Calculate per-residue pLDDT', 'Identify disordered loops'],
    sampleInquiry: 'Fetch AlphaFold 3D structure for TYK2 (P29597) and evaluate pLDDT confidence in JH2 pseudokinase domain.',
    connectors: ['UniProtKB', 'AlphaFoldDB', 'PyMOL'],
  },
  {
    id: 'crispr-off-target-screen',
    category: 'Molecular Biology',
    categoryIcon: Dna,
    name: 'CRISPR Guide RNA Off-Target Predictor',
    summary: 'Screens sgRNA sequences for genome-wide cutting specificity, mismatch penalties, and chromatin accessibility.',
    sopSteps: ['Extract 20nt protospacer', 'Scan PAM (NGG) sites in GRCh38', 'Calculate CFD mismatch matrix', 'Output off-target table'],
    sampleInquiry: 'Screen CRISPR sgRNA guides targeting human STAT4 exon 3 and score potential genomic off-targets.',
    connectors: ['Ensembl', 'NCBI BLAST', 'UCSC Browser'],
  },
  {
    id: 'uniprot-target-profiler',
    category: 'Molecular Biology',
    categoryIcon: Dna,
    name: 'UniProt Target & PTM Annotation',
    summary: 'Retrieves active catalytic residues, post-translational modifications, and pathogenic disease variants.',
    sopSteps: ['Query UniProtKB REST API', 'Parse catalytic triad & active site', 'Map ClinVar missense variants', 'Construct topology'],
    sampleInquiry: 'Profile human JAK1 (P23458) active kinase domain residues, phosphorylation sites, and known drug-resistant mutations.',
    connectors: ['UniProtKB', 'ClinVar', 'InterPro'],
  },
  {
    id: 'protein-msa-conservation',
    category: 'Molecular Biology',
    categoryIcon: Dna,
    name: 'Clustal-Omega MSA & Residue Conservation',
    summary: 'Performs multiple sequence alignment across orthologs and computes Shannon entropy conservation.',
    sopSteps: ['Collect orthologous FASTA sequences', 'Run Clustal-Omega MSA', 'Score residue conservation', 'Highlight invariant motifs'],
    sampleInquiry: 'Perform multiple sequence alignment for human, mouse, and rat IL-23R to locate conserved binding motifs.',
    connectors: ['EMBL-EBI ClustalW', 'NCBI RefSeq'],
  },

  // 2. Cheminformatics & Drug Discovery
  {
    id: 'chembl-target-docking',
    category: 'Cheminformatics',
    categoryIcon: Atom,
    name: 'ChEMBL Bioactivity & IC50 Mining',
    summary: 'Extracts experimental binding affinities, Ki/Kd constants, and selectivity indexes from peer-reviewed assays.',
    sopSteps: ['Query ChEMBL Target API', 'Filter bioactivity measurements', 'Normalize pChEMBL values', 'Generate structure-activity plot'],
    sampleInquiry: 'Extract all small molecules with IC50 < 50nM against TYK2 JH2 domain from ChEMBL database.',
    connectors: ['ChEMBL v33', 'PubChem', 'RDKit'],
  },
  {
    id: 'pubchem-substructure-search',
    category: 'Cheminformatics',
    categoryIcon: Atom,
    name: 'PubChem Substructure & Tanimoto Similarity',
    summary: 'Performs 2D fingerprint hashing, Morgan substructure scans, and Tanimoto coefficient clustering.',
    sopSteps: ['Parse SMILES/InChIKey', 'Generate Morgan 2048-bit fingerprints', 'Compute pairwise Tanimoto scores', 'Cluster scaffolds'],
    sampleInquiry: 'Screen PubChem for compounds sharing >0.85 Tanimoto similarity with deucravacitinib (CID 134821691).',
    connectors: ['PubChem PUG-REST', 'RDKit'],
  },
  {
    id: 'admet-property-profiler',
    category: 'Cheminformatics',
    categoryIcon: Atom,
    name: 'ADMET Pharmacokinetics & QSAR Profiler',
    summary: 'Evaluates Lipinski Rule of 5, hERG cardiac toxicity liability, blood-brain barrier permeability, and CYP metabolism.',
    sopSteps: ['Calculate MW, LogP, TPSA, HBD/HBA', 'Predict CYP450 inhibition profiles', 'Estimate oral bioavailability', 'Flag toxicophores'],
    sampleInquiry: 'Predict ADMET properties, Lipinski compliance, and CYP3A4 metabolic stability for kinase inhibitor lead candidate.',
    connectors: ['SwissADME API', 'RDKit'],
  },

  // 3. Biostatistics & Bioinformatics
  {
    id: 'differential-expression-deseq2',
    category: 'Bioinformatics',
    categoryIcon: BarChart3,
    name: 'RNA-seq Differential Expression (DESeq2)',
    summary: 'Applies negative binomial generalized linear models, Wald tests, and Benjamini-Hochberg FDR correction.',
    sopSteps: ['Load raw count matrix', 'Estimate dispersion parameters', 'Execute DESeq2 GLM Wald test', 'Generate volcano and MA plots'],
    sampleInquiry: 'Perform differential gene expression analysis on hepatic MASLD RNA-seq dataset with FDR < 0.05 cutoff.',
    connectors: ['DESeq2', 'Python StatsModels', 'BioPython'],
  },
  {
    id: 'single-cell-clustering',
    category: 'Bioinformatics',
    categoryIcon: BarChart3,
    name: 'Single-Cell Transcriptomics (Scanpy/Seurat)',
    summary: 'Automates cell QC, highly variable gene selection, PCA dimensionality reduction, and Leiden clustering.',
    sopSteps: ['Filter low-quality droplets', 'SCTransform / LogNormalize', 'Run UMAP & Leiden clustering', 'Annotate cell types via markers'],
    sampleInquiry: 'Run single-cell RNA-seq clustering on 10x Genomics PBMC dataset to identify pathogenic CD4+ T cell clusters.',
    connectors: ['Scanpy', 'AnnData', 'Ensembl'],
  },
  {
    id: 'gsea-pathway-enrichment',
    category: 'Bioinformatics',
    categoryIcon: BarChart3,
    name: 'GSEA Pathway Enrichment & Reactome',
    summary: 'Maps gene lists to KEGG, Reactome, and GO terms with hypergeometric enrichment tests.',
    sopSteps: ['Extract ranked gene list', 'Query Reactome Knowledgebase', 'Calculate Normalized Enrichment Scores', 'Plot GSEA running sum'],
    sampleInquiry: 'Perform GSEA pathway enrichment on upregulated genes to identify activated inflammatory pathways.',
    connectors: ['Reactome', 'QuickGO', 'MSigDB'],
  },

  // 4. Clinical & Pharmacovigilance
  {
    id: 'clinical-trial-eligibility-matching',
    category: 'Clinical & Trials',
    categoryIcon: Stethoscope,
    name: 'ClinicalTrials.gov Protocol & Cohort Matching',
    summary: 'Queries ClinicalTrials.gov API v2, parses inclusion/exclusion criteria, and maps trial phases and endpoints.',
    sopSteps: ['Query NCT identifier or condition', 'Parse structured eligibility text', 'Extract primary/secondary endpoints', 'Synthesize cohort summary'],
    sampleInquiry: 'Retrieve Phase III trial protocols for resmetirom in NASH/MASH (NCT03900429) and summarize inclusion criteria.',
    connectors: ['ClinicalTrials.gov API v2', 'MeSH'],
  },
  {
    id: 'faers-adverse-event-analytics',
    category: 'Clinical & Trials',
    categoryIcon: Stethoscope,
    name: 'openFDA FAERS Pharmacovigilance Analytics',
    summary: 'Mines FDA Adverse Event Reporting System to compute Proportional Reporting Ratios (PRR) and disproportionality.',
    sopSteps: ['Query openFDA drug/event API', 'Count co-occurrence contingency tables', 'Calculate PRR and Chi-square statistics', 'Plot safety signal chart'],
    sampleInquiry: 'Calculate disproportionality signal scores (PRR) for hepatic adverse events associated with GLP-1 receptor agonists in FAERS.',
    connectors: ['openFDA FAERS', 'RxNorm', 'DailyMed'],
  },
  {
    id: 'evidence-verification-gate',
    category: 'Clinical & Trials',
    categoryIcon: Stethoscope,
    name: 'Pre-Adoption Evidence Verifier Gate',
    summary: 'Codex-style formal patch verification checking physical/mathematical bounds (p in [0,1], IC50 > 0, HU bounds).',
    sopSteps: ['Intercept tool output payload', 'Check numerical intervals & boundary safety', 'Verify source database integrity', 'Mint verified EV-xxx record'],
    sampleInquiry: 'Verify experimental p-values and binding affinity bounds from newly ingested clinical dataset.',
    connectors: ['EvidenceVerifier', 'HookRegistry'],
  },

  // 5. Literature Mining & Synthesis
  {
    id: 'pubmed-literature-mining',
    category: 'Literature Mining',
    categoryIcon: BookOpen,
    name: 'PubMed & OpenAlex Systematic Mining',
    summary: 'Executes Boolean mesh queries across NCBI PubMed, bioRxiv, medRxiv, and OpenAlex scholarly graph.',
    sopSteps: ['Construct MeSH Boolean query', 'Fetch article abstracts & metadata', 'Extract key quantitative findings', 'Index citation anchors'],
    sampleInquiry: 'Search PubMed for 2024-2025 peer-reviewed trials evaluating TYK2 JH2 allosteric inhibitors in systemic lupus.',
    connectors: ['PubMed E-utilities', 'Europe PMC', 'OpenAlex'],
  },
  {
    id: 'prisma-meta-analysis-synthesizer',
    category: 'Literature Mining',
    categoryIcon: BookOpen,
    name: 'PRISMA-2020 Systematic Review Synthesizer',
    summary: 'Extracts study characteristics, calculates pooled Odds Ratios / Hazard Ratios with Mantel-Haenszel random effects.',
    sopSteps: ['Screen records against inclusion criteria', 'Extract effect sizes (OR/RR/HR)', 'Compute I^2 heterogeneity statistic', 'Generate PRISMA flowchart'],
    sampleInquiry: 'Synthesize systematic literature review on SGLT2 inhibitor renal outcomes following PRISMA-2020 guidelines.',
    connectors: ['PubMed', 'Cochrane Library', 'Meta-Analysis Engine'],
  },
  {
    id: 'manuscript-formatting',
    category: 'Literature Mining',
    categoryIcon: BookOpen,
    name: 'Nature / Cell Scientific Manuscript Formatter',
    summary: 'Compiles verified research evidence into structured academic manuscripts with IEEE/Nature citation formatting.',
    sopSteps: ['Aggregate verified EV-xxx evidence', 'Structure Abstract, Intro, Methods, Results, Discussion', 'Format LaTeX equations & figure callouts', 'Generate bibliography'],
    sampleInquiry: 'Format current research findings into a structured Nature Biotechnology style brief communication draft.',
    connectors: ['FileEditorTool', 'LaTeX Engine', 'EvidenceTracker'],
  },

  // 6. Medical Imaging & Reproducibility
  {
    id: 'dicom-volumetric-radiomics',
    category: 'Imaging & Multimodal',
    categoryIcon: Activity,
    name: 'DICOM CT/MRI Volumetric Radiomics',
    summary: 'Extracts 3D voxel HU arrays inside sandbox, measures lesion volume, and computes spatial texture descriptors.',
    sopSteps: ['Read DICOM image slice headers', 'Calibrate Hounsfield Units (-1024 to +3071)', '3D volumetric segmentation', 'Compute radiomic feature matrix'],
    sampleInquiry: 'Process liver CT scan DICOM series to measure hepatic volume and compute steatosis attenuation density.',
    connectors: ['pydicom', 'SimpleITK', 'Kernel Sandbox'],
  },
  {
    id: 'synthetic-dataset-generator',
    category: 'Imaging & Multimodal',
    categoryIcon: Activity,
    name: 'Statistical Mock & Benchmark Data Generator',
    summary: 'Generates grounded, biologically coherent synthetic benchmarks with realistic covariance matrices.',
    sopSteps: ['Define biological parameter distributions', 'Sample multivariate Gaussian copula', 'Inject known ground truth signals', 'Export CSV with data dictionary'],
    sampleInquiry: 'Generate a synthetic 1,000-patient pharmacokinetic cohort dataset with realistic clearance and volume of distribution.',
    connectors: ['NumPy', 'Pandas', 'SciPy'],
  },
  {
    id: 'sandbox-protocol-validator',
    category: 'Imaging & Multimodal',
    categoryIcon: Activity,
    name: 'Kernel Sandbox Protocol & Privacy Gate',
    summary: 'Enforces macOS Seatbelt / Linux bwrap isolation, guaranteeing zero unapproved transmission of clinical EHR/DICOM.',
    sopSteps: ['Spawn isolated execution sandbox', 'Enforce memory and CPU constraints', 'Block unapproved outbound egress', 'Audit output artifacts'],
    sampleInquiry: 'Run high-throughput statistical simulation inside isolated kernel sandbox with hardware execution monitoring.',
    connectors: ['macOS Seatbelt', 'Linux bubblewrap', 'ClinicalDataGate'],
  },
];

export const SkillsCatalogView: React.FC = () => {
  const { submitPrompt } = useAgent();
  const { setActiveSection } = useNav();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Molecular Biology', 'Cheminformatics', 'Bioinformatics', 'Clinical & Trials', 'Literature Mining', 'Imaging & Multimodal'];

  const filteredSkills = skillsCatalog.filter((skill) => {
    const matchesCat = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.connectors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleLaunchSkill = async (inquiry: string) => {
    setActiveSection('home');
    await submitPrompt(inquiry);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 sm:p-10 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Scientific Skills (19 SOPs)</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Domain-specific computational protocols, molecular databases, and clinical verification pipelines.
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-bg-surface border border-border text-accent">
          19 Skills Loaded & Verified
        </span>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-xs font-semibold'
                    : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search skills, databases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border focus:border-accent text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const CatIcon = skill.categoryIcon;
          return (
            <div
              key={skill.id}
              className="flex flex-col justify-between p-4 rounded-xl bg-bg-surface border border-border hover:border-accent/40 transition-all shadow-xs group"
            >
              <div className="space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    <CatIcon size={12} />
                    <span>{skill.category}</span>
                  </span>
                </div>

                <h3 className="text-[14.5px] font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {skill.name}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {skill.summary}
                </p>

                {/* SOP Steps preview */}
                <div className="pt-2 space-y-1 border-t border-border-subtle">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
                    Execution SOP:
                  </span>
                  <div className="space-y-0.5">
                    {skill.sopSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                        <span className="truncate">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connectors */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.connectors.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-border-subtle">
                <button
                  onClick={() => handleLaunchSkill(skill.sampleInquiry)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated hover:bg-accent hover:text-white border border-border hover:border-transparent text-text-primary text-xs font-semibold transition-all group/btn"
                >
                  <Play size={13} className="text-accent group-hover/btn:text-white" />
                  <span>Execute with Agent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
