import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ContextPanel } from './ContextPanel';
import { DesktopHomeView } from '../views/DesktopHomeView';
import { DesktopWorkspaceView } from '../views/DesktopWorkspaceView';
import { FunctionalPlaceholders } from '../views/FunctionalPlaceholders';
import { CliView } from '../cli/CliView';
import { ThemeGalleryView } from '../views/ThemeGalleryView';
import { CommandPalette } from '../common/CommandPalette';
import { SettingsModal } from '../common/SettingsModal';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { useAgent } from '../../context/AgentContext';

export const AppShell: React.FC = () => {
  const { viewMode } = useTheme();
  const { activeSection } = useNav();
  const { activeView } = useAgent();

  if (viewMode === 'cli') {
    return (
      <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#020503]">
        <CliView />
        <CommandPalette />
        <SettingsModal />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-bg-primary text-text-primary">
      {/* Universal Top Bar */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-bg-primary">
          {viewMode === 'showcase' ? (
            <ThemeGalleryView />
          ) : activeSection === 'home' ? (
            activeView === 'home' ? (
              <DesktopHomeView />
            ) : (
              <DesktopWorkspaceView />
            )
          ) : (
            <FunctionalPlaceholders section={activeSection} />
          )}
        </main>

        {/* Right Context Panel (Only in Desktop Home / Workspace mode) */}
        {viewMode !== 'showcase' && activeSection === 'home' && <ContextPanel />}
      </div>

      {/* Global Modals & Overlays */}
      <CommandPalette />
      <SettingsModal />
    </div>
  );
};
