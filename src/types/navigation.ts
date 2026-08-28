export type NavSection =
  | 'home'
  | 'literature'
  | 'data-analysis'
  | 'experiment-design'
  | 'code-assistant'
  | 'molecule-explorer'
  | 'notebook'
  | 'knowledge-base'
  | 'my-projects';

export interface NavItem {
  id: NavSection;
  label: string;
  iconName: string;
  badge?: string;
  description?: string;
}
