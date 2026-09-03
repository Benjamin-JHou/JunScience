import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavProvider } from './context/NavContext';
import { LanguageProvider } from './context/LanguageContext';
import { PortalShell } from './components/portal/PortalShell';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavProvider>
          <PortalShell />
        </NavProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
