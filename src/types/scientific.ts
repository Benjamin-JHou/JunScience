export interface ScientificProject {
  id: string;
  title: string;
  timeAgo: string;
  category: string;
  summary: string;
}

export interface ResearchStat {
  id: string;
  label: string;
  value: string;
  iconName: string;
}

export interface ContextTool {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: string;
}

export interface ContextTip {
  id: string;
  prompt: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  iconName: string;
  prompt: string;
}
