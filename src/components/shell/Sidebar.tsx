import React from 'react';
import {
  Home,
  BookOpen,
  BarChart2,
  FlaskConical,
  Code2,
  Atom,
  BookMarked,
  Database,
  FolderKanban,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { JunScienceLogo } from '../common/JunScienceLogo';
import { useNav } from '../../context/NavContext';
import { useAgent } from '../../context/AgentContext';
import { NavSection } from '../../types/navigation';

interface SidebarProps {
  className?: string;
}

interface NavItemConfig {
  id: NavSection;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'literature', label: 'Literature', icon: BookOpen },
  { id: 'data-analysis', label: 'Data Analysis', icon: BarChart2 },
  { id: 'experiment-design', label: 'Experiment Design', icon: FlaskConical },
  { id: 'code-assistant', label: 'Code Assistant', icon: Code2 },
  { id: 'molecule-explorer', label: 'Molecule Explorer', icon: Atom },
  { id: 'notebook', label: 'Notebook', icon: BookMarked },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
  { id: 'my-projects', label: 'My Projects', icon: FolderKanban },
];

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const {
    activeSection,
    setActiveSection,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsSettingsOpen,
  } = useNav();

  const { resetSession } = useAgent();

  const handleNewChat = () => {
    resetSession();
    setActiveSection('home');
  };

  const handleNavClick = (sectionId: NavSection) => {
    setActiveSection(sectionId);
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-bg-surface border-r border-border transition-all duration-200 select-none z-20 ${
        isSidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
      } ${className}`}
    >
      {/* Top Header: Logo & Brand */}
      <div className="flex items-center justify-between px-4 h-[56px] border-b border-border-subtle">
        <div
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          onClick={() => {
            setActiveSection('home');
          }}
        >
          <JunScienceLogo size={28} />
          {!isSidebarCollapsed && (
            <span className="font-semibold text-[17px] tracking-tight text-text-primary whitespace-nowrap">
              JunScience
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border hover:border-accent/40 bg-bg-elevated hover:bg-bg-hover text-text-primary transition-all group ${
            isSidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title="New Chat (⌘N)"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-accent group-hover:scale-110 transition-transform" />
            {!isSidebarCollapsed && (
              <span className="text-[13.5px] font-medium tracking-tight">New Chat</span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <kbd className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-bg-surface text-text-muted border border-border-subtle">
              ⌘ N
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}
              />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-border-subtle">
        <div
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors ${
            isSidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title="User profile & settings"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-accent-secondary flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              <span>JZ</span>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-bg-surface" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col text-left truncate">
                <span className="text-[13px] font-medium text-text-primary truncate">Junyu Zhou</span>
                <span className="text-[11px] text-text-muted">Pro Plan</span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </div>
    </aside>
  );
};
