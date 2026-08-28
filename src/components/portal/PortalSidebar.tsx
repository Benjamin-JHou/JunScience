import React from 'react';
import {
  Home,
  BookOpen,
  Download,
  Zap,
  Compass,
  Code2,
  FlaskConical,
  Terminal,
  Layers,
  Cpu,
  CheckCircle2,
  GitPullRequest,
  History,
  Github,
  MessageSquare,
  FileText,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { JunScienceLogo } from '../common/JunScienceLogo';
import { useNav } from '../../context/NavContext';
import { useTheme } from '../../context/ThemeContext';
import { PortalSection } from '../../types/navigation';

interface NavItemConfig {
  id: PortalSection;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'installation', label: 'Installation', icon: Download },
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
  { id: 'userguide', label: 'User Guide', icon: Compass },
  { id: 'apireference', label: 'API Reference', icon: Code2 },
  { id: 'examples', label: 'Examples', icon: FlaskConical },
  { id: 'cli', label: 'CLI Agent', icon: Terminal },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'skills', label: 'Agent Skills', icon: Cpu },
  { id: 'usecases', label: 'Use Cases', icon: CheckCircle2 },
  { id: 'contributing', label: 'Contributing', icon: GitPullRequest },
  { id: 'changelog', label: 'Changelog', icon: History, badge: 'v0.1.0' },
];

export const PortalSidebar: React.FC = () => {
  const { activeSection, setActiveSection, isMobileSidebarOpen, setIsMobileSidebarOpen } = useNav();
  const { desktopTheme, setDesktopTheme } = useTheme();

  const isDark = desktopTheme === 'dark';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Frame */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] xl:w-[250px] bg-bg-surface border-r border-border flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <button
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-2.5 text-left group transition-transform"
          >
            <JunScienceLogo size={32} />
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-text-primary tracking-tight leading-tight group-hover:text-accent transition-colors">
                JunScience
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wide">
                AI for Scientific Discovery
              </span>
            </div>
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Middle Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 text-[13px] font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent/15 text-accent border border-accent/25">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Social & Theme Toggle Footer */}
        <div className="p-3.5 border-t border-border/80 bg-bg-surface/50 space-y-2.5">
          {/* External Links */}
          <div className="space-y-1 text-[12px] text-text-muted">
            <a
              href="https://github.com/Benjamin-JHou/JunScience"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-2 py-1 rounded hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/Benjamin-JHou/JunScience/discussions"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-2 py-1 rounded hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <MessageSquare size={14} />
              <span>Discord / Community</span>
            </a>
            <button
              onClick={() => setActiveSection('docs')}
              className="w-full flex items-center gap-2 px-2 py-1 rounded text-left hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <FileText size={14} />
              <span>Paper <span className="text-[10px] text-text-muted">(coming soon)</span></span>
            </button>
          </div>

          {/* Light / Dark Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-bg-elevated border border-border">
            <button
              onClick={() => setDesktopTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                !isDark
                  ? 'bg-white text-accent shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Sun size={12} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setDesktopTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                isDark
                  ? 'bg-bg-hover text-accent shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Moon size={12} />
              <span>Dark</span>
            </button>
          </div>

          {/* Copyright */}
          <div className="pt-1 px-1 flex items-center justify-between text-[10.5px] text-text-muted">
            <span>© 2025 JunScience</span>
            <span className="font-mono">MIT License</span>
          </div>
        </div>
      </aside>
    </>
  );
};
