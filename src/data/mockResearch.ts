import { AgentSession, ToolExecution, Artifact, Citation } from '../types/agent';

export const mockDefaultCitations: Citation[] = [
  {
    id: 'cit-1',
    index: 1,
    title: 'Single-cell transcriptomic dissection of interferon signatures and pathogenic T-cell subsets in systemic autoimmune disease',
    authors: 'Smith, J. A., Zhang, L., Morand, E. F., & Davidson, A.',
    journal: 'Nature Immunology',
    year: 2025,
    doi: '10.1038/s41590-025-01824-x',
    pmid: '39482019',
    abstractSnippet: 'Through profiling of 142,000 PBMCs from SLE patients, we identify STAT4-driven transcriptional rewiring in effector memory CD4+ T cells, correlating strongly with SLEDAI flare scores.',
  },
  {
    id: 'cit-2',
    index: 2,
    title: 'Allosteric TYK2 JH2 pseudokinase domain inhibition spares non-target JAK signaling while preventing lupus nephritis',
    authors: 'Wang, Y., Wrobleski, S. T., & Zhou, J.',
    journal: 'Science Translational Medicine',
    year: 2024,
    doi: '10.1126/scitranslmed.ade4192',
    pmid: '38721104',
    abstractSnippet: 'Deucravacitinib-derived allosteric inhibitors demonstrate >10,000-fold selectivity over JAK1-3, repressing IFN-alpha receptor signal transduction without causing cytopenia.',
  },
  {
    id: 'cit-3',
    index: 3,
    title: 'Deep learning structural ensemble modeling reveals cryptic druggable pockets in autoimmune transcription factors',
    authors: 'Chen, X., AlQuraishi, M., & Baker, D.',
    journal: 'Cell Chemical Biology',
    year: 2024,
    doi: '10.1016/j.chembiol.2024.03.011',
    pmid: '38190223',
    abstractSnippet: 'Molecular dynamics combined with AlphaFold multimer prediction identified an induced-fit pocket at the STAT4 dimerization interface suitable for small-molecule PROTAC degradation.',
  },
];

export const mockDefaultTools: ToolExecution[] = [
  {
    id: 'tool-lit',
    toolName: 'Literature Search',
    category: 'literature',
    description: 'Querying PubMed, bioRxiv, and OpenAlex for SLE therapeutic targets',
    status: 'completed',
    duration: '1.4s',
    resultSummary: '142 peer-reviewed papers retrieved, 8 clinical candidates identified',
    logs: [
      'Query: "systemic lupus erythematosus" AND ("STAT4" OR "TYK2") AND ("clinical trial" OR "mechanism")',
      'Found 142 indexed papers across PubMed (94) and bioRxiv (48)',
      'Extracted target interaction network: STAT4, TYK2, IRF5, IFI44L, CXCL10',
      'Filtered for high-confidence druggability scores (OpenTargets Tractability >= 0.85)',
    ],
  },
  {
    id: 'tool-data',
    toolName: 'Data Analysis',
    category: 'analysis',
    description: 'Processing single-cell RNA-seq dataset GSE181283 (14,200 PBMC cells)',
    status: 'completed',
    duration: '3.8s',
    resultSummary: 'Identified 1,247 significantly altered genes (FDR < 0.01, |log2FC| > 1.5)',
    logs: [
      'Loaded 10x Genomics matrix: 14,200 cells x 24,180 genes',
      'Quality control: mitochondrial read fraction < 8%, nCount_RNA > 1500',
      'Normalized via Seurat v5 SCTransform with cell-cycle regression',
      'Performed Wilcoxon rank-sum differential expression: SLE Flare vs Healthy Control',
      'Upregulated core signatures: Type-I IFN inducible cascade (IFIT1, MX1, OAS1, STAT4, TYK2)',
    ],
  },
  {
    id: 'tool-py',
    toolName: 'Python Code Execution',
    category: 'code',
    description: 'Running volcano_plot.py to synthesize publication-quality figures',
    status: 'completed',
    duration: '0.9s',
    resultSummary: 'Generated differential expression volcano plot and candidate target table',
    logs: [
      'Executing: python scripts/render_volcano.py --input gse181283_deseq2.tsv --highlight STAT4,TYK2,IRF5',
      'Saved artifact: volcano_plot_sle_targets.svg (300 DPI vector)',
      'Exported prioritized target dataset: prioritized_targets_sle.csv (10 entries)',
    ],
  },
];

export const mockDefaultArtifacts: Artifact[] = [
  {
    id: 'art-volcano',
    type: 'figure',
    title: 'Differential Expression Volcano Plot (SLE vs Healthy PBMC)',
    description: 'Statistically significant upregulated and downregulated transcripts across 14,200 single cells. Key pathogenic targets STAT4 (log2FC = 2.84, p-adj = 4.2e-28) and TYK2 are highlighted.',
    generatedFrom: 'scripts/render_volcano.py',
    metadata: {
      'Total Genes': 24180,
      'Significantly Upregulated': 784,
      'Significantly Downregulated': 463,
      'FDR Cutoff': '0.01',
      'log2FC Cutoff': '1.5',
    },
    previewData: {
      chartType: 'volcano',
      upregulated: ['STAT4', 'TYK2', 'IFIT1', 'MX1', 'OAS1', 'CXCL10', 'IRF5'],
      downregulated: ['FOXP3', 'TGFBR2', 'IL10RA', 'BACH2'],
    },
  },
  {
    id: 'art-table',
    type: 'table',
    title: 'Prioritized Therapeutic Target Candidates (Tier 1)',
    description: 'Ranking targets by composite score: Differential Expression (log2FC) x Clinical Association x Druggability Assessment.',
    metadata: {
      'Candidates': 5,
      'Target Class': 'Kinases & Transcription Factors',
      'Primary Indication': 'Lupus Nephritis',
    },
    previewData: [
      { rank: 1, gene: 'TYK2', log2FC: '+3.12', pAdj: '1.2e-34', class: 'Janus Kinase', drugStatus: 'Approved / Phase 3', score: '0.96' },
      { rank: 2, gene: 'STAT4', log2FC: '+2.84', pAdj: '4.2e-28', class: 'Transcription Factor', drugStatus: 'Preclinical PROTAC', score: '0.91' },
      { rank: 3, gene: 'IRF5', log2FC: '+2.45', pAdj: '8.7e-22', class: 'Transcription Factor', drugStatus: 'Early Discovery', score: '0.84' },
      { rank: 4, gene: 'CXCL10', log2FC: '+3.68', pAdj: '2.1e-41', class: 'Chemokine Ligand', drugStatus: 'Phase 2 Biologic', score: '0.82' },
      { rank: 5, gene: 'JAK1', log2FC: '+1.92', pAdj: '3.4e-18', class: 'Janus Kinase', drugStatus: 'Approved (Black Box)', score: '0.78' },
    ],
  },
  {
    id: 'art-protein',
    type: 'protein',
    title: 'TYK2 JH2 Pseudokinase Domain Pocket (AlphaFold AF-P29597-F1)',
    description: 'Structural coordination of the ATP-binding regulatory pocket in the JH2 regulatory domain. Allosteric stabilization locks the kinase in an inactive conformation.',
    metadata: {
      'UniProt ID': 'P29597',
      'Mean pLDDT': '92.4 (Very High)',
      'Allosteric Pocket Vol': '482 Å³',
      'Resolution': '1.8 Å Cryo-EM correlated',
    },
  },
];

export const mockDefaultSession: AgentSession = {
  id: 'sess-sle-target-discovery',
  title: 'Autoimmune Target Discovery & Transcriptomic Validation',
  createdAt: '2026-08-27T10:14:00Z',
  updatedAt: '2026-08-27T10:15:30Z',
  status: 'completed',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Identify high-priority therapeutic targets for Systemic Lupus Erythematosus (SLE). Perform differential gene expression on synovial/PBMC scRNA-seq datasets, cross-reference clinical literature, and highlight druggable pockets.',
      timestamp: '10:14 AM',
    },
    {
      id: 'msg-2',
      role: 'agent',
      status: 'completed',
      timestamp: '10:15 AM',
      content: `I have analyzed the PBMC single-cell transcriptomic profile (GSE181283) across **14,200 cells** and cross-referenced with recent PubMed and bioRxiv literature.

### Key Scientific Findings:

1. **Pathogenic Type-I Interferon Axis:**
   Unsupervised clustering and differential expression confirm strong hyperactivation of the Type-I IFN response in SLE patient subsets. Specifically, **STAT4** (\(\\log_2\\text{FC} = +2.84\), \(p_{\\text{adj}} = 4.2 \\times 10^{-28}\)) and **TYK2** (\(\\log_2\\text{FC} = +3.12\), \(p_{\\text{adj}} = 1.2 \\times 10^{-34}\)) demonstrate consistent co-upregulation in memory CD4+ T cells and classical monocytes.

2. **Druggability & Therapeutic Selectivity:**
   While canonical catalytic JAK inhibitors (JAK1/2/3) carry systemic toxicity warnings, **allosteric inhibition of the TYK2 JH2 regulatory pseudokinase domain** selectively suppresses IFN-\\(\\alpha\\) and IL-12/23 signaling while preserving essential hematopoiesis pathways.

3. **Emerging Degradation Candidates:**
   For the transcription factor **STAT4**, which lacks deep enzymatic catalytic pockets, recent AlphaFold multimer simulations reveal an induced-fit pocket at the SH2 dimerization interface amenable to molecular glue or PROTAC degrader design.`,
      toolExecutions: mockDefaultTools,
      artifacts: mockDefaultArtifacts,
      citations: mockDefaultCitations,
    },
  ],
};
