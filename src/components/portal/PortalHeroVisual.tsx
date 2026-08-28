import React from 'react';

export const PortalHeroVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] h-[340px] md:h-[380px] flex items-center justify-center select-none pointer-events-none">
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 bg-radial-gradient from-accent/15 via-accent-secondary/5 to-transparent rounded-full blur-3xl opacity-70" />

      {/* Floating Card 1: Molecular Graph (Top Left) */}
      <div className="absolute -top-2 -left-2 sm:left-4 z-10 p-3 rounded-xl bg-white/90 dark:bg-bg-surface/90 border border-border shadow-sm backdrop-blur-md w-[140px] sm:w-[160px] animate-pulse-slow">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Molecular Net</span>
        </div>
        <svg viewBox="0 0 120 50" className="w-full h-8 stroke-accent fill-accent">
          <line x1="20" y1="25" x2="50" y2="12" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="50" y1="12" x2="80" y2="28" strokeWidth="1.5" />
          <line x1="80" y1="28" x2="105" y2="15" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="50" y1="12" x2="55" y2="40" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="4" fill="#38BDF8" />
          <circle cx="50" cy="12" r="5" fill="#2563EB" />
          <circle cx="80" cy="28" r="4" fill="#818CF8" />
          <circle cx="105" cy="15" r="3.5" fill="#00D2FF" />
          <circle cx="55" cy="40" r="3.5" fill="#3B82F6" />
        </svg>
      </div>

      {/* Floating Card 2: Scientific Analytics Chart (Top Right) */}
      <div className="absolute top-2 -right-2 sm:right-4 z-10 p-3 rounded-xl bg-white/90 dark:bg-bg-surface/90 border border-border shadow-sm backdrop-blur-md w-[130px] sm:w-[150px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Binding SAR</span>
          <span className="text-[9px] font-mono text-status-success font-medium">p &lt; 0.001</span>
        </div>
        <div className="flex items-end gap-1.5 h-8">
          <div className="flex-1 bg-accent/30 rounded-t h-[45%]" />
          <div className="flex-1 bg-accent/50 rounded-t h-[70%]" />
          <div className="flex-1 bg-accent rounded-t h-[95%]" />
          <div className="flex-1 bg-accent/40 rounded-t h-[55%]" />
          <div className="flex-1 bg-accent/60 rounded-t h-[80%]" />
        </div>
      </div>

      {/* Floating Card 3: Evidence & Data Matrix (Bottom Left) */}
      <div className="absolute bottom-4 -left-3 sm:left-2 z-10 p-2.5 rounded-xl bg-white/90 dark:bg-bg-surface/90 border border-border shadow-sm backdrop-blur-md w-[150px] sm:w-[170px]">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="px-1 py-0.5 rounded text-[9px] font-mono font-bold bg-accent/15 text-accent border border-accent/25">EV-1</span>
          <span className="text-[10px] font-medium text-text-secondary truncate">JH2 Allosteric</span>
        </div>
        <div className="space-y-1 font-mono text-[9px] text-text-muted">
          <div className="flex justify-between">
            <span>IC50:</span>
            <span className="text-text-primary font-semibold">12.5 nM</span>
          </div>
          <div className="flex justify-between">
            <span>pLDDT:</span>
            <span className="text-text-primary font-semibold">88.4 / 100</span>
          </div>
        </div>
      </div>

      {/* Floating Card 4: DNA Double Helix (Bottom Right) */}
      <div className="absolute bottom-2 -right-3 sm:right-2 z-10 p-2.5 rounded-xl bg-white/90 dark:bg-bg-surface/90 border border-border shadow-sm backdrop-blur-md w-[140px] sm:w-[160px]">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">UniProt Swiss</span>
        </div>
        <svg viewBox="0 0 120 30" className="w-full h-6">
          <path d="M 10,8 C 30,0 45,24 65,15 C 85,6 100,24 115,8" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 10,22 C 30,30 45,6 65,15 C 85,24 100,6 115,22" fill="none" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="25" y1="11" x2="25" y2="19" stroke="#93C5FD" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="50" y1="9" x2="50" y2="21" stroke="#93C5FD" strokeWidth="1" />
          <line x1="75" y1="10" x2="75" y2="20" stroke="#93C5FD" strokeWidth="1" strokeDasharray="1 2" />
          <line x1="100" y1="11" x2="100" y2="19" stroke="#93C5FD" strokeWidth="1" />
        </svg>
      </div>

      {/* Center Scientific Atomic Orb Visual */}
      <svg
        viewBox="0 0 340 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]"
      >
        <defs>
          <linearGradient id="orb-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <radialGradient id="center-sphere" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="90%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </radialGradient>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Orbit Rings */}
        <ellipse
          cx="170"
          cy="170"
          rx="145"
          ry="55"
          stroke="url(#orb-blue-grad)"
          strokeWidth="1.8"
          transform="rotate(-30 170 170)"
          filter="url(#soft-glow)"
          opacity="0.85"
        />
        <ellipse
          cx="170"
          cy="170"
          rx="145"
          ry="55"
          stroke="url(#orb-blue-grad)"
          strokeWidth="1.8"
          transform="rotate(30 170 170)"
          filter="url(#soft-glow)"
          opacity="0.85"
        />
        <ellipse
          cx="170"
          cy="170"
          rx="145"
          ry="55"
          stroke="url(#orb-blue-grad)"
          strokeWidth="1.4"
          transform="rotate(90 170 170)"
          strokeDasharray="4 4"
          opacity="0.6"
        />

        {/* Orbit Atoms / Particles */}
        <circle cx="50" cy="100" r="5" fill="#00D2FF" filter="url(#soft-glow)" />
        <circle cx="290" cy="240" r="5" fill="#38BDF8" filter="url(#soft-glow)" />
        <circle cx="65" cy="245" r="4.5" fill="#818CF8" filter="url(#soft-glow)" />
        <circle cx="275" cy="95" r="4.5" fill="#00D2FF" filter="url(#soft-glow)" />
        <circle cx="170" cy="25" r="4" fill="#3B82F6" />
        <circle cx="170" cy="315" r="4" fill="#8B5CF6" />

        {/* Central Core Glowing Sphere */}
        <circle cx="170" cy="170" r="48" fill="url(#center-sphere)" filter="url(#soft-glow)" />

        {/* Central Stylized Bold 'J' */}
        <path
          d="M178 140 V182 C178 193 169 200 156 200 C146 200 139 195 136 189 L146 182 C148 186 151 189 156 189 C162 189 164 185 164 179 V140 H178 Z"
          fill="#FFFFFF"
          filter="url(#soft-glow)"
        />
        <rect x="157" y="136" width="30" height="7" rx="1.5" fill="#FFFFFF" filter="url(#soft-glow)" />
      </svg>
    </div>
  );
};
