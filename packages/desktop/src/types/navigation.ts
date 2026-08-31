export type NavSection =
  | 'home'
  | 'sessions'
  | 'skills'
  | 'evidence'
  | 'files';

export interface NavItem {
  id: NavSection;
  label: string;
  iconName: string;
  badge?: string;
  description?: string;
}
