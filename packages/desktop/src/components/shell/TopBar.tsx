import React from 'react';
import { Search, Bell, Settings, Sun, Moon, Terminal, Layout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const { desktopTheme, setDesktopTheme, viewMode, setViewMode } = useTheme();
  const { setIsCommandPaletteOpen, setIsSettingsOpen } = useNav();

  const toggleTheme = () => {
    setDesktopTheme(desktopTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`flex items-center justify-between px-6 h-[52px] bg-bg-surface border-b border-border select-none z-10 ${className}`}
    >
      {/* Left spacer matching sidebar boundary */}
      <div className="w-[180px]" />

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-[440px] mx-4">
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center justify-between w-full h-[34px] px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-accent/40 text-text-muted hover:text-text-secondary cursor-pointer transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-text-muted" />
            <span className="text-[13px]">Search anything...</span>
          </div>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-surface text-text-muted border border-border-subtle">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Switch View Mode: Desktop vs CLI */}
        <button
          onClick={() => setViewMode(viewMode === 'cli' ? 'desktop' : 'cli')}
          className={`p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors ${
            viewMode === 'cli' ? 'text-accent bg-accent-soft' : ''
          }`}
          title={viewMode === 'cli' ? 'Switch to Desktop Mode' : 'Switch to Terminal CLI'}
        >
          {viewMode === 'cli' ? <Layout size={17} /> : <Terminal size={17} />}
        </button>

        {/* Desktop Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={desktopTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {desktopTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-bg-surface" />
        </button>

        {/* Settings Modal */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Settings (Themes & Preferences)"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};
