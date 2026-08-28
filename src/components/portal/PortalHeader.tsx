import React from 'react';
import { Menu, Search, Star, ArrowRight, Github } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { JunScienceLogo } from '../common/JunScienceLogo';

export const PortalHeader: React.FC = () => {
  const { setIsMobileSidebarOpen, setIsSearchOpen, setActiveSection } = useNav();

  return (
    <header className="sticky top-0 z-30 h-14 bg-bg-surface/80 border-b border-border backdrop-blur-md px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Mobile Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <JunScienceLogo size={26} />
          <span className="font-bold text-[14px] text-text-primary">JunScience</span>
        </div>
      </div>

      {/* Center: Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-bg-elevated/70 border border-border text-[12.5px] text-text-muted hover:text-text-primary hover:border-accent/40 hover:bg-bg-elevated transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-text-muted" />
            <span>Search docs, tools, APIs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-surface border border-border rounded shadow-2xs text-text-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* GitHub Star Badge */}
        <a
          href="https://github.com/Benjamin-JHou/JunScience"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border border-border bg-bg-surface hover:bg-bg-hover hover:border-text-muted/40 transition-all text-text-primary group shadow-2xs"
        >
          <Github size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
          <span className="flex items-center gap-1">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="font-semibold">Star</span>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-bg-elevated text-[11px] font-mono text-text-secondary border border-border">
            0
          </span>
        </a>

        {/* Get Started Button */}
        <button
          onClick={() => setActiveSection('quickstart')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium bg-accent hover:bg-accent-hover text-white shadow-xs transition-all active:scale-98"
        >
          <span>Get Started</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </header>
  );
};
