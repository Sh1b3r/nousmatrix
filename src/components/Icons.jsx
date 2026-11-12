import React from 'react';

// Common base SVG props for consistent 1:1 sci-fi / geometric aesthetic
const defaultProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

// 1. DPS / Crossed Swords (⚔️)
export function DpsIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="19" x2="11" y2="13" />
      <line x1="4" y1="20" x2="8" y2="16" />
    </svg>
  );
}

// 2. Shield / Support / Preservation (🛡️)
export function ShieldIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 7v8" />
      <path d="M9 11h6" />
    </svg>
  );
}

// 3. Scale / Hybrid / Balance (⚖️)
export function ScaleIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M12 3v18" />
      <path d="M6 7l6-3 6 3" />
      <path d="M3 13l3-6 3 6a3 3 0 0 1-6 0z" />
      <path d="M15 13l3-6 3 6a3 3 0 0 1-6 0z" />
      <path d="M4 21h16" />
    </svg>
  );
}

// 4. Healer / Abundance / Life (💚)
export function HealIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  );
}

// 5. Buffer / Harmony / Celestial Spark (✨)
export function SparkleIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      <circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 6. Refresh / Sync (🔄)
export function RefreshIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

// 7. Warning / Alert (⚠️)
export function WarnIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// 8. Check / Success (✓)
export function CheckIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// 9. Planar Sphere (🔮)
export function SphereIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <path d="M12 3c-2.5 4.5-2.5 13.5 0 18" />
    </svg>
  );
}

// 10. Link Rope (🔗)
export function RopeIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// 11. Trophy / Build Card (🏆)
export function TrophyIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

// 12. Copy / Clipboard (📋)
export function CopyIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

// 13. Download / Save (💾)
export function DownloadIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// 14. Arrow Right (➔)
export function ArrowRightIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// 15. Swap / Exchange (⇄)
export function SwapIcon({ size = 16, className = '', style = {} }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} style={style}>
      <polyline points="16 3 21 8 16 13" />
      <line x1="21" y1="8" x2="9" y2="8" />
      <polyline points="8 21 3 16 8 11" />
      <line x1="3" y1="16" x2="15" y2="16" />
    </svg>
  );
}

// 16. Sword / Attack (⚔)
export function SwordIcon({ size = 16, className = '', style = {} }) {
  return <DpsIcon size={size} className={className} style={style} />;
}

// 17. Sparkles / AI (✨)
export function SparklesIcon({ size = 16, className = '', style = {} }) {
  return <SparkleIcon size={size} className={className} style={style} />;
}

// 18. Dynamic Role Icon Resolver
export function RoleSvgIcon({ role = 'DPS', iconType = 'dps', size = 16, className = '', style = {} }) {
  const norm = (iconType || role || '').toString().toLowerCase();

  if (norm.includes('heal') || norm.includes('💚') || norm.includes('abundance')) {
    return <HealIcon size={size} className={className} style={style} />;
  }
  if (norm.includes('shield') || norm.includes('support') || norm.includes('🛡') || norm.includes('knight')) {
    return <ShieldIcon size={size} className={className} style={style} />;
  }
  if (norm.includes('hybrid') || norm.includes('⚖')) {
    return <ScaleIcon size={size} className={className} style={style} />;
  }
  if (norm.includes('buffer') || norm.includes('sparkle') || norm.includes('✨') || norm.includes('harmony') || norm.includes('shaman')) {
    return <SparkleIcon size={size} className={className} style={style} />;
  }
  // Default DPS
  return <DpsIcon size={size} className={className} style={style} />;
}
