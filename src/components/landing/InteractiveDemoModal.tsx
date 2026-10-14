import React, { useState } from 'react';
import {
  X,
  Play,
  Sparkles,
  BookOpen,
  Video,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Network,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { SourceReference } from '../../types';
import { PUBLIC_SAMPLE_CITATIONS } from '../../services/mock-services';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: () => void;
  onInspectCitation: (citation: SourceReference) => void;
}

export const InteractiveDemoModal: React.FC<InteractiveDemoModalProps> = ({
  isOpen,
  onClose,
  onStartLearning,
  onInspectCitation
}) => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'map' | 'quiz'>('tutor');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAFBF8] border border-[#E1E4D8] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E1E4D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#233D29] text-white flex items-center justify-center">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base text-[#17241B]">
                CourseCompass Interactive Demo
              </h3>
              <p className="text-xs text-[#5D655B]">
                Sample Course: Data Structures (Recursion & Graphs)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5D655B] hover:text-[#17241B] hover:bg-[#F1F2E6] transition-colors"
            aria-label="Close demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Sub-Tabs */}
        <div className="px-6 pt-3 pb-2 bg-[#F1F2E6]/70 border-b border-[#E1E4D8] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('tutor')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tutor'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Source-Grounded AI Tutor</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Prerequisite Map</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-white text-[#233D29] font-semibold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Adaptive Quiz</span>
            </button>
          </div>

          <span className="text-[11px] font-mono-code text-[#697650] hidden sm:inline">
            Interactive Preview
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* TAB 1: TUTOR */}
          {activeTab === 'tutor' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white border border-[#E1E4D8] space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#697650]">
                  Sample Student Inquiry
                </span>
                <p className="text-sm font-medium text-[#17241B]">
                  "Why does infinite recursion cause a stack overflow error specifically, instead of just hanging forever like an infinite while loop?"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#DCE5CE] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#233D29]">CourseCompass Tutor</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono-code px-2 py-0.5 rounded border border-emerald-200">
                      ● Supported by your course
                    </span>
                  </div>
                </div>

                <p className="text-[#17241B] leading-relaxed text-xs">
                  In a standard <code className="font-mono-code bg-[#F1F2E6] px-1 py-0.5 rounded">while(true)</code> loop, execution loops within the <em>exact same stack frame</em> without requesting additional hardware memory.
                  <br /><br />
                  In contrast, each recursive function call allocates a distinct <strong>activation record (stack frame)</strong> containing return pointers, local parameters, and saved registers. Because process stack memory is strictly contiguous and bounded (~1-8 MB), unbounded recursive invocations exhaust available stack memory before any frame can return and pop.
                </p>

                {/* Direct Citation Badges */}
                <div className="pt-2 border-t border-[#E1E4D8] flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-[#697650] font-medium">Verified Sources:</span>
                  <button
                    onClick={() => onInspectCitation(PUBLIC_SAMPLE_CITATIONS.textbookRecursion)}
                    className="px-2.5 py-1 rounded-md bg-[#F8F7EF] hover:bg-[#EAEFE5] border border-[#DCE2D3] text-[#233D29] font-medium flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <BookOpen className="w-3 h-3 text-[#233D29]" />
                    <span>Textbook Ch. 4, Page 112</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>

                  <button
                    onClick={() => onInspectCitation(PUBLIC_SAMPLE_CITATIONS.lectureVideo)}
                    className="px-2.5 py-1 rounded-md bg-[#F8F7EF] hover:bg-[#EAEFE5] border border-[#DCE2D3] text-[#233D29] font-medium flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <Video className="w-3 h-3 text-[#D71935]" />
                    <span>Lecture 08 @ 14:32</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PREREQUISITE MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <p className="text-xs text-[#5D655B]">
                CourseCompass automatically constructs prerequisite dependency graphs from your syllabi, textbooks, and lecture transcripts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#DCE5CE] bg-white">
                  <span className="text-[10px] text-emerald-800 uppercase font-semibold">Foundational</span>
                  <h4 className="font-semibold text-sm text-[#17241B] mt-1">Call Stack Mechanics</h4>
                  <div className="mt-2 text-[11px] text-emerald-700 font-mono-code flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>64% Mastered</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50">
                  <span className="text-[10px] text-amber-800 uppercase font-semibold">Weak Concept</span>
                  <h4 className="font-semibold text-sm text-[#17241B] mt-1">Recursion Base Cases</h4>
                  <div className="mt-2 text-[11px] text-amber-700 font-mono-code">
                    <span>44% Mastery · Needs Drill</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E1E4D8] bg-white">
                  <span className="text-[10px] text-[#777E70] uppercase font-semibold">Downstream</span>
                  <h4 className="font-semibold text-sm text-[#17241B] mt-1">DFS Traversal Stack</h4>
                  <div className="mt-2 text-[11px] text-[#5D655B] font-mono-code">
                    <span>Blocked until Base Cases ≥ 70%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE] text-[11px] text-[#233D29]">
                <strong>Diagnostic Insight:</strong> Strengthening base condition halting rules will unblock your preparation for Graph Cycle Detection.
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider">
                  Adaptive Recall Question
                </span>
                <p className="font-semibold text-sm text-[#17241B]">
                  Why does a recursive tree traversal without an explicit base case cause memory exhaustion?
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 0, text: 'Operating systems prohibit tree data structures in user memory.', correct: false },
                  { id: 1, text: 'Each recursive call allocates a stack frame; without a halting condition, stack limits are exceeded.', correct: true },
                  { id: 2, text: 'The garbage collector halts CPU execution whenever recursion depth exceeds 3.', correct: false }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!isQuizSubmitted) setQuizAnswer(opt.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isQuizSubmitted
                        ? opt.correct
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                          : quizAnswer === opt.id
                          ? 'bg-rose-50 border-rose-400 text-rose-900'
                          : 'bg-white text-[#777E70] opacity-50'
                        : quizAnswer === opt.id
                        ? 'bg-[#233D29]/10 border-[#233D29] text-[#17241B] font-semibold'
                        : 'bg-white border-[#E1E4D8] text-[#17241B] hover:bg-[#F8F7EF]'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {!isQuizSubmitted ? (
                <button
                  disabled={quizAnswer === null}
                  onClick={() => setIsQuizSubmitted(true)}
                  className="px-4 py-2 bg-[#233D29] disabled:bg-[#CBD5C0] text-white rounded-lg font-medium text-xs transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Correct Analysis</span>
                  </div>
                  <p>
                    Every invocation pushes an activation record on the stack. Without a termination condition, available stack space is exhausted, triggering a stack overflow.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-white border-t border-[#E1E4D8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#5D655B] text-center sm:text-left">
            Ready to study from your actual syllabus and lecture videos?
          </p>

          <button
            onClick={() => {
              onClose();
              onStartLearning();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#233D29] hover:bg-[#1A2E1F] text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Launch Full Student Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
