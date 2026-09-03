export type DesktopTheme = 'dark' | 'light';

export interface ThemeState {
  desktopTheme: DesktopTheme;
  setDesktopTheme: (theme: DesktopTheme) => void;
}
