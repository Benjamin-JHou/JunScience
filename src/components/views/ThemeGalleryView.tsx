import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { DesktopTheme, CliTheme } from '../../types/theme';
import { Check } from 'lucide-react';

export const ThemeGalleryView: React.FC = () => {
  const {
    desktopTheme,
    setDesktopTheme,
    cliTheme,
    setCliTheme,
    viewMode,
    setViewMode,
  } = useTheme();

  const themes: {
    id: string;
    mode: 'desktop' | 'cli';
    name: string;
    description: string;
    desktop?: DesktopTheme;
    cli?: CliTheme;
    bgPreview: string;
    accentPreview: string;
  }[] = [
    {
      id: 'd-dark',
      mode: 'desktop',
      name: 'Desktop Dark',
      description: 'Futuristic scientific workstation (#090D16, cyan & electric blue glow)',
      desktop: 'dark',
      bgPreview: '#090D16',
      accentPreview: '#38BDF8',
    },
    {
      id: 'd-light',
      mode: 'desktop',
      name: 'Desktop Light',
      description: 'Minimalist clean academic science (crisp white/slate, royal blue)',
      desktop: 'light',
      bgPreview: '#F8FAFC',
      accentPreview: '#2563EB',
    },
    {
      id: 'c-green',
      mode: 'cli',
      name: 'CLI Green',
      description: 'Matrix-inspired terminal (#020603, phosphor green #22C55E)',
      cli: 'green',
      bgPreview: '#020603',
      accentPreview: '#22C55E',
    },
    {
      id: 'c-blue',
      mode: 'cli',
      name: 'CLI Blue',
      description: 'Cyberpunk developer terminal (#030814, electric blue #38BDF8)',
      cli: 'blue',
      bgPreview: '#030814',
      accentPreview: '#38BDF8',
    },
    {
      id: 'c-purple',
      mode: 'cli',
      name: 'CLI Purple',
      description: 'Neon AI terminal (#070312, neon magenta/violet #D946EF)',
      cli: 'purple',
      bgPreview: '#070312',
      accentPreview: '#D946EF',
    },
    {
      id: 'c-amber',
      mode: 'cli',
      name: 'CLI Amber',
      description: 'Retro scientific workstation (#0A0501, amber gold #F59E0B)',
      cli: 'amber',
      bgPreview: '#0A0501',
      accentPreview: '#F59E0B',
    },
  ];

  const handleSelect = (item: typeof themes[0]) => {
    if (item.mode === 'desktop' && item.desktop) {
      setDesktopTheme(item.desktop);
      setViewMode('desktop');
    } else if (item.mode === 'cli' && item.cli) {
      setCliTheme(item.cli);
      setViewMode('cli');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-[960px] mx-auto w-full">
      <div className="pb-6 border-b border-border">
        <h2 className="text-2xl font-bold text-text-primary">Theme & Environment Showcase</h2>
        <p className="text-sm text-text-secondary mt-1">
          Select any of the 6 official JunScience visual specifications to inspect live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {themes.map((t) => {
          const isCurrent =
            (t.mode === 'desktop' && viewMode === 'desktop' && desktopTheme === t.desktop) ||
            (t.mode === 'cli' && viewMode === 'cli' && cliTheme === t.cli);

          return (
            <div
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm relative group ${
                isCurrent
                  ? 'border-accent ring-2 ring-accent/30 bg-bg-surface'
                  : 'border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                  {t.mode.toUpperCase()}
                </span>
                {isCurrent && (
                  <span className="flex items-center gap-1 text-xs text-accent font-semibold">
                    <Check size={13} />
                    <span>Active</span>
                  </span>
                )}
              </div>

              {/* Color Swatch Preview */}
              <div
                className="h-16 rounded-lg mt-3 border border-border flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: t.bgPreview }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md"
                  style={{
                    backgroundColor: t.accentPreview,
                    color: t.id === 'd-light' ? '#FFF' : '#000',
                  }}
                >
                  J
                </div>
              </div>

              <h4 className="text-[14px] font-semibold text-text-primary mt-3">
                {t.name}
              </h4>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {t.description}
              </p>

              <div className="mt-4 pt-3 border-t border-border-subtle flex justify-end">
                <span className="text-xs font-medium text-accent group-hover:translate-x-0.5 transition-transform">
                  Launch View →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
