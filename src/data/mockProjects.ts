import { ScientificProject } from '../types/scientific';

export const mockProjects: ScientificProject[] = [
  {
    id: 'proj-1',
    title: 'Autoimmune Target Discovery',
    timeAgo: 'Today',
    category: 'Genomics & Immunology',
    summary: 'Target identification and validation in systemic lupus erythematosus using single-cell transcriptomics.',
  },
  {
    id: 'proj-2',
    title: 'Molecular Docking Analysis',
    timeAgo: 'Yesterday',
    category: 'Cheminformatics',
    summary: 'Virtual screening of JAK1/TYK2 dual kinase inhibitors against autoimmune kinase targets.',
  },
  {
    id: 'proj-3',
    title: 'Single-cell RNA-seq Analysis',
    timeAgo: '2 days ago',
    category: 'Bioinformatics',
    summary: 'Clustering and differential gene expression analysis across 45,000 PBMC cells (GSE181283).',
  },
  {
    id: 'proj-4',
    title: 'Protein Structure Prediction',
    timeAgo: '3 days ago',
    category: 'Structural Biology',
    summary: 'AlphaFold multimer modeling of human IL-23 receptor complex with therapeutic nanobodies.',
  },
  {
    id: 'proj-5',
    title: 'CRISPR Screen Hit Prioritization',
    timeAgo: '5 days ago',
    category: 'Functional Genomics',
    summary: 'Genome-wide CRISPR-Cas9 knockout screening in synovial fibroblasts under TNF-alpha stimulation.',
  },
  {
    id: 'proj-6',
    title: 'Kinase Inhibitor Selectivity Profiling',
    timeAgo: '1 week ago',
    category: 'Drug Discovery',
    summary: 'Kinome-wide selectivity analysis and binding affinity prediction for novel pyrimidine derivatives.',
  },
];
