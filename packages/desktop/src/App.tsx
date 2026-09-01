import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavProvider } from './context/NavContext';
import { UserProvider } from './context/UserContext';
import { ProjectProvider } from './context/ProjectContext';
import { AgentProvider } from './context/AgentContext';
import { AppShell } from './components/shell/AppShell';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <ProjectProvider>
          <NavProvider>
            <AgentProvider>
              <AppShell />
            </AgentProvider>
          </NavProvider>
        </ProjectProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
