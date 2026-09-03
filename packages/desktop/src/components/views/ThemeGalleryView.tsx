import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DesktopTheme } from '../../types/theme';
import { Check, Moon, Sun } from 'lucide-react';

export const ThemeGalleryView: React.FC = () => {
  const { desktopTheme, setDesktopTheme } = useTheme();

  const themes: {
    id: string;
    name: string;
    description: string;
    desktop: DesktopTheme;
    icon: typeof Moon;
    bgPreview: string;
    accentPreview: string;
  }[] = [
    {
      id: 'd-dark',
      name: 'Desktop Dark',
      description: 'Futuristic scientific workstation (#090D16, cyan & electric blue glow)',
      desktop: 'dark',
      icon: Moon,
      bgPreview: '#090D16',
      accentPreview: '#38BDF8',
    },
    {
      id: 'd-light',
      name: 'Desktop Light',
      description: 'Minimalist clean academic science (crisp white/slate, royal blue)',
      desktop: 'light',
      icon: Sun,
      bgPreview: '#F8FAFC',
      accentPreview: '#2563EB',
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Desktop Workstation Themes</h1>
        <p className="text-sm text-text-muted mt-1">
          High-contrast, scientific workstation color themes optimized for research and data analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((t) => {
          const isSelected = desktopTheme === t.desktop;
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => setDesktopTheme(t.desktop)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-sm'
                  : 'border-border bg-bg-surface hover:bg-bg-hover hover:border-border-hover'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{ backgroundColor: t.bgPreview, borderColor: t.accentPreview }}
                  >
                    <Icon size={16} style={{ color: t.accentPreview }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{t.name}</h3>
                  </div>
                </div>
                {isSelected && <Check size={18} className="text-accent" />}
              </div>

              <p className="text-xs text-text-muted mb-4">{t.description}</p>

              <div
                className="h-20 rounded-xl border p-3 flex flex-col justify-between"
                style={{ backgroundColor: t.bgPreview, borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accentPreview }} />
                  <span className="text-[11px] font-mono text-slate-400">Preview: {t.name}</span>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-16 rounded" style={{ backgroundColor: t.accentPreview, opacity: 0.3 }} />
                  <div className="h-4 w-24 rounded bg-slate-700/30" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
