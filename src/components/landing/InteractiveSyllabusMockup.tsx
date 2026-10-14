import React, { useState } from 'react';
import { ArrowRight, Check, BookOpen, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { SourceReference } from '../../types';
import { PUBLIC_SAMPLE_CITATIONS } from '../../services/mock-services';

interface InteractiveSyllabusMockupProps {
  onInspectCitation?: (cite: SourceReference) => void;
  onStartLearning?: () => void;
}

export const InteractiveSyllabusMockup: React.FC<InteractiveSyllabusMockupProps> = ({
  onInspectCitation,
  onStartLearning
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none">
      {/* Background Soft Shadow / Layer Effect to Match Image */}
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl blur-lg pointer-events-none" />

      {/* Main Browser Mockup Panel */}
      <div className="relative bg-white rounded-2xl border border-[#E5EAE2] shadow-xl shadow-emerald-950/[0.04] p-5 sm:p-6 text-[#17241B]">
        
        {/* Window Close/Minimize/Maximize Dots */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F0F3ED] gap-2">
          <h3 className="font-bold text-base sm:text-lg text-[#17241B] tracking-tight">
            CS204: Data Structures &amp; Algorithms
          </h3>
          <span className="bg-[#183B25] text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0 shadow-2xs">
            74% Exam Ready
          </span>
        </div>

        {/* Two-Column Interior Body */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          
          {/* Left Panel: The Syllabus Tree */}
          <div className="sm:col-span-5 space-y-3">
            <span className="block text-[10px] font-bold tracking-wider text-[#8A9685] uppercase">
              THE SYLLABUS TREE
            </span>

            <div className="space-y-2.5 text-xs">
              {/* Item 01 */}
              <div className="space-y-0.5">
                <div className="font-semibold text-[#17241B] text-[13px]">
                  01. Asymptotic Analysis
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Check className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
                  <span>Mastered (95%)</span>
                </div>
              </div>

              {/* Item 02 (Active Session Highlighted Box) */}
              <div className="p-2.5 rounded-xl bg-[#D2EBD9]/60 border border-[#C2E4CC]/70 space-y-0.5">
                <div className="font-semibold text-[#17241B] text-[13px]">
                  02. Recursion &amp; Call Stacks
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#183B25]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#183B25] animate-pulse" />
                  <span>Active Session</span>
                </div>
              </div>

              {/* Item 03 */}
              <div className="space-y-1">
                <div className="font-semibold text-[#17241B] text-[13px]">
                  03. Dynamic Programming
                </div>
                <span className="inline-block bg-[#EAECE6] text-[#60675C] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Next Up
                </span>
              </div>

              {/* Item 04 */}
              <div className="space-y-1 opacity-70">
                <div className="font-semibold text-[#737C6E] text-[13px]">
                  04. Graph Theory
                </div>
                <span className="inline-block bg-[#ECEEE9] text-[#868C83] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Locked
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Layered Paper-Like Task Card */}
          <div className="sm:col-span-7 relative">
            {/* Layered Underlay Card for Stacked Depth Effect */}
            <div className="absolute inset-0 bg-[#F4F7F1] rounded-2xl border border-[#E3E8DF] translate-x-1 translate-y-1 pointer-events-none" />

            {/* Front Card */}
            <div className="relative z-10 bg-white rounded-2xl border border-[#E1E7DD] p-4 shadow-sm space-y-3">
              <h4 className="font-semibold text-xs sm:text-sm text-[#17241B] pb-2 border-b border-[#F0F3ED]">
                Recursion &amp; Stack Memory Management
              </h4>

              {/* Minimalist Block Diagram: Call Stack */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[#5D6758] text-center">
                  Call Stack
                </div>

                <div className="max-w-[210px] mx-auto space-y-1 text-center">
                  {/* Block 1 */}
                  <div className="py-1 px-3 rounded-md bg-[#EAF5ED] border border-[#CCE8D4] text-xs font-mono text-[#17241B]">
                    Activation Frame: foo()
                  </div>

                  {/* Micro Arrows */}
                  <div className="text-[10px] text-[#737C6E] leading-none select-none flex items-center justify-center gap-1 font-mono">
                    <span>↓</span>
                    <span>↑</span>
                  </div>

                  {/* Block 2 */}
                  <div className="py-1 px-3 rounded-md bg-[#EAF5ED] border border-[#CCE8D4] text-xs font-mono text-[#17241B]">
                    Activation Frame: bar()
                  </div>

                  {/* Micro Arrows */}
                  <div className="text-[10px] text-[#737C6E] leading-none select-none flex items-center justify-center gap-1 font-mono">
                    <span>↓</span>
                    <span>↑</span>
                  </div>

                  {/* Block 3: Base Case */}
                  <div className="py-1 px-3 rounded-md bg-[#DFF1E4] border border-[#BDE4C7] text-xs font-semibold text-[#183B25]">
                    Base Case
                  </div>
                </div>
              </div>

              {/* Check Question & Compact Formula Button */}
              <div className="pt-2 border-t border-[#F0F3ED] space-y-2">
                <p className="text-[11px] text-[#4A5546] font-medium leading-snug">
                  Why does deep recursion trigger a stack overflow?
                </p>

                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#F5F8F3] hover:bg-[#EBF2E8] border border-[#DCE4D7] text-[11px] font-medium text-[#183B25] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{showAnswer ? 'Hide Key Formula' : 'Show Key Answer & Formula'}</span>
                  {showAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Answer Reveal Drawer */}
                {showAnswer && (
                  <div className="p-2.5 rounded-lg bg-[#FAFDF8] border border-[#D6E6D2] text-[10px] text-[#2F3D2B] leading-relaxed animate-in fade-in duration-200">
                    <p className="font-mono text-[#183B25] font-semibold mb-0.5">
                      Memory Bound: Stack Depth &times; Frame Size &gt; OS Limit
                    </p>
                    <p>
                      Each call allocates return pointers and local variables until contiguous call stack memory (~8MB) is exhausted before any frame unwinds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="pt-4 mt-4 border-t border-[#F0F3ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Bottom Left Citation Links */}
          <div className="text-[#737C6E] text-[11px] flex flex-wrap items-center gap-1">
            <span>Linked to:</span>
            <button
              onClick={() => {
                if (onInspectCitation) onInspectCitation(PUBLIC_SAMPLE_CITATIONS.lectureVideo);
              }}
              className="text-[#17241B] hover:text-[#183B25] underline font-medium transition-colors cursor-pointer"
            >
              Lecture 08 at 14:32
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (onInspectCitation) onInspectCitation(PUBLIC_SAMPLE_CITATIONS.textbookRecursion);
              }}
              className="text-[#17241B] hover:text-[#183B25] underline font-medium transition-colors cursor-pointer"
            >
              Textbook Ch. 4 (p. 112)
            </button>
          </div>

          {/* Bottom Right Vibrant Green CTA */}
          <button
            onClick={() => {
              if (onStartLearning) onStartLearning();
            }}
            className="px-4 py-2 rounded-full bg-[#183B25] hover:bg-[#122E1D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 self-end sm:self-auto"
          >
            <span>Build My Study Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
