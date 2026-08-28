import React, { createContext, useContext, useEffect, useState } from 'react';
import { DesktopTheme, CliTheme, ViewMode, ThemeState } from '../types/theme';

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramDesktop = urlParams.get('theme') as DesktopTheme | null;
  const paramCli = urlParams.get('cliTheme') as CliTheme | null;
  const paramView = urlParams.get('view') as ViewMode | null;

  const [desktopTheme, setDesktopThemeState] = useState<DesktopTheme>(() => {
    if (paramDesktop && ['dark', 'light'].includes(paramDesktop)) return paramDesktop;
    const saved = localStorage.getItem('junscience_desktop_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [cliTheme, setCliThemeState] = useState<CliTheme>(() => {
    if (paramCli && ['green', 'blue', 'purple', 'amber'].includes(paramCli)) return paramCli;
    const saved = localStorage.getItem('junscience_cli_theme') as CliTheme;
    return ['green', 'blue', 'purple', 'amber'].includes(saved) ? saved : 'green';
  });

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (paramView && ['desktop', 'cli', 'showcase'].includes(paramView)) return paramView;
    const saved = localStorage.getItem('junscience_view_mode') as ViewMode;
    return ['desktop', 'cli', 'showcase'].includes(saved) ? saved : 'desktop';
  });

  const setDesktopTheme = (theme: DesktopTheme) => {
    setDesktopThemeState(theme);
    localStorage.setItem('junscience_desktop_theme', theme);
  };

  const setCliTheme = (theme: CliTheme) => {
    setCliThemeState(theme);
    localStorage.setItem('junscience_cli_theme', theme);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('junscience_view_mode', mode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', desktopTheme);
    document.documentElement.setAttribute('data-cli-theme', cliTheme);
    if (desktopTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [desktopTheme, cliTheme]);

  return (
    <ThemeContext.Provider
      value={{
        desktopTheme,
        cliTheme,
        viewMode,
        setDesktopTheme,
        setCliTheme,
        setViewMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeState => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
