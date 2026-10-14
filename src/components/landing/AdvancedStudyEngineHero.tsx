import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Play,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { SourceReference } from '../../types';
import { PUBLIC_SAMPLE_CITATIONS } from '../../services/mock-services';

interface AdvancedStudyEngineHeroProps {
  onInspectCitation?: (cite: SourceReference) => void;
  onStartLearning?: () => void;
}

export const AdvancedStudyEngineHero: React.FC<AdvancedStudyEngineHeroProps> = ({
  onInspectCitation,
  onStartLearning
}) => {
  const [activeMode, setActiveMode] = useState<'synthesis' | 'diagnostic' | 'readiness'>('synthesis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedScore, setSimulatedScore] = useState(82);

  const handleRunSimulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSimulatedScore((prev) => Math.min(100, prev + 6));
    }, 600);
  };

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none">
      {/* Precision Apple-Pro Titanium Card */}
      <div className="relative bg-[#0C0E12] rounded-2xl border border-[#232936] shadow-2xl overflow-hidden text-white font-sans-body">
        
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-[#141820] border-b border-[#232936] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#383D47]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#383D47]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#383D47]" />
            </div>
            <div className="h-3.5 w-px bg-[#262E3B] mx-1" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-emerald-400 tracking-tight">
                STUDY ENGINE V3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span>Accuracy:</span>
            <span className="text-white font-semibold">99.4%</span>
          </div>
        </div>

        {/* Feature Mode Switcher (Apple-style segmented control) */}
        <div className="p-3 bg-[#0F1217] border-b border-[#1E2430]">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#161B24] rounded-xl border border-[#232B3B]">
            <button
              onClick={() => setActiveMode('synthesis')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'synthesis'
                  ? 'bg-[#232D3F] text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synthesis</span>
            </button>
            <button
              onClick={() => setActiveMode('diagnostic')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'diagnostic'
                  ? 'bg-[#232D3F] text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic</span>
            </button>
            <button
              onClick={() => setActiveMode('readiness')}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'readiness'
                  ? 'bg-[#232D3F] text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Exam Radar</span>
            </button>
          </div>
        </div>

        {/* Interactive Interactive Body Display */}
        <div className="p-5 sm:p-6 space-y-4 min-h-[340px]">
          {/* MODE 1: SYNTHESIS */}
          {activeMode === 'synthesis' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono uppercase text-[10px] tracking-wider text-zinc-400">
                  Raw Course Material Input
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  ● 3 Sources Unified
                </span>
              </div>

              {/* Source Ingestion Strip */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#141822] border border-[#222A38] space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">Lecture 08</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">52:14 min sync</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141822] border border-[#222A38] space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span className="truncate">Textbook Ch. 4</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">Page 112 OCR</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141822] border border-[#222A38] space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">Slide Deck 12</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">44 Slides parsed</span>
                </div>
              </div>

              {/* Deconstructed Synthesis Card */}
              <div className="p-4 rounded-xl bg-[#131720] border border-[#242D3D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Crystallized Core Concept</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    High Exam Yield
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Call stack overflow occurs because each recursive invocation pushes a distinct <strong className="text-white">activation frame</strong> containing return addresses. Unbounded recursion exhausts physical contiguous stack limits (~8MB) before any frame returns.
                </p>

                {/* Direct Proof Anchor */}
                <div className="pt-2 border-t border-[#1F2633] flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Direct Instructor Anchor:</span>
                  <button
                    onClick={() => {
                      if (onInspectCitation) onInspectCitation(PUBLIC_SAMPLE_CITATIONS.lectureVideo);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 underline text-[11px]"
                  >
                    <span>Lecture 08 @ 14:32</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: DIAGNOSTIC */}
          {activeMode === 'diagnostic' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono uppercase text-[10px] tracking-wider text-zinc-400">
                  Active Misconception Detector
                </span>
                <span className="font-mono text-[10px] text-amber-400">
                  ● Root-Cause Analysis
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1B1414] border border-[#3E1D22] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Student Failed Question #4 on Midterm Practice</span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Student selected: <em>"Recursion fails because array memory is dynamic."</em>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#131720] border border-[#242D3D] space-y-2 text-xs">
                <span className="text-[10px] font-mono text-amber-400 block uppercase font-semibold">
                  CourseCompass Cognitive Diagnosis
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  The error is not an array memory issue. The student has a fundamental misconception regarding <strong>Halting Invariants</strong>. They did not notice the index parameter was passed without decrementation (<code className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">n</code> instead of <code className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">n-1</code>).
                </p>
                <div className="p-2.5 rounded-lg bg-[#18202E] border border-[#2A374E] text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Prerequisite to reinforce: Recursion Base Conditions</span>
                  <span className="font-semibold text-white">2 min sprint</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: EXAM RADAR */}
          {activeMode === 'readiness' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono uppercase text-[10px] tracking-wider text-zinc-400">
                  CS 204 Midterm Predictive Readiness
                </span>
                <span className="font-mono text-[10px] text-teal-400">
                  ● Exam in 5 Days
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">Graph Cycle Detection &amp; DFS</span>
                    <span className="font-mono text-emerald-400">92% · Solid</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1C2230] overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">Call Stack &amp; Activation Records</span>
                    <span className="font-mono text-emerald-400">86% · Ready</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1C2230] overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[86%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">Dynamic Programming Memoization</span>
                    <span className="font-mono text-amber-400">{simulatedScore}% · Focus Topic</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1C2230] overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${simulatedScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleRunSimulation}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-[#222B3B] hover:bg-[#2B374A] text-xs text-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Updating...' : 'Simulate 10-Min Flash Recall'}</span>
                </button>
                <span className="text-[11px] text-zinc-400">Overall: 88% Exam Ready</span>
              </div>
            </div>
          )}

          {/* Bottom Interactive CTA Action */}
          <div className="pt-2 border-t border-[#1C2230] flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-mono">
              Zero Hallucinations Guarantee
            </span>
            <button
              onClick={() => {
                if (onStartLearning) onStartLearning();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>Build My Study Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
