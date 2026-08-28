export type DesktopTheme = 'dark' | 'light';

export type CliTheme = 'green' | 'blue' | 'purple' | 'amber';

export type ViewMode = 'desktop' | 'cli' | 'showcase';

export interface ThemeState {
  desktopTheme: DesktopTheme;
  cliTheme: CliTheme;
  viewMode: ViewMode;
  setDesktopTheme: (theme: DesktopTheme) => void;
  setCliTheme: (theme: CliTheme) => void;
  setViewMode: (mode: ViewMode) => void;
}
