import React, { createContext, useContext, useEffect, useState } from 'react';
import { DesktopTheme, ThemeState } from '../types/theme';

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const paramDesktop = urlParams.get('theme') as DesktopTheme | null;

  const [desktopTheme, setDesktopThemeState] = useState<DesktopTheme>(() => {
    if (paramDesktop && ['dark', 'light'].includes(paramDesktop)) return paramDesktop;
    const saved = localStorage.getItem('junscience_desktop_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const setDesktopTheme = (theme: DesktopTheme) => {
    setDesktopThemeState(theme);
    localStorage.setItem('junscience_desktop_theme', theme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', desktopTheme);
    if (desktopTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [desktopTheme]);

  return (
    <ThemeContext.Provider
      value={{
        desktopTheme,
        setDesktopTheme,
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
