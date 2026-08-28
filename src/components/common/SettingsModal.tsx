import React from 'react';
import { X, Moon, Sun, Terminal, Monitor, Keyboard, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { CliTheme, ViewMode } from '../../types/theme';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen } = useNav();
  const {
    desktopTheme,
    setDesktopTheme,
    cliTheme,
    setCliTheme,
    viewMode,
    setViewMode,
  } = useTheme();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-[540px] rounded-2xl bg-bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-[17px] font-bold text-text-primary">Settings</h3>
            <p className="text-xs text-text-muted mt-0.5">Customize environment & appearance</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 max-h-[520px] overflow-y-auto">
          {/* Active Operating View */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              Operating Environment Mode
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'desktop', label: 'Desktop UI', icon: Monitor },
                { id: 'cli', label: 'Terminal CLI', icon: Terminal },
                { id: 'showcase', label: 'Theme Showcase', icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = viewMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setViewMode(item.id as ViewMode)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/15 text-accent shadow-sm'
                        : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Theme Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              Desktop Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDesktopTheme('dark')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  desktopTheme === 'dark'
                    ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                    : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon size={16} className="text-accent" />
                  <div className="text-left">
                    <span className="block font-semibold">Desktop Dark</span>
                    <span className="text-[11px] text-text-muted">Futuristic Science</span>
                  </div>
                </div>
                {desktopTheme === 'dark' && <Check size={15} className="text-accent" />}
              </button>

              <button
                onClick={() => setDesktopTheme('light')}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  desktopTheme === 'light'
                    ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                    : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun size={16} className="text-amber-500" />
                  <div className="text-left">
                    <span className="block font-semibold">Desktop Light</span>
                    <span className="text-[11px] text-text-muted">Clean Minimalist</span>
                  </div>
                </div>
                {desktopTheme === 'light' && <Check size={15} className="text-accent" />}
              </button>
            </div>
          </div>

          {/* CLI Themes Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
              CLI Terminal Theme
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'green', label: '1 绿色 · 矩阵风 (Green)', color: '#22C55E' },
                { id: 'blue', label: '2 蓝色 · 赛博风 (Blue)', color: '#38BDF8' },
                { id: 'purple', label: '3 紫色 · 霓虹风 (Purple)', color: '#D946EF' },
                { id: 'amber', label: '4 橙色 · 复古终端 (Amber)', color: '#F59E0B' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCliTheme(c.id as CliTheme)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    cliTheme === c.id
                      ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                      : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.label}</span>
                  </div>
                  {cliTheme === c.id && <Check size={14} className="text-accent" />}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              <Keyboard size={13} />
              <span>Keyboard Shortcuts</span>
            </label>
            <div className="p-3 rounded-xl bg-bg-elevated border border-border-subtle text-xs space-y-1.5">
              <div className="flex justify-between text-text-secondary">
                <span>Command Palette</span>
                <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-bg-surface border border-border">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>New Research Chat</span>
                <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-bg-surface border border-border">
                  ⌘N / Ctrl+N
                </kbd>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Submit Query</span>
                <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-bg-surface border border-border">
                  Enter ↵
                </kbd>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>New Line</span>
                <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-bg-surface border border-border">
                  Shift + Enter
                </kbd>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Close Modal</span>
                <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-bg-surface border border-border">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-bg-elevated border-t border-border text-xs text-text-muted">
          <span>JunScience Milestone 1 Shell</span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-accent hover:brightness-110 text-white font-medium transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
