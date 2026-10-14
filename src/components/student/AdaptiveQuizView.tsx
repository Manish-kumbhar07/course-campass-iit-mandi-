import React, { useState } from 'react';
import { QuizQuestion, SourceCitation, StudentTab } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface AdaptiveQuizViewProps {
  questions: QuizQuestion[];
  onCompleteQuiz: (scorePercent: number) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onNavigateStudent: (tab: StudentTab) => void;
}

export const AdaptiveQuizView: React.FC<AdaptiveQuizViewProps> = ({
  questions,
  onCompleteQuiz,
  onInspectCitation,
  onNavigateStudent
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E1E4D8] rounded-2xl p-10 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] text-[#263F2B] flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6 text-[#263F2B]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif-display text-lg font-bold text-[#17241B]">
            No quiz questions available yet
          </h3>
          <p className="text-xs text-[#5D655B] max-w-sm mx-auto leading-relaxed">
            Upload course materials or lecture notes first so the system can extract concepts and generate verified adaptive quiz questions.
          </p>
        </div>
        <button
          onClick={() => onNavigateStudent('materials')}
          className="px-4 py-2 bg-[#263F2B] text-white text-xs font-semibold rounded-lg hover:bg-[#1f3323] transition-colors"
        >
          Upload Course Materials
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (submitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || submitted) return;
    setSubmitted(true);

    const chosenOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setSubmitted(false);
    } else {
      setIsFinished(true);
      const totalScorePercent = Math.round(((scoreCount + (currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect ? 0 : 0)) / questions.length) * 100);
      onCompleteQuiz(totalScorePercent);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setSubmitted(false);
    setScoreCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const finalScore = Math.round((scoreCount / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-white border border-[#E1E4D8] rounded-xl p-8 shadow-2xs space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
            Diagnostic Run Complete
          </span>
          <h2 className="text-2xl font-bold font-serif-display text-[#263F2B]">
            Adaptive Diagnostic Assessment Finished
          </h2>
          <p className="text-sm text-[#5D655B] max-w-md mx-auto">
            You scored <strong className="text-[#17241B]">{scoreCount} of {questions.length}</strong> ({finalScore}%). Your concept mastery profile for Recursion Base Cases and DFS Traversal has been updated.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] text-xs space-y-2 max-w-md mx-auto text-left">
          <div className="flex justify-between items-center font-medium">
            <span>Recursion Base Cases</span>
            <span className="text-emerald-700 font-mono-code font-bold">+12% Mastery Gain</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>DFS Traversal Call Stack</span>
            <span className="text-emerald-700 font-mono-code font-bold">+8% Mastery Gain</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="px-4 py-2.5 text-xs font-medium text-[#263F2B] bg-[#F1F2E6] hover:bg-[#DCE5CE] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Diagnostic</span>
          </button>
          <button
            onClick={() => onNavigateStudent('overview')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#D71935] hover:bg-[#b0142b] rounded-lg transition-colors shadow-xs"
          >
            Return to Study Plan
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Quiz Header & Progress */}
      <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs text-[#5D655B]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#263F2B]">Targeted Diagnostic</span>
            <span>·</span>
            <span className="text-[#697650]">{currentQuestion.conceptName}</span>
          </div>
          <span className="font-mono-code text-[#17241B]">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#F1F2E6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#263F2B] rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#17241B] leading-snug">
            {currentQuestion.prompt}
          </h3>

          {/* Optional Code Snippet */}
          {currentQuestion.codeSnippet && (
            <div className="rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] p-4 font-mono-code text-xs text-[#263F2B] overflow-x-auto shadow-inner">
              <pre>{currentQuestion.codeSnippet}</pre>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let containerStyle =
              'border-[#E1E4D8] bg-[#F8F7EF]/40 hover:bg-[#F8F7EF] hover:border-[#A8B594] text-[#17241B]';

            if (submitted) {
              if (opt.isCorrect) {
                containerStyle = 'border-emerald-600 bg-emerald-50 text-[#17241B] ring-1 ring-emerald-600';
              } else if (isSelected && !opt.isCorrect) {
                containerStyle = 'border-[#D71935] bg-[#FFF8F8] text-[#17241B] ring-1 ring-[#D71935]';
              } else {
                containerStyle = 'border-[#E1E4D8] bg-white opacity-60 text-[#777E70]';
              }
            } else if (isSelected) {
              containerStyle = 'border-[#263F2B] bg-[#F1F2E6] ring-1 ring-[#263F2B] font-medium';
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-3 ${containerStyle}`}
              >
                <div className="mt-0.5 shrink-0">
                  {submitted ? (
                    opt.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4 text-[#D71935]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#A8B594]"></div>
                    )
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full border transition-all ${
                        isSelected ? 'border-[#263F2B] bg-[#263F2B]' : 'border-[#A8B594]'
                      }`}
                    ></div>
                  )}
                </div>
                <div className="space-y-1">
                  <p>{opt.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Feedback (Shown after submit) */}
        {submitted && selectedOption && (
          <div className="p-5 rounded-xl border space-y-3 bg-[#F8F7EF] border-[#E1E4D8] animate-in fade-in duration-200">
            {selectedOption.isCorrect ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Correct! Foundational principle verified.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D71935]">
                <AlertTriangle className="w-4 h-4 text-[#D71935]" />
                <span>Misconception Detected in Selected Option:</span>
              </div>
            )}

            {!selectedOption.isCorrect && selectedOption.misconceptionExplanation && (
              <div className="p-3 bg-[#FFF8F8] border border-[#F8E2E3] rounded-lg text-xs text-[#5D655B] leading-relaxed">
                <strong className="text-[#D71935]">Why this answer is a common trap: </strong>
                {selectedOption.misconceptionExplanation}
              </div>
            )}

            <div className="text-xs text-[#17241B] leading-relaxed">
              <strong className="text-[#263F2B]">Pedagogical Rationale: </strong>
              {currentQuestion.explanation}
            </div>

            {/* Citation Link */}
            <div className="pt-2 border-t border-[#E1E4D8] flex items-center justify-between text-xs">
              <span className="text-[#697650] text-[11px]">Primary Source Grounding:</span>
              <button
                onClick={() => onInspectCitation(currentQuestion.citation)}
                className="text-[#D71935] hover:underline font-mono-code text-[11px] font-medium flex items-center gap-1"
              >
                <span>{currentQuestion.citation.sourceTitle} ({currentQuestion.citation.locationLabel})</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E1E4D8]">
          <div className="text-xs text-[#5D655B]">
            {submitted ? 'Review explanation before proceeding' : 'Select an option to evaluate'}
          </div>

          <div>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOptionId}
                className="px-5 py-2.5 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#263F2B] hover:bg-[#1b2d1f] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
