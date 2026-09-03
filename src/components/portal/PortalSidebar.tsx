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
  GitPullRequest,
  History,
  Github,
  MessageSquare,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { JunScienceLogo } from '../common/JunScienceLogo';
import { useNav } from '../../context/NavContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { PortalSection } from '../../types/navigation';

interface NavItemConfig {
  id: PortalSection;
  labelEn: string;
  labelZh: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItemConfig[] = [
  { id: 'home', labelEn: 'Home', labelZh: '主页', icon: Home },
  { id: 'docs', labelEn: 'Documentation', labelZh: '文档总览', icon: BookOpen },
  { id: 'installation', labelEn: 'Installation', labelZh: '安装部署', icon: Download },
  { id: 'quickstart', labelEn: 'Quick Start', labelZh: '快速上手', icon: Zap },
  { id: 'userguide', labelEn: 'User Guide', labelZh: '用户指南', icon: Compass },
  { id: 'apireference', labelEn: 'API Reference', labelZh: 'API 参考', icon: Code2 },
  { id: 'examples', labelEn: 'Examples', labelZh: '实践案例', icon: FlaskConical },
  { id: 'cli', labelEn: 'CLI Agent', labelZh: '终端智能体', icon: Terminal },
  { id: 'architecture', labelEn: 'Architecture', labelZh: '系统架构', icon: Layers },
  { id: 'skills', labelEn: 'Agent Skills', labelZh: '科学技能库', icon: Cpu },
  { id: 'contributing', labelEn: 'Contributing', labelZh: '参与贡献', icon: GitPullRequest },
  { id: 'changelog', labelEn: 'Changelog', labelZh: '更新日志', icon: History, badge: 'v1.4.0' },
];

export const PortalSidebar: React.FC = () => {
  const { activeSection, setActiveSection, isMobileSidebarOpen, setIsMobileSidebarOpen } = useNav();
  const { desktopTheme, setDesktopTheme } = useTheme();
  const { language } = useLanguage();

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
                {language === 'zh' ? '科学研究自主智能体' : 'AI for Scientific Discovery'}
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
            const label = language === 'zh' ? item.labelZh : item.labelEn;
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
                  <span className="truncate">{label}</span>
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
              <span>{language === 'zh' ? '讨论社区' : 'Discussions / Community'}</span>
            </a>
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
              <span>{language === 'zh' ? '浅色' : 'Light'}</span>
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
              <span>{language === 'zh' ? '深色' : 'Dark'}</span>
            </button>
          </div>

          {/* Copyright */}
          <div className="pt-1 px-1 flex items-center justify-between text-[10.5px] text-text-muted">
            <span>© 2026 JunScience</span>
            <span className="font-mono">MIT License</span>
          </div>
        </div>
      </aside>
    </>
  );
};
