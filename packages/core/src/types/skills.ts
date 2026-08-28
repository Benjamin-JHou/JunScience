export type SkillCategory =
  | 'literature'
  | 'genomics'
  | 'proteomics'
  | 'chemistry'
  | 'statistics'
  | 'pathways'
  | 'visualization';

export interface SkillDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: SkillCategory;
  version: string;
  author: string;
  bundled: boolean;
  requiredTools: string[];
  keywords: string[];
  instructions: string;
  workflowSteps: string[];
  examples: string[];
  helperScripts?: Record<string, string>; // Python helper templates
}
