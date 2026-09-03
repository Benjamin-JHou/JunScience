import React, { useState, useEffect } from 'react';
import { Menu, Search, Star, Github, Globe } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { useLanguage } from '../../context/LanguageContext';
import { JunScienceLogo } from '../common/JunScienceLogo';

export const PortalHeader: React.FC = () => {
  const { setIsMobileSidebarOpen, setIsSearchOpen } = useNav();
  const { language, setLanguage } = useLanguage();
  const [starCount, setStarCount] = useState<number | null>(null);

  // Real-time GitHub Star count fetcher
  useEffect(() => {
    let isMounted = true;
    fetch('https://api.github.com/repos/Benjamin-JHou/JunScience')
      .then((res) => {
        if (!res.ok) throw new Error('Rate limited or not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted && typeof data?.stargazers_count === 'number') {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(() => {
        // Real-time count unavailable: keep starCount as null so fake '0' is never displayed
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
            <span>{language === 'zh' ? '搜索文档、工具、API 或技能...' : 'Search docs, tools, APIs, skills...'}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-surface border border-border rounded shadow-2xs text-text-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions (GitHub dynamic star & Language switcher) */}
      <div className="flex items-center gap-3">
        {/* GitHub Star Badge: Displays real-time count if available, otherwise cleanly shows GitHub button without fake '0' */}
        <a
          href="https://github.com/Benjamin-JHou/JunScience"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border border-border bg-bg-surface hover:bg-bg-hover hover:border-text-muted/40 transition-all text-text-primary group shadow-2xs"
          title="JunScience GitHub Repository"
        >
          <Github size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
          <span className="flex items-center gap-1">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="font-semibold">Star</span>
          </span>
          {starCount !== null && (
            <span className="px-1.5 py-0.2 rounded bg-bg-elevated text-[11px] font-mono text-text-secondary border border-border">
              {starCount}
            </span>
          )}
        </a>

        {/* Language Switcher (Default English, toggle to 中文) */}
        <div className="flex items-center p-0.5 rounded-lg bg-bg-elevated border border-border text-[11.5px] font-medium shadow-2xs">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              language === 'en'
                ? 'bg-bg-surface text-accent font-bold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="English"
          >
            EN
          </button>
          <span className="text-border px-0.5 select-none">|</span>
          <button
            onClick={() => setLanguage('zh')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              language === 'zh'
                ? 'bg-bg-surface text-accent font-bold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
            title="简体中文"
          >
            中文
          </button>
        </div>
      </div>
    </header>
  );
};
