import React, { useState } from 'react';
import { Check, Compass, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export const HeroStudentVisual: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Background Soft Glow & Ambient Framing */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#F2F4EC] to-[#E5E9DD] border border-[#DCE2D3] shadow-xl">
        
        {/* Realistic High-Definition Photography Container */}
        <div className="relative w-full aspect-[4/3.2] overflow-hidden bg-[#E2E7DB]">
          {/* Subtle loading placeholder blur */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-[#E8EDE2] animate-pulse flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#8C9B84] animate-bounce" />
            </div>
          )}

          {/* Authentic, realistic photography of student studying at desk */}
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85"
            alt="University student taking structured study notes with textbook, laptop, and pen"
            className={`w-full h-full object-cover object-center transition-all duration-700 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="eager"
          />

          {/* Realistic ambient lighting & gradient overlays for readability and integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[#233D29]/10 mix-blend-multiply pointer-events-none" />

          {/* Top-Left Floating Badge: Grounded Source Verification */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-lg transition-transform hover:scale-105">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-semibold text-[#17241B] tracking-tight">
              Verified Course Citations
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
          </div>

          {/* Top-Right Floating Pill: Multimodal Ingestion tag */}
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-[#17241B]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white shadow-md text-[10px] font-medium">
            <Sparkles className="w-3 h-3 text-[#DCE7D6]" />
            <span>PDF, Video & Slides</span>
          </div>

          {/* Bottom Left Student Context Snippet */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:block text-white/90">
            <p className="text-[11px] font-medium tracking-wide drop-shadow-md">
              Focused Active Recall Session
            </p>
            <p className="text-[9px] text-white/75 drop-shadow-sm font-mono-code">
              CS 204 • Algorithm Analysis
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FLOATING UI OVERLAY:                                        */}
      {/* "Your Study Path" card with subtle 1px border and shadow     */}
      {/* (Intro to Algorithms [v], Data Structures [v], DP [78%])     */}
      {/* ============================================================ */}
      <div className="absolute -bottom-6 right-2 sm:-right-4 w-[280px] sm:w-[310px] bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E1E4D8] shadow-2xl text-xs space-y-3.5 z-20 transition-all hover:shadow-2xl hover:-translate-y-0.5">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#EAEFE5] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#EAF2E7] text-[#233D29] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-[#17241B] tracking-tight">
              Your Study Path
            </span>
          </div>
          <span className="text-[10px] font-mono-code bg-[#F1F2E6] text-[#4F6048] px-2 py-0.5 rounded-md font-medium border border-[#E1E4D8]/70">
            CS 204
          </span>
        </div>

        {/* Study Path Progress Items */}
        <div className="space-y-2.5">
          {/* Item 1: Intro to Algorithms (Checked) */}
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#FAFBF8] border border-[#EFF2EA]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#233D29] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-[#17241B]">
                Intro to Algorithms
              </span>
            </div>
            <span className="text-[10px] text-[#233D29] font-semibold">
              Completed
            </span>
          </div>

          {/* Item 2: Data Structures (Checked) */}
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#FAFBF8] border border-[#EFF2EA]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#233D29] text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-xs font-medium text-[#17241B]">
                Data Structures
              </span>
            </div>
            <span className="text-[10px] text-[#233D29] font-semibold">
              Completed
            </span>
          </div>

          {/* Item 3: Dynamic Programming (78% completed progress bar) */}
          <div className="py-1.5 px-2.5 rounded-lg bg-[#F3F7F0] border border-[#DCE7D6] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17241B]">
                Dynamic Programming
              </span>
              <span className="text-[11px] font-mono-code font-bold text-[#233D29]">
                78% completed
              </span>
            </div>
            {/* Subtle Green Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#DEE8D9] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2B4B32] to-[#233D29] rounded-full transition-all duration-500"
                style={{ width: '78%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
