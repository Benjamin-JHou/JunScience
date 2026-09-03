import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, BookOpen, Terminal, Code2, Layers, Cpu, FlaskConical, GitPullRequest, History, Compass, Download, Zap } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { useLanguage } from '../../context/LanguageContext';
import { PortalSection } from '../../types/navigation';

interface SearchEntry {
  titleEn: string;
  titleZh: string;
  categoryEn: string;
  categoryZh: string;
  section: PortalSection;
  descriptionEn: string;
  descriptionZh: string;
  keywords?: string[];
}

const searchEntries: SearchEntry[] = [
  {
    titleEn: 'Quick Start Tutorial',
    titleZh: '快速上手教程',
    categoryEn: 'Guide',
    categoryZh: '指南',
    section: 'quickstart',
    descriptionEn: 'Run your first autonomous scientific inquiry in CLI or Desktop in under 2 minutes.',
    descriptionZh: '2分钟内在终端或桌面端启动首个有据可循的科学研究循环。',
    keywords: ['quickstart', 'tutorial', '入门', '快速开始', 'demo'],
  },
  {
    titleEn: 'Installation & Download',
    titleZh: '安装与下载',
    categoryEn: 'Setup',
    categoryZh: '部署',
    section: 'installation',
    descriptionEn: 'Download macOS DMG, Windows installer, or install CLI via npm / one-line script.',
    descriptionZh: '下载 macOS DMG、Windows 安装包，或通过 npm / 一键脚本安装命令行智能体。',
    keywords: ['install', 'download', 'dmg', 'exe', 'npm', '安装', '下载'],
  },
  {
    titleEn: 'Scientific Research Examples',
    titleZh: '真实科研实践案例',
    categoryEn: 'Examples',
    categoryZh: '案例',
    section: 'examples',
    descriptionEn: '4 full end-to-end cases: kinase selectivity, FAERS pharmacovigilance, clinical trial matching, radiomics.',
    descriptionZh: '4个完整科研案例：激酶别构选择性、FAERS药物警戒信号、临床试验入排匹配、多模态影像组学。',
    keywords: ['examples', 'cases', 'tyk2', 'faers', 'clinical trials', 'radiomics', '案例', '示例'],
  },
  {
    titleEn: 'User Guide & Operating Manual',
    titleZh: '用户指南与操作手册',
    categoryEn: 'Guide',
    categoryZh: '指南',
    section: 'userguide',
    descriptionEn: 'Deep dive into Plan Mode vs Act Mode, tools, evidence anchors, and model providers.',
    descriptionZh: '深入解析 Plan 模式与 Act 模式、工具生态、证据锚点与大模型配置。',
    keywords: ['guide', 'manual', 'plan', 'act', 'tools', '指南', '手册'],
  },
  {
    titleEn: 'System Architecture & Sandboxes',
    titleZh: '系统架构与安全沙箱',
    categoryEn: 'Architecture',
    categoryZh: '架构',
    section: 'architecture',
    descriptionEn: 'macOS Seatbelt, Linux Bubblewrap, Windows Low-Integrity isolation and ClinicalDataGate privacy.',
    descriptionZh: '内核级沙箱环境隔离、Codex风格验证网关与患者隐私保护架构。',
    keywords: ['architecture', 'sandbox', 'seatbelt', 'bubblewrap', 'privacy', 'gate', '架构', '沙箱', '隐私'],
  },
  {
    titleEn: '19 Scientific Agent Skills',
    titleZh: '19项科学领域技能库',
    categoryEn: 'Skills',
    categoryZh: '技能',
    section: 'skills',
    descriptionEn: 'Pre-packaged SOPs for molecular biology, cheminformatics, statistics, literature, and imaging.',
    descriptionZh: '涵盖分子生物学、化学信息学、生物统计、文献计量与影像组学的标准科研技能。',
    keywords: ['skills', 'sop', 'alignment', 'admet', 'kegg', 'prisma', '技能', '化学', '统计'],
  },
  {
    titleEn: 'CLI Terminal Agent Manual',
    titleZh: 'CLI 终端智能体操作手册',
    categoryEn: 'Terminal',
    categoryZh: '终端',
    section: 'cli',
    descriptionEn: 'Interactive REPL slash commands (/model, /plan, /act, /cost) and one-shot execution.',
    descriptionZh: '交互式 REPL 斜杠指令（/model, /plan, /act, /cost）与一键直接执行模式。',
    keywords: ['cli', 'terminal', 'repl', 'commands', 'slash', '终端', '命令行'],
  },
  {
    titleEn: 'EvidenceVerifier Gate API',
    titleZh: 'EvidenceVerifier 证据验证网关',
    categoryEn: 'Core API',
    categoryZh: '核心API',
    section: 'apireference',
    descriptionEn: 'Codex-style mathematical and physical boundary verification before evidence adoption.',
    descriptionZh: '在证据采纳前执行严格的物理与数学边界检测，杜绝幻觉与无效结果。',
    keywords: ['verifier', 'evidence', 'api', 'gate', '验证', '边界'],
  },
  {
    titleEn: 'Contributing & Extension Guide',
    titleZh: '参与贡献与开发者指南',
    categoryEn: 'Community',
    categoryZh: '社区',
    section: 'contributing',
    descriptionEn: 'Guidelines for adding new scientific tools, guardrail hooks, and OpenScience skills.',
    descriptionZh: '如何添加新的科学数据连接器、生命周期守卫 Hook 与标准技能。',
    keywords: ['contribute', 'development', 'pr', 'tools', 'hooks', '贡献', '开发'],
  },
  {
    titleEn: 'Changelog & Releases (v1.3.0)',
    titleZh: '版本更新日志 (v1.3.0)',
    categoryEn: 'Release',
    categoryZh: '版本',
    section: 'changelog',
    descriptionEn: 'v1.3.0 multi-target release packaging, bilingual documentation portal, and version history.',
    descriptionZh: 'v1.3.0 跨平台多目标打包优化、中英双语文档门户与完整历史日志。',
    keywords: ['changelog', 'release', 'v1.3.0', 'notes', '更新', '发布'],
  },
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveSection } = useNav();
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query.trim()
    ? searchEntries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.titleEn.toLowerCase().includes(q) ||
          e.titleZh.toLowerCase().includes(q) ||
          e.descriptionEn.toLowerCase().includes(q) ||
          e.descriptionZh.toLowerCase().includes(q) ||
          e.categoryEn.toLowerCase().includes(q) ||
          e.categoryZh.toLowerCase().includes(q) ||
          e.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : searchEntries.slice(0, 6);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (section: PortalSection) => {
    setActiveSection(section);
    setIsSearchOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].section);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-2xl bg-bg-surface border border-border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'zh' ? '搜索文档、案例、技能或 API...' : 'Search docs, examples, skills, or APIs...'}
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-muted">
              {language === 'zh' ? `未找到与 "${query}" 相关的结果` : `No results found for "${query}".`}
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.section + idx}
                onClick={() => handleSelect(item.section)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                  idx === selectedIndex
                    ? 'bg-accent/10 border border-accent/25 text-text-primary shadow-2xs'
                    : 'hover:bg-bg-hover text-text-secondary border border-transparent'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-text-primary truncate">
                      {language === 'zh' ? item.titleZh : item.titleEn}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-bg-elevated text-text-muted border border-border">
                      {language === 'zh' ? item.categoryZh : item.categoryEn}
                    </span>
                  </div>
                  <p className="text-[12px] text-text-muted line-clamp-1">
                    {language === 'zh' ? item.descriptionZh : item.descriptionEn}
                  </p>
                </div>
                <ArrowRight size={14} className="text-text-muted shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bg-elevated/50 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>{language === 'zh' ? '使用上下方向键导航，回车键确认' : 'Use ↑ / ↓ to navigate, Enter to select'}</span>
          <span>ESC {language === 'zh' ? '关闭' : 'to close'}</span>
        </div>
      </div>
    </div>
  );
};
