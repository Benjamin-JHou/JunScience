import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavProvider } from './context/NavContext';
import { AgentProvider } from './context/AgentContext';
import { AppShell } from './components/shell/AppShell';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NavProvider>
        <AgentProvider>
          <AppShell />
        </AgentProvider>
      </NavProvider>
    </ThemeProvider>
  );
};

export default App;
