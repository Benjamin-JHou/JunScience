import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavProvider } from './context/NavContext';
import { PortalShell } from './components/portal/PortalShell';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NavProvider>
        <PortalShell />
      </NavProvider>
    </ThemeProvider>
  );
};

export default App;
