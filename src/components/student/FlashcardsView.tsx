import React, { useState } from 'react';
import { Flashcard, SourceCitation } from '../../types';
import {
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface FlashcardsViewProps {
  cards: Flashcard[];
  onInspectCitationByAnchor: (anchor: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  onInspectCitationByAnchor
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'summaries'>('cards');

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E1E4D8] rounded-2xl p-10 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] text-[#263F2B] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6 text-[#263F2B]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif-display text-lg font-bold text-[#17241B]">
            No flashcards generated yet
          </h3>
          <p className="text-xs text-[#5D655B] max-w-sm mx-auto leading-relaxed">
            Flashcards and revision summaries will be generated once your course materials are uploaded and indexed.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const summaries = [
    {
      title: 'Call Stack Activation Records & Frame Memory',
      topic: 'Memory Architecture',
      anchor: 'Lecture 08, 14:32',
      takeaways: [
        'Every recursive invocation pushes a distinct activation frame onto the hardware call stack.',
        'Frames allocate local parameters, return instruction pointers, and intermediate values.',
        'Peak memory footprint is determined by tree height (depth) O(depth), not total recursive calls.'
      ]
    },
    {
      title: 'Recursion Base Case Halting & Identity Elements',
      topic: 'Recursion Foundations',
      anchor: 'Textbook Ch. 4, p. 112',
      takeaways: [
        'A base case is a non-recursive terminal state that halts invocation growth.',
        'Recursive arguments must make monotonic progress toward the base case (e.g., n - 1 or subarray slicing).',
        'Return values for aggregation must equal the algebraic identity element (0 for summation, 1 for product, true for empty conjunction).'
      ]
    },
    {
      title: 'Depth-First Search (DFS) Three-Color Cycle Invariant',
      topic: 'Graph Algorithms',
      anchor: 'Slide Deck 12, Slide 19',
      takeaways: [
        'Vertices exist in 3 states: White (unvisited), Gray (currently exploring on call stack), Black (finished).',
        'A directed cycle exists if and only if a DFS traversal discovers a back-edge to an active Gray vertex.',
        'An edge to a Black vertex is a cross-edge or forward-edge, not a cyclic back-edge.'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Toggle */}
      <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#263F2B]" />
            <span>Spaced Retrieval & Synthesis</span>
          </div>
          <h2 className="text-xl font-bold font-serif-display text-[#263F2B]">
            Revision Decks & Concept Summaries
          </h2>
          <p className="text-xs text-[#5D655B]">
            Active recall flashcards paired with structured executive summaries from CS 204.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'cards'
                ? 'bg-white text-[#263F2B] shadow-xs font-semibold'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Flashcards ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'summaries'
                ? 'bg-white text-[#263F2B] shadow-xs font-semibold'
                : 'text-[#5D655B] hover:text-[#17241B]'
            }`}
          >
            Targeted Summaries (3)
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Progress */}
          <div className="flex items-center justify-between text-xs text-[#5D655B]">
            <span className="font-medium text-[#263F2B]">{currentCard.topic}</span>
            <span className="font-mono-code text-[#17241B]">
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          {/* Flashcard Frame (Flip Interaction) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[300px] bg-white border border-[#E1E4D8] hover:border-[#A8B594] rounded-2xl p-8 shadow-xs cursor-pointer flex flex-col justify-between transition-all select-none"
          >
            <div className="flex items-center justify-between text-xs text-[#697650] pb-3 border-b border-[#E1E4D8]">
              <span className="font-semibold text-[#263F2B]">{currentCard.conceptName}</span>
              <span className="font-mono-code text-[11px] bg-[#F1F2E6] px-2 py-0.5 rounded text-[#263F2B]">
                {isFlipped ? 'Answer View' : 'Prompt View (Click to Flip)'}
              </span>
            </div>

            <div className="my-auto py-6 text-center space-y-4">
              {!isFlipped ? (
                <p className="text-base sm:text-lg font-medium text-[#17241B] leading-relaxed max-w-lg mx-auto">
                  {currentCard.front}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-[#17241B] whitespace-pre-line leading-relaxed max-w-lg mx-auto font-sans-body">
                    {currentCard.back}
                  </p>
                  <div className="pt-2 text-xs text-[#697650] font-mono-code">
                    Source Anchor: {currentCard.sourceAnchor}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E1E4D8] flex items-center justify-between text-[11px] text-[#777E70]">
              <span>Stage: {currentCard.repetitionStage}</span>
              <span className="flex items-center gap-1 text-[#263F2B] font-medium">
                <RotateCcw className="w-3 h-3" /> Click anywhere to flip
              </span>
            </div>
          </div>

          {/* Spaced repetition rating controls */}
          {isFlipped && (
            <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider block text-center">
                Self-Rate Recall Confidence:
              </span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  onClick={handleNext}
                  className="py-2 rounded-lg bg-white hover:bg-rose-50 text-[#D71935] border border-[#E1E4D8] font-medium transition-colors"
                >
                  Again (1d)
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-[#E1E4D8] font-medium transition-colors"
                >
                  Hard (2d)
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-[#E1E4D8] font-medium transition-colors"
                >
                  Good (4d)
                </button>
                <button
                  onClick={handleNext}
                  className="py-2 rounded-lg bg-white hover:bg-[#DCE5CE] text-[#263F2B] border border-[#E1E4D8] font-medium transition-colors"
                >
                  Easy (7d)
                </button>
              </div>
            </div>
          )}

          {/* Card Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="px-4 py-2 text-xs font-medium text-[#263F2B] bg-white hover:bg-[#F1F2E6] border border-[#E1E4D8] rounded-lg transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs font-medium text-[#263F2B] bg-white hover:bg-[#F1F2E6] border border-[#E1E4D8] rounded-lg transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Targeted Summaries */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaries.map((s, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#697650]">
                  <span className="font-semibold text-[#263F2B]">{s.topic}</span>
                  <span className="font-mono-code text-[11px]">{s.anchor}</span>
                </div>
                <h3 className="font-serif-display text-base font-bold text-[#17241B]">
                  {s.title}
                </h3>
                <ul className="space-y-2 text-xs text-[#5D655B] leading-relaxed list-disc pl-4">
                  {s.takeaways.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E1E4D8] text-[11px] text-[#697650]">
                Synthesized directly from course readings & lectures.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
