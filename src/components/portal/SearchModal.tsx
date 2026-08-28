import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, BookOpen, Terminal, Code2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import { PortalSection } from '../../types/navigation';

interface SearchEntry {
  title: string;
  category: string;
  section: PortalSection;
  description: string;
}

const searchEntries: SearchEntry[] = [
  { title: 'Quick Start Tutorial', category: 'Guide', section: 'quickstart', description: 'Run your first autonomous scientific inquiry in CLI or Desktop.' },
  { title: 'Installation & Download', category: 'Setup', section: 'installation', description: 'Install via npm, build monorepo, or download macOS/Windows/Linux releases.' },
  { title: 'Codex-Style EvidenceVerifier', category: 'Core API', section: 'apireference', description: 'Pre-adoption sanity, mathematical boundary, and anomaly checking gate.' },
  { title: 'DeepSeek Harness Subagent Tree', category: 'Core API', section: 'apireference', description: 'Parallel hypothesis exploration, subagent forking, and evidence matrix.' },
  { title: 'PlanTracker & To-Do Checklist', category: 'Core API', section: 'apireference', description: 'Explicit milestone planning and real-time EventBus broadcasting.' },
  { title: 'OS Kernel Sandboxes', category: 'Architecture', section: 'architecture', description: 'macOS Seatbelt, Linux Bubblewrap, and Windows Low-Integrity isolation.' },
  { title: 'Clinical Data Privacy Gate', category: 'Privacy', section: 'architecture', description: 'Local processing for patient text and DICOM radiomics features.' },
  { title: 'Pathway Enrichment Skill', category: 'Skill', section: 'skills', description: 'Hypergeometric pathway tests across KEGG and Reactome.' },
  { title: 'SAR Pharmacophore Mapping', category: 'Skill', section: 'skills', description: 'Substructure-Activity Relationship analysis and IC50 mapping.' },
  { title: 'Protein Domain Architect', category: 'Skill', section: 'skills', description: 'Domain boundary and pseudokinase vs catalytic topology mapping.' },
  { title: 'CLI Agent & Color Themes', category: 'Interface', section: 'cli', description: 'High-speed terminal agent with Green, Blue, Purple, and Amber themes.' },
  { title: 'Changelog & Release v0.1.0', category: 'Release', section: 'changelog', description: 'Initial open-source scientific release notes.' },
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveSection } = useNav();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query.trim()
    ? searchEntries.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.description.toLowerCase().includes(query.toLowerCase()) ||
          e.category.toLowerCase().includes(query.toLowerCase())
      )
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
            placeholder="Search documentation, skills, APIs..."
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
              No results found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.section)}
                className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between gap-3 transition-colors ${
                  selectedIndex === idx
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'hover:bg-bg-hover text-text-primary'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold">{item.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-bg-elevated text-text-muted border border-border">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-text-muted truncate mt-0.5">{item.description}</p>
                </div>
                <ArrowRight size={14} className="text-text-muted mt-1 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bg-elevated/40 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>Navigate with <kbd className="px-1 py-0.5 font-mono bg-bg-surface border border-border rounded">↑</kbd> <kbd className="px-1 py-0.5 font-mono bg-bg-surface border border-border rounded">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 font-mono bg-bg-surface border border-border rounded">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
