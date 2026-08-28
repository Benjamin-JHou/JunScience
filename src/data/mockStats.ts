import { ResearchStat, ContextTip } from '../types/scientific';

export const mockResearchStats: ResearchStat[] = [
  {
    id: 'stat-projects',
    label: 'Projects',
    value: '12',
    iconName: 'FolderKanban',
  },
  {
    id: 'stat-analyses',
    label: 'Analyses',
    value: '48',
    iconName: 'LineChart',
  },
  {
    id: 'stat-papers',
    label: 'Papers Read',
    value: '256',
    iconName: 'FileText',
  },
  {
    id: 'stat-hours',
    label: 'Hours Saved',
    value: '120+',
    iconName: 'Clock',
  },
];

export const mockContextTips: ContextTip[] = [
  {
    id: 'tip-1',
    prompt: 'Explain this paper',
  },
  {
    id: 'tip-2',
    prompt: 'Analyze this data',
  },
  {
    id: 'tip-3',
    prompt: 'Design an experiment',
  },
  {
    id: 'tip-4',
    prompt: 'Write analysis code',
  },
];
