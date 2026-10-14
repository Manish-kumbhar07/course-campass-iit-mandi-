import React, { useState } from 'react';
import {
  Video,
  FileText,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { SourceReference } from '../../types';
import { PUBLIC_SAMPLE_CITATIONS } from '../../services/mock-services';

interface LiveSourceScannerHeroProps {
  onInspectCitation: (citation: SourceReference) => void;
}

export const LiveSourceScannerHero: React.FC<LiveSourceScannerHeroProps> = ({
  onInspectCitation
}) => {
  const [selectedSource, setSelectedSource] = useState<'video' | 'pdf' | 'slides'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interactiveDrillOpen, setInteractiveDrillOpen] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const sources = {
    video: {
      title: 'Lecture 08: Recursion & Activation Records',
      anchor: '14:32 / 50:18',
      type: 'Video Recording',
      icon: Video,
      citation: PUBLIC_SAMPLE_CITATIONS.lectureVideo,
      transcript:
        'Every recursive invocation allocates an independent activation record on the call stack containing return pointers and formal parameters. Unbounded invocations exhaust stack limits before any frame can return.',
      tag: 'Henderson · CS 204'
    },
    pdf: {
      title: 'Algorithms & Data Structures Textbook',
      anchor: 'Chapter 4 · Page 112 · Theorem 4.2',
      type: 'Textbook PDF',
      icon: FileText,
      citation: PUBLIC_SAMPLE_CITATIONS.textbookRecursion,
      transcript:
        'Theorem 4.2 (Base Case Halting): A recursive algorithm terminates if and only if every sequence of recursive reductions reaches a base case in a finite number of steps.',
      tag: 'Assigned Reading'
    },
    slides: {
      title: 'Slide Deck 12: Call Stack Frames',
      anchor: 'Slide 19 of 44',
      type: 'Lecture Slides',
      icon: Presentation,
      citation: PUBLIC_SAMPLE_CITATIONS.slidesMemory,
      transcript:
        'Memory Layout Breakdown: Heap grows downward; Call Stack grows upward. When SP (Stack Pointer) crosses limit register, the OS triggers EXC_STACK_OVERFLOW.',
      tag: 'Midterm Review'
    }
  };

  const current = sources[selectedSource];
  const Icon = current.icon;

  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      
      {/* Eye-Catchy Ambient Glow Backdrop */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-[#233D29]/25 rounded-3xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Container Card: Modern, Layered, Eye-Catchy */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-[#D5DFC9] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Card Header: Live Grounding Status & Source Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7ECE0]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <span className="font-serif-display font-bold text-sm text-[#17241B]">
              Live Source Evidence Scanner
            </span>
          </div>

          {/* Source Format Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F4EB] rounded-lg border border-[#DCE2D4] text-[11px] font-medium">
            <button
              onClick={() => setSelectedSource('video')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSource === 'video'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <Video className="w-3 h-3 text-[#D71935]" />
              <span>Video</span>
            </button>
            <button
              onClick={() => setSelectedSource('pdf')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSource === 'pdf'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <FileText className="w-3 h-3 text-[#233D29]" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => setSelectedSource('slides')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                selectedSource === 'slides'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <Presentation className="w-3 h-3 text-[#233D29]" />
              <span>Slides</span>
            </button>
          </div>
        </div>

        {/* Live Multi-Modal Source Monitor */}
        <div className="rounded-xl bg-[#0F1713] text-white p-4 space-y-3 shadow-inner relative overflow-hidden">
          
          {/* Subtle Scanline Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent pointer-events-none" />

          {/* Media Header & Verification Badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-emerald-50 leading-tight">
                  {current.title}
                </h4>
                <span className="font-mono-code text-[10px] text-emerald-400/90">
                  {current.anchor}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono-code">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>100% Grounded</span>
            </div>
          </div>

          {/* Interactive Player Scrubber / Document Preview Bar */}
          {selectedSource === 'video' ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono-code text-zinc-400">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                </button>
                <span>Timestamp Anchor: 14:32.400</span>
                <span className="text-emerald-400">Synced to Audio</span>
              </div>

              {/* Progress Bar with Timestamp Pinpoint Marker */}
              <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full w-[28%]" />
                <div className="absolute top-0 bottom-0 left-[28%] w-1.5 bg-white shadow-xs rounded-full" />
              </div>
            </div>
          ) : (
            <div className="py-1 px-2.5 rounded bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-300">
              <span className="font-mono-code text-[10px] text-emerald-400">Indexed Document Page</span>
              <span className="text-[10px] text-zinc-400">OCR Confidence: 99.8%</span>
            </div>
          )}

          {/* Synchronized Exact Excerpt */}
          <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans">
            <span className="text-[10px] font-semibold uppercase text-emerald-400 font-mono-code block mb-1">
              ● Extracted Course Grounding:
            </span>
            <p className="italic text-[11.5px] text-zinc-300">
              "{current.transcript}"
            </p>
          </div>
        </div>

        {/* Actionable Prerequisite Gap Alert & Remediation */}
        <div className="p-3.5 rounded-xl bg-[#FFF9EE] border border-[#F3DFC0] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Diagnosed Deficit: Recursion Base Case Halting</span>
            </div>
            <span className="text-[10px] font-mono-code bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
              44% Mastery
            </span>
          </div>

          <p className="text-[11px] text-amber-800 leading-normal">
            Downstream graph algorithms (DFS) require solid base condition halts. Patching this saves an estimated <strong>25 minutes</strong> during exam review.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setInteractiveDrillOpen(!interactiveDrillOpen)}
              className="px-3 py-1.5 rounded-lg bg-[#233D29] hover:bg-[#1A2E1F] text-white font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Zap className="w-3 h-3 text-emerald-300 fill-current" />
              <span>{interactiveDrillOpen ? 'Close Quick Drill' : 'Test Halting Drill (1-Min)'}</span>
            </button>

            <button
              onClick={() => onInspectCitation(current.citation)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F1F4EB] border border-[#DCE2D4] text-[#233D29] font-medium text-[11px] flex items-center gap-1 transition-all"
            >
              <span>Inspect Full Citation</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Mini-Drill Expandable */}
          {interactiveDrillOpen && (
            <div className="mt-2.5 p-3 rounded-lg bg-white border border-[#E5EAD9] space-y-2 text-xs animate-in fade-in duration-150">
              <p className="font-semibold text-[#17241B]">
                Quick Check: What occurs if a recursive function modifies neither its parameter nor termination flag?
              </p>
              
              <div className="space-y-1.5">
                {[
                  { id: 0, text: 'Execution loops infinitely in the same single stack frame.', correct: false },
                  { id: 1, text: 'Each call pushes a new activation frame until hardware memory limit is hit (Stack Overflow).', correct: true }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedQuizOption(opt.id);
                      setQuizSubmitted(true);
                    }}
                    className={`w-full text-left p-2 rounded-md border text-[11px] transition-colors ${
                      quizSubmitted
                        ? opt.correct
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                          : selectedQuizOption === opt.id
                          ? 'bg-rose-50 border-rose-400 text-rose-900'
                          : 'bg-white opacity-50'
                        : selectedQuizOption === opt.id
                        ? 'bg-[#233D29]/10 border-[#233D29] font-semibold'
                        : 'bg-[#FAFBF8] border-[#E1E4D8] hover:bg-white'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {quizSubmitted && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Correct! Verified from Lecture 08 at 14:32. Base case mastery increased to 58%.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
