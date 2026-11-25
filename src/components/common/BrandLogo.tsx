import React from 'react';
import { useApp } from '../../context/AppContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const { navigate } = useApp();

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <button
      onClick={() => navigate('/')}
      className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] rounded-lg transition-transform active:scale-[0.98]"
      aria-label="Neyin Nesi Ana Sayfa"
    >
      {/* Bespoke Geometric Discovery Symbol: Interlocking comparison apertures with central inquiry node */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#0B0F14] to-[#1e293b] dark:from-[#14B8A6] dark:to-[#0f766e] flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 transition-colors`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-[#14B8A6] dark:text-white transition-transform group-hover:scale-105"
        >
          {/* Overlapping discovery lenses symbol */}
          <circle cx="13" cy="14" r="7" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
          <circle cx="19" cy="14" r="7" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.9" />
          {/* Center inquiry balance pip */}
          <circle cx="16" cy="24" r="1.8" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight ${textSizes[size]} text-[#0B0F14] dark:text-white transition-colors`}>
            Neyin Nesi<span className="text-[#14B8A6]">?</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            Anla · Karşılaştır · Karar ver
          </span>
        )}
      </div>
    </button>
  );
};
