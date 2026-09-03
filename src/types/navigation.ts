export type PortalSection =
  | 'home'
  | 'docs'
  | 'installation'
  | 'quickstart'
  | 'userguide'
  | 'apireference'
  | 'examples'
  | 'cli'
  | 'architecture'
  | 'skills'
  | 'contributing'
  | 'changelog';

export interface PortalNavItem {
  id: PortalSection;
  label: string;
  iconName: string;
  badge?: string;
  category?: 'primary' | 'guide' | 'reference' | 'community';
}
