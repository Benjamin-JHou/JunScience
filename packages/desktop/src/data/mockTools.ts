import { ContextTool, QuickActionItem } from '../types/scientific';

export const mockContextTools: ContextTool[] = [
  {
    id: 'literature-search',
    name: 'Literature Search',
    description: 'Search and summarize scientific papers',
    iconName: 'BookOpen',
    category: 'literature',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze and visualize data easily',
    iconName: 'BarChart3',
    category: 'analysis',
  },
  {
    id: 'experiment-design',
    name: 'Experiment Design',
    description: 'Design experiments with AI suggestions',
    iconName: 'FlaskConical',
    category: 'experiment',
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Write and debug scientific code',
    iconName: 'Code2',
    category: 'code',
  },
  {
    id: 'molecule-explorer',
    name: 'Molecule Explorer',
    description: 'Explore molecules and properties',
    iconName: 'Atom',
    category: 'molecule',
  },
];

export const mockQuickActions: QuickActionItem[] = [
  {
    id: 'qa-lit',
    label: 'Literature Review',
    iconName: 'BookOpen',
    prompt: 'Conduct a systematic literature review on recent therapeutic targets for autoimmune diseases.',
  },
  {
    id: 'qa-data',
    label: 'Data Analysis',
    iconName: 'BarChart2',
    prompt: 'Analyze differential gene expression and pathway enrichment for GSE181283 scRNA-seq dataset.',
  },
  {
    id: 'qa-exp',
    label: 'Experiment Design',
    iconName: 'FlaskConical',
    prompt: 'Design a CRISPR-Cas9 knockout validation experiment for STAT4 in primary human T-cells.',
  },
  {
    id: 'qa-code',
    label: 'Code Assistant',
    iconName: 'Code',
    prompt: 'Write Python script using Scanpy and PyTorch Geometric to train a GNN for molecular property prediction.',
  },
  {
    id: 'qa-more',
    label: 'More',
    iconName: 'Sparkles',
    prompt: 'Show all available scientific agent tools and workflows.',
  },
];
