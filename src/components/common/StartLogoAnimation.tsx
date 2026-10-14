import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

interface StartLogoAnimationProps {
  onComplete?: () => void;
}

export const StartLogoAnimation: React.FC<StartLogoAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Elegant, crisp start animation timer
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 500);
      return () => clearTimeout(closeTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(() => setIsVisible(false), 250);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBFBFD] transition-opacity duration-500 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="CourseCompass starting..."
    >
      {/* Soft Apple-style Ambient Backdrop Glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />

      {/* Hero Animated Logo Unit */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
        
        {/* Sleek Minimalist Tile */}
        <div className="relative p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-xl shadow-black/[0.04]">
          <Logo size="xl" showWordmark={false} animate={true} />
          
          {/* Subtle Ambient Pulse Ring */}
          <div className="absolute inset-0 rounded-2xl border border-emerald-500/20 animate-ping opacity-25 pointer-events-none" />
        </div>

        {/* Wordmark & Tagline with Apple Precision */}
        <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <h1 className="font-semibold text-2xl sm:text-3xl text-[#1D1D1F] tracking-[-0.03em]">
            Course<span className="text-[#1B4D3E]">Compass</span>
          </h1>
          <p className="text-xs text-[#86868B] font-medium tracking-normal max-w-xs mx-auto">
            Turn scattered study material into your clearest path forward.
          </p>
        </div>

        {/* Precision Progress Bar */}
        <div className="w-32 h-[3px] bg-[#E5E5EA] rounded-full overflow-hidden">
          <div className="h-full bg-[#1B4D3E] rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
};
