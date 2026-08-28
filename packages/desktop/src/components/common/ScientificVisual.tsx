import React from 'react';

interface ScientificVisualProps {
  theme: 'dark' | 'light';
  className?: string;
}

export const ScientificVisual: React.FC<ScientificVisualProps> = ({ theme, className = '' }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {isDark ? (
        /* Dark Theme Orbital Network / Molecular Gyroscope Constellation */
        <svg
          viewBox="0 0 400 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-[380px] max-h-[300px] drop-shadow-[0_0_25px_rgba(0,210,255,0.25)]"
        >
          <defs>
            <linearGradient id="sc-dark-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="sc-dark-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="sc-dark-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#1E3A8A" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
            </radialGradient>
            <filter id="sc-glow-dark" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Central diffuse core glow */}
          <circle cx="200" cy="160" r="90" fill="url(#sc-dark-core)" />

          {/* Major Orbital Ellipses */}
          <ellipse
            cx="200"
            cy="160"
            rx="140"
            ry="55"
            stroke="url(#sc-dark-grad-1)"
            strokeWidth="1.6"
            transform="rotate(-28 200 160)"
          />
          <ellipse
            cx="200"
            cy="160"
            rx="140"
            ry="55"
            stroke="url(#sc-dark-grad-2)"
            strokeWidth="1.6"
            transform="rotate(32 200 160)"
          />
          <ellipse
            cx="200"
            cy="160"
            rx="130"
            ry="45"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            opacity="0.4"
            transform="rotate(85 200 160)"
          />

          {/* Inner Atomic Sub-ring */}
          <ellipse
            cx="200"
            cy="160"
            rx="85"
            ry="30"
            stroke="#60A5FA"
            strokeWidth="1.4"
            transform="rotate(-60 200 160)"
            opacity="0.65"
          />

          {/* Molecular Coordinate Lines / Dotted Crossings */}
          <line x1="120" y1="90" x2="280" y2="230" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.3" />
          <line x1="280" y1="90" x2="120" y2="230" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.3" />
          <line x1="90" y1="160" x2="310" y2="160" stroke="#00D2FF" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.25" />

          {/* Glowing Vertex Atoms / Orbital Electrons */}
          <circle cx="85" cy="115" r="4" fill="#00D2FF" filter="url(#sc-glow-dark)" />
          <circle cx="315" cy="205" r="4.5" fill="#38BDF8" filter="url(#sc-glow-dark)" />
          <circle cx="100" cy="210" r="3.5" fill="#818CF8" filter="url(#sc-glow-dark)" />
          <circle cx="300" cy="110" r="3.5" fill="#00D2FF" filter="url(#sc-glow-dark)" />
          <circle cx="160" cy="65" r="3" fill="#60A5FA" filter="url(#sc-glow-dark)" />
          <circle cx="240" cy="255" r="3.5" fill="#38BDF8" filter="url(#sc-glow-dark)" />
          <circle cx="200" cy="160" r="5" fill="#FFFFFF" filter="url(#sc-glow-dark)" />

          {/* Secondary tiny micro-particles */}
          <circle cx="230" cy="130" r="2" fill="#BAE6FD" opacity="0.8" />
          <circle cx="170" cy="190" r="2" fill="#C7D2FE" opacity="0.8" />
          <circle cx="150" cy="135" r="1.5" fill="#38BDF8" opacity="0.6" />
          <circle cx="250" cy="185" r="1.5" fill="#38BDF8" opacity="0.6" />
          <circle cx="130" cy="160" r="2" fill="#00D2FF" opacity="0.5" />
          <circle cx="270" cy="160" r="2" fill="#818CF8" opacity="0.5" />
        </svg>
      ) : (
        /* Light Theme Minimalist DNA / Molecular Double Helix Constellation */
        <svg
          viewBox="0 0 400 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-[380px] max-h-[300px] drop-shadow-[0_4px_20px_rgba(37,99,235,0.08)]"
        >
          <defs>
            <linearGradient id="sc-light-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="sc-light-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="sc-light-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#F8FAFC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft background glow */}
          <circle cx="200" cy="160" r="100" fill="url(#sc-light-core)" />

          {/* Light Theme DNA Double Helix Strands */}
          <path
            d="M 60,110 C 110,60 150,220 200,160 C 250,100 290,260 340,210"
            stroke="url(#sc-light-grad-1)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 60,210 C 110,260 150,100 200,160 C 250,220 290,60 340,110"
            stroke="url(#sc-light-grad-2)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Base Pair Rungs */}
          <line x1="85" y1="130" x2="85" y2="190" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 3" />
          <line x1="120" y1="95" x2="120" y2="225" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="160" y1="110" x2="160" y2="210" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 3" />
          <line x1="200" y1="150" x2="200" y2="170" stroke="#3B82F6" strokeWidth="2" />
          <line x1="240" y1="110" x2="240" y2="210" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 3" />
          <line x1="280" y1="95" x2="280" y2="225" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="315" y1="130" x2="315" y2="190" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 3" />

          {/* Molecular Nodes */}
          <circle cx="85" cy="130" r="3.5" fill="#2563EB" />
          <circle cx="85" cy="190" r="3.5" fill="#0284C7" />
          <circle cx="120" cy="95" r="4" fill="#3B82F6" />
          <circle cx="120" cy="225" r="4" fill="#60A5FA" />
          <circle cx="160" cy="110" r="3.5" fill="#0284C7" />
          <circle cx="160" cy="210" r="3.5" fill="#2563EB" />
          <circle cx="200" cy="160" r="4.5" fill="#1D4ED8" />
          <circle cx="240" cy="110" r="3.5" fill="#2563EB" />
          <circle cx="240" cy="210" r="3.5" fill="#0284C7" />
          <circle cx="280" cy="95" r="4" fill="#60A5FA" />
          <circle cx="280" cy="225" r="4" fill="#3B82F6" />
          <circle cx="315" cy="130" r="3.5" fill="#0284C7" />
          <circle cx="315" cy="190" r="3.5" fill="#2563EB" />

          {/* Orbital rings around center */}
          <ellipse cx="200" cy="160" rx="90" ry="35" stroke="#BFDBFE" strokeWidth="1" strokeDasharray="4 4" transform="rotate(-20 200 160)" />
        </svg>
      )}
    </div>
  );
};
