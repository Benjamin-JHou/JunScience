import React from 'react';
import { Search, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { useAgent } from '../../context/AgentContext';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const { desktopTheme, setDesktopTheme } = useTheme();
  const { setIsCommandPaletteOpen, setIsSettingsOpen } = useNav();
  const { currentSession, activeView } = useAgent();

  const toggleTheme = () => {
    setDesktopTheme(desktopTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`flex items-center justify-between px-6 h-[52px] bg-bg-surface border-b border-border select-none z-10 ${className}`}
    >
      {/* Left: Active Workspace / Session Breadcrumb */}
      <div className="flex items-center gap-2 max-w-[280px] overflow-hidden text-left">
        <span className="text-[11px] font-mono uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          Workstation
        </span>
        <span className="text-[13px] font-medium text-text-secondary truncate">
          {activeView === 'workspace' && currentSession?.title
            ? currentSession.title
            : 'JunScience Autonomous Lab'}
        </span>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-[420px] mx-4">
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center justify-between w-full h-[34px] px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-accent/40 text-text-muted hover:text-text-secondary cursor-pointer transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-text-muted" />
            <span className="text-[13px]">Search skills, evidence, papers...</span>
          </div>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-text-muted border border-border-subtle">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Desktop Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={desktopTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {desktopTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Settings Modal */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Workstation Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};
