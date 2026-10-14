import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  animate?: boolean;
  theme?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  animate = true,
  theme = 'light'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = {
    sm: {
      box: 'w-7 h-7',
      svg: 'w-4.5 h-4.5',
      text: 'text-base',
      subtext: 'text-[9px]'
    },
    md: {
      box: 'w-9 h-9',
      svg: 'w-5.5 h-5.5',
      text: 'text-lg',
      subtext: 'text-[10px]'
    },
    lg: {
      box: 'w-11 h-11',
      svg: 'w-7 h-7',
      text: 'text-2xl',
      subtext: 'text-[11px]'
    },
    xl: {
      box: 'w-14 h-14',
      svg: 'w-9 h-9',
      text: 'text-3xl',
      subtext: 'text-xs'
    }
  }[size];

  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Precision Apple-Caliber Compass Mark */}
      <div
        className={`${dimensions.box} rounded-[10px] bg-[#142417] flex items-center justify-center relative shadow-sm shrink-0 overflow-hidden cursor-pointer transition-all duration-300 ${
          isHovered ? 'scale-105 shadow-md bg-[#0F1B11]' : ''
        }`}
        aria-hidden="true"
      >
        {/* Subtle Edge Highlight */}
        <div className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/15 pointer-events-none" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${dimensions.svg} text-[#EAF2E7] transition-all duration-300`}
        >
          <defs>
            {/* North Point Gradient */}
            <linearGradient id="appleNorth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>

            {/* South Point Gradient */}
            <linearGradient id="appleSouth" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A6B53" />
              <stop offset="100%" stopColor="#25382B" />
            </linearGradient>
          </defs>

          {/* Calibrated Minimal Compass Degree Ring */}
          <circle
            cx="18"
            cy="18"
            r="14.5"
            stroke="#4A6B53"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Cardinal Navigation Points */}
          <line x1="18" y1="2" x2="18" y2="4.5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="31.5" x2="18" y2="34" stroke="#4A6B53" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="2" y1="18" x2="4.5" y2="18" stroke="#4A6B53" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="31.5" y1="18" x2="34" y2="18" stroke="#4A6B53" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

          {/* Interconnected Knowledge Lattice Lines */}
          <path
            d="M 11 18 L 25 18 M 18 11 L 18 25"
            stroke="#3B5942"
            strokeWidth="0.8"
            strokeDasharray="1.5 2.5"
          />

          {/* Knowledge Nodes */}
          <circle cx="11" cy="18" r="1.2" fill="#4ADE80" />
          <circle cx="25" cy="18" r="1.2" fill="#4ADE80" />
          <circle cx="18" cy="11" r="1.2" fill="#4ADE80" />
          <circle cx="18" cy="25" r="1.2" fill="#4ADE80" />

          {/* Precision 3D Compass Needle */}
          <g
            className={`transition-transform duration-500 ease-out origin-center ${
              animate && mounted ? 'animate-compass-calibrate' : ''
            } ${isHovered ? 'rotate-12' : ''}`}
          >
            {/* North Needle */}
            <polygon points="18,4 21,16 18,14.5" fill="url(#appleNorth)" />
            <polygon points="18,4 15,16 18,14.5" fill="#E2E8F0" />

            {/* South Needle */}
            <polygon points="18,32 15,20 18,21.5" fill="url(#appleSouth)" />
            <polygon points="18,32 21,20 18,21.5" fill="#1B2B1F" />

            {/* Pivot Center Hub */}
            <circle cx="18" cy="18" r="2.5" fill="#0E1A11" stroke="#4ADE80" strokeWidth="1" />
            <circle cx="18" cy="18" r="1" fill="#4ADE80" />
          </g>
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            <span
              className={`font-semibold tracking-[-0.02em] ${dimensions.text} ${
                theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'
              }`}
            >
              Course<span className="text-[#1B4D3E]">Compass</span>
            </span>
          </div>
          <span
            className={`font-mono text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-[#86868B]'
            }`}
          >
            Study Platform
          </span>
        </div>
      )}
    </div>
  );
};
