import React from 'react';

interface JunScienceLogoProps {
  size?: number;
  variant?: 'desktop' | 'wireframe-cli';
  className?: string;
}

export const JunScienceLogo: React.FC<JunScienceLogoProps> = ({
  size = 32,
  variant = 'desktop',
  className = '',
}) => {
  const isCli = variant === 'wireframe-cli';

  if (isCli) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none ${className}`}
      >
        {/* Outer orbital nodes & ring in wireframe terminal style */}
        <polygon
          points="50,10 78,18 90,42 82,70 60,88 32,88 12,70 8,42 22,18"
          stroke="var(--term-accent)"
          strokeWidth="1.8"
          strokeDasharray="3 3"
          opacity="0.8"
        />
        {/* Outer vertex nodes */}
        <circle cx="50" cy="10" r="2.5" fill="var(--term-accent)" />
        <circle cx="78" cy="18" r="2.5" fill="var(--term-accent)" />
        <circle cx="90" cy="42" r="2.5" fill="var(--term-accent)" />
        <circle cx="82" cy="70" r="2.5" fill="var(--term-accent)" />
        <circle cx="60" cy="88" r="2.5" fill="var(--term-accent)" />
        <circle cx="32" cy="88" r="2.5" fill="var(--term-accent)" />
        <circle cx="12" cy="70" r="2.5" fill="var(--term-accent)" />
        <circle cx="8" cy="42" r="2.5" fill="var(--term-accent)" />
        <circle cx="22" cy="18" r="2.5" fill="var(--term-accent)" />

        {/* Diagonal Ellipses */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="15"
          stroke="var(--term-accent)"
          strokeWidth="1.8"
          transform="rotate(-30 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="15"
          stroke="var(--term-accent)"
          strokeWidth="1.8"
          transform="rotate(30 50 50)"
        />

        {/* Center Stylized 'J' */}
        <path
          d="M55 28 V57 C55 64 49 69 41 69 C33 69 29 65 27 61 L34 56 C36 59 38 61 41 61 C45 61 46 58 46 54 V28 H55 Z"
          fill="var(--term-accent-bright)"
        />
        <rect x="40" y="26" width="20" height="4.5" rx="1" fill="var(--term-accent-bright)" />
      </svg>
    );
  }

  // Canonical Desktop Rich SVG Logo
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
    >
      <defs>
        <linearGradient id="js-grad-ring" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="js-grad-j" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        <radialGradient id="js-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#818CF8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00D2FF" stopOpacity="0" />
        </radialGradient>
        <filter id="js-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle core glow */}
      <circle cx="50" cy="50" r="32" fill="url(#js-center-glow)" />

      {/* Outer Dodecagon / Molecular Ring */}
      <polygon
        points="50,10 78,18 90,42 82,70 60,88 32,88 12,70 8,42 22,18"
        stroke="url(#js-grad-ring)"
        strokeWidth="1.8"
        strokeDasharray="4 3"
        opacity="0.65"
      />

      {/* Outer Orbital Nodes (Atoms) */}
      <circle cx="50" cy="10" r="2.8" fill="#38BDF8" filter="url(#js-soft-glow)" />
      <circle cx="78" cy="18" r="3" fill="#00D2FF" filter="url(#js-soft-glow)" />
      <circle cx="90" cy="42" r="3" fill="#818CF8" filter="url(#js-soft-glow)" />
      <circle cx="82" cy="70" r="3.2" fill="#38BDF8" filter="url(#js-soft-glow)" />
      <circle cx="60" cy="88" r="2.8" fill="#60A5FA" filter="url(#js-soft-glow)" />
      <circle cx="32" cy="88" r="3" fill="#818CF8" filter="url(#js-soft-glow)" />
      <circle cx="12" cy="70" r="2.8" fill="#00D2FF" filter="url(#js-soft-glow)" />
      <circle cx="8" cy="42" r="3" fill="#38BDF8" filter="url(#js-soft-glow)" />
      <circle cx="22" cy="18" r="2.8" fill="#818CF8" filter="url(#js-soft-glow)" />

      {/* Orbital Ellipses */}
      <ellipse
        cx="50"
        cy="50"
        rx="41"
        ry="15"
        stroke="url(#js-grad-ring)"
        strokeWidth="2.2"
        transform="rotate(-30 50 50)"
        filter="url(#js-soft-glow)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="41"
        ry="15"
        stroke="url(#js-grad-ring)"
        strokeWidth="2.2"
        transform="rotate(30 50 50)"
        filter="url(#js-soft-glow)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="41"
        ry="15"
        stroke="url(#js-grad-ring)"
        strokeWidth="1.5"
        transform="rotate(90 50 50)"
        opacity="0.6"
      />

      {/* Center Stylized 'J' with high-contrast scientific typography */}
      <path
        d="M55 28 V57 C55 64 49 69 41 69 C33 69 29 65 27 61 L34 56 C36 59 38 61 41 61 C45 61 46 58 46 54 V28 H55 Z"
        fill="url(#js-grad-j)"
        filter="url(#js-soft-glow)"
      />
      {/* Top serif bar of J */}
      <rect
        x="40"
        y="26"
        width="20"
        height="4.5"
        rx="1"
        fill="url(#js-grad-j)"
        filter="url(#js-soft-glow)"
      />
    </svg>
  );
};
