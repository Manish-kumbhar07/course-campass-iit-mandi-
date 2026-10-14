import React from 'react';
import { Compass, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Verifying secure session...'
}) => {
  return (
    <div
      className="min-h-screen bg-[#F8F7EF] flex flex-col items-center justify-center p-6 text-center select-none"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-xl bg-[#263F2B] text-[#DCE5CE] flex items-center justify-center shadow-xs mb-4">
        <Compass className="w-7 h-7 animate-pulse" />
      </div>
      <h2 className="font-serif-display text-xl font-bold text-[#263F2B] mb-2">
        CourseCompass
      </h2>
      <div className="flex items-center gap-2 text-xs text-[#5D655B] font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-[#697650]" />
        <span>{message}</span>
      </div>
      <p className="text-[11px] text-[#777E70] mt-4 font-mono-code">
        FERPA-compliant private session authorization
      </p>
    </div>
  );
};
