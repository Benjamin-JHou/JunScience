import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  BarChart2,
  Moon,
  Sun,
  Terminal,
  Settings,
  FolderKanban,
  X,
} from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { useTheme } from '../../context/ThemeContext';
import { useAgent } from '../../context/AgentContext';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, setActiveSection, setIsSettingsOpen } = useNav();
  const { setDesktopTheme, setCliTheme, setViewMode } = useTheme();
  const { resetSession, openProject } = useAgent();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'cmd-new-chat',
      label: 'New Research Chat',
      category: 'Actions',
      icon: Plus,
      shortcut: '⌘N',
      action: () => {
        resetSession();
        setActiveSection('home');
      },
    },
    {
      id: 'cmd-lit',
      label: 'Search Scientific Literature',
      category: 'Workflows',
      icon: BookOpen,
      action: () => setActiveSection('literature'),
    },
    {
      id: 'cmd-data',
      label: 'Run Data Analysis Pipeline',
      category: 'Workflows',
      icon: BarChart2,
      action: () => setActiveSection('data-analysis'),
    },
    {
      id: 'cmd-proj-1',
      label: 'Open Project: Autoimmune Target Discovery',
      category: 'Projects',
      icon: FolderKanban,
      action: () => openProject('proj-1', 'Autoimmune Target Discovery'),
    },
    {
      id: 'cmd-dark',
      label: 'Switch to Desktop Dark Theme',
      category: 'Appearance',
      icon: Moon,
      action: () => {
        setDesktopTheme('dark');
        setViewMode('desktop');
      },
    },
    {
      id: 'cmd-light',
      label: 'Switch to Desktop Light Theme',
      category: 'Appearance',
      icon: Sun,
      action: () => {
        setDesktopTheme('light');
        setViewMode('desktop');
      },
    },
    {
      id: 'cmd-cli-green',
      label: 'Open Terminal CLI: Green (Matrix)',
      category: 'CLI Themes',
      icon: Terminal,
      action: () => {
        setCliTheme('green');
        setViewMode('cli');
      },
    },
    {
      id: 'cmd-cli-blue',
      label: 'Open Terminal CLI: Blue (Cyber)',
      category: 'CLI Themes',
      icon: Terminal,
      action: () => {
        setCliTheme('blue');
        setViewMode('cli');
      },
    },
    {
      id: 'cmd-cli-purple',
      label: 'Open Terminal CLI: Purple (Neon)',
      category: 'CLI Themes',
      icon: Terminal,
      action: () => {
        setCliTheme('purple');
        setViewMode('cli');
      },
    },
    {
      id: 'cmd-cli-amber',
      label: 'Open Terminal CLI: Amber (Retro)',
      category: 'CLI Themes',
      icon: Terminal,
      action: () => {
        setCliTheme('amber');
        setViewMode('cli');
      },
    },
    {
      id: 'cmd-settings',
      label: 'Open Application Settings',
      category: 'System',
      icon: Settings,
      shortcut: '⌘,',
      action: () => setIsSettingsOpen(true),
    },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setIsCommandPaletteOpen(false);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 select-none">
      <div
        className="w-full max-w-[560px] rounded-2xl bg-bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search size={18} className="text-accent" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search research..."
            className="w-full bg-transparent border-none outline-none text-[14.5px] text-text-primary placeholder:text-text-muted"
            autoFocus
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No commands found for "{query}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isSelected ? 'text-accent' : 'text-text-muted'} />
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-muted opacity-75">
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 bg-bg-elevated border-t border-border-subtle text-[11px] text-text-muted font-mono">
          <span>Navigate: ↑↓</span>
          <span>Select: Enter ↵</span>
          <span>Close: Esc</span>
        </div>
      </div>
    </div>
  );
};
