import React, { useState, useEffect } from 'react';
import { ConceptNode, SourceCitation } from '../../types';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface StudySprintViewProps {
  concepts: ConceptNode[];
  onInspectCitation: (cite: SourceCitation) => void;
  onFinishSprint: () => void;
}

export const StudySprintView: React.FC<StudySprintViewProps> = ({
  concepts,
  onInspectCitation,
  onFinishSprint
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>('c-base-cases');
  const [sprintDurationMinutes, setSprintDurationMinutes] = useState<number>(15);
  const [stage, setStage] = useState<'learn' | 'practice' | 'recall'>('learn');

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Quick practice answer state
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState<boolean>(false);

  if (!concepts || concepts.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E1E4D8] rounded-2xl p-10 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] text-[#263F2B] flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 text-[#263F2B]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif-display text-lg font-bold text-[#17241B]">
            No sprint concepts available
          </h3>
          <p className="text-xs text-[#5D655B] max-w-sm mx-auto leading-relaxed">
            Upload course materials to unlock focused 15-minute concept study sprints.
          </p>
        </div>
      </div>
    );
  }

  const selectedConcept =
    concepts.find((c) => c.id === selectedConceptId) || concepts[0];

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
      setIsCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(sprintDurationMinutes * 60);
    setIsCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Sprint Header */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#263F2B]" />
              <span>Focused Study Sprint</span>
            </div>
            <h2 className="text-xl font-bold font-serif-display text-[#263F2B]">
              15-Minute Retrieval Sprint
            </h2>
            <p className="text-xs text-[#5D655B]">
              A distraction-free, 3-stage sprint (Learn $\to$ Practice $\to$ Recall) calibrated to cognitive retention.
            </p>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-4 bg-[#F8F7EF] border border-[#E1E4D8] p-3 rounded-xl shrink-0">
            <span className="font-mono-code text-2xl font-bold text-[#263F2B]">
              {formatTime(secondsRemaining)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTimer}
                className="p-2 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg transition-colors"
                aria-label={isActive ? 'Pause sprint timer' : 'Start sprint timer'}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="p-2 bg-[#F1F2E6] hover:bg-[#DCE5CE] text-[#263F2B] rounded-lg transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Stages Selector */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setStage('learn')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
              stage === 'learn'
                ? 'border-[#263F2B] bg-[#F1F2E6] text-[#263F2B] font-semibold shadow-2xs'
                : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Learn (5m)</span>
          </button>
          <button
            type="button"
            onClick={() => setStage('practice')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
              stage === 'practice'
                ? 'border-[#263F2B] bg-[#F1F2E6] text-[#263F2B] font-semibold shadow-2xs'
                : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. Practice (5m)</span>
          </button>
          <button
            type="button"
            onClick={() => setStage('recall')}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
              stage === 'recall'
                ? 'border-[#263F2B] bg-[#F1F2E6] text-[#263F2B] font-semibold shadow-2xs'
                : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Recall (5m)</span>
          </button>
        </div>
      </div>

      {/* Stage Interactive Content */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* STAGE 1: LEARN */}
        {stage === 'learn' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider">
                Stage 1: Core Concept Grounding
              </span>
              <h3 className="text-lg font-semibold text-[#17241B]">
                {selectedConcept.name} ({selectedConcept.topic})
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5D655B] leading-relaxed">
              {selectedConcept.summary}
            </p>

            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] space-y-1 text-xs">
              <span className="font-semibold text-[#D71935]">Critical Exam Misconception:</span>
              <p className="text-[#5D655B] leading-relaxed">
                {selectedConcept.primaryMisconception}
              </p>
            </div>

            {selectedConcept.citations.length > 0 && (
              <div className="pt-2 border-t border-[#E1E4D8] space-y-2">
                <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block">
                  Primary Source Excerpt:
                </span>
                <blockquote className="p-3 bg-[#F8F7EF] border-l-2 border-[#263F2B] rounded-r text-xs text-[#17241B] italic">
                  "{selectedConcept.citations[0].excerpt}"
                </blockquote>
                <button
                  type="button"
                  onClick={() => onInspectCitation(selectedConcept.citations[0])}
                  className="text-xs text-[#D71935] hover:underline font-mono-code flex items-center gap-1"
                >
                  Inspect source: {selectedConcept.citations[0].locationLabel} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStage('practice')}
                className="px-5 py-2.5 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>Advance to Practice Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: PRACTICE */}
        {stage === 'practice' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider">
                Stage 2: Quick Targeted Diagnostic
              </span>
              <h3 className="text-base font-semibold text-[#17241B]">
                Which condition guarantees a recursive function halts without a stack overflow?
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { id: 0, text: 'Executing at least 10 while loop iterations before calling itself.', isCorrect: false },
                { id: 1, text: 'Having a base case reached through strict structural parameter reduction in every branch.', isCorrect: true },
                { id: 2, text: 'Allocating global heap memory instead of local stack variables.', isCorrect: false }
              ].map((opt) => {
                const isSelected = practiceAnswer === opt.id;
                let borderStyle = 'border-[#E1E4D8] bg-[#F8F7EF]';

                if (practiceSubmitted) {
                  if (opt.isCorrect) borderStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-medium';
                  else if (isSelected) borderStyle = 'border-[#D71935] bg-rose-50 text-rose-900';
                } else if (isSelected) {
                  borderStyle = 'border-[#263F2B] bg-[#F1F2E6] font-medium';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!practiceSubmitted) setPracticeAnswer(opt.id);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${borderStyle}`}
                  >
                    {opt.text}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {!practiceSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    if (practiceAnswer !== null) setPracticeSubmitted(true);
                  }}
                  disabled={practiceAnswer === null}
                  className="px-4 py-2 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStage('recall')}
                  className="px-5 py-2.5 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <span>Advance to Recall Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 3: RECALL */}
        {stage === 'recall' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider">
                Stage 3: Active Recall Flashcard
              </span>
              <h3 className="text-base font-semibold text-[#17241B]">
                Prompt: What two components are mandatory in every recursion base case?
              </h3>
            </div>

            <div className="p-5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2 text-xs">
              <span className="font-semibold text-[#263F2B]">Self-Check Answer:</span>
              <p className="text-[#17241B] leading-relaxed">
                1. A non-recursive halting condition that returns immediately without additional invocations.<br />
                2. A return value representing the proper algebraic identity element (e.g. 0 for sums, true for vacuous validity).
              </p>
            </div>

            <div className="pt-4 border-t border-[#E1E4D8] flex items-center justify-between">
              <span className="text-xs text-[#5D655B]">Sprint complete!</span>
              <button
                type="button"
                onClick={onFinishSprint}
                className="px-5 py-2.5 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>Record 15m Sprint Progress</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
