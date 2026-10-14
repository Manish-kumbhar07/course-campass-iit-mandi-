import React, { useState } from 'react';
import {
  X,
  FileText,
  Video,
  Presentation,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Play,
  Pause,
  BookOpen,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';
import { SourceCitation } from '../../types';

interface SourceCitationModalProps {
  citation: SourceCitation | null;
  onClose: () => void;
  onAskAboutCitation?: (citation: SourceCitation) => void;
}

export const SourceCitationModal: React.FC<SourceCitationModalProps> = ({
  citation,
  onClose,
  onAskAboutCitation
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${citation.excerpt}" — ${citation.sourceTitle} (${citation.locationLabel})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white border border-[#E1E4D8] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F7EF] border-b border-[#E1E4D8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#DCE5CE] flex items-center justify-center text-[#263F2B]">
              {citation.sourceType === 'video' && <Video className="w-5 h-5" />}
              {citation.sourceType === 'pdf' && <FileText className="w-5 h-5" />}
              {citation.sourceType === 'slides' && <Presentation className="w-5 h-5" />}
              {citation.sourceType === 'audio' && <Headphones className="w-5 h-5" />}
              {citation.sourceType === 'notes' && <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#697650]">
                <span className="capitalize">{citation.sourceType} Source</span>
                <span>·</span>
                <span className="font-mono-code font-semibold text-[#263F2B]">{citation.locationLabel}</span>
              </div>
              <h3 className="text-base font-semibold text-[#17241B] truncate max-w-md">
                {citation.sourceTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5D655B] hover:text-[#17241B] hover:bg-[#E1E4D8]/60 rounded-md transition-colors"
            aria-label="Close citation inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Container */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Visual Source Canvas */}
          <div className="rounded-lg border border-[#E1E4D8] bg-[#F1F2E6]/60 p-4">
            {citation.sourceType === 'video' && (
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-md bg-[#17241B] overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                  {/* Video Stage Simulation */}
                  <div className="flex justify-between items-start text-xs text-[#F8F7EF]/80">
                    <span className="bg-black/60 px-2 py-0.5 rounded text-[11px] font-mono-code">
                      REC 1080p · CS 204
                    </span>
                    <span className="bg-[#D71935] text-white px-2 py-0.5 rounded text-[11px] font-medium">
                      Exact Timestamp
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <div className="inline-block p-4 rounded-lg bg-black/40 border border-white/10 max-w-md">
                      <p className="text-xs text-emerald-300 font-mono-code mb-1">
                        Whiteboard Section 3.2: Stack Frame Unwinding
                      </p>
                      <p className="text-sm text-white font-medium italic">
                        "Notice where students make the mistake in base case termination..."
                      </p>
                    </div>
                  </div>

                  {/* Player Scrubber Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-white/80">
                      <span>14:32</span>
                      <span>48:20</span>
                    </div>
                    <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-[#DCE5CE] w-[30%]"></div>
                      <div className="absolute left-[30%] top-0 bottom-0 w-2 bg-[#D71935] rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded text-white hover:text-[#DCE5CE] transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <span className="text-[11px] text-white/70">
                        {isPlaying ? 'Playing excerpt segment' : 'Paused at reference anchor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {citation.sourceType === 'pdf' && (
              <div className="space-y-3">
                <div className="bg-white border border-[#E1E4D8] rounded-md p-5 shadow-xs font-serif-display text-sm leading-relaxed text-[#17241B]">
                  <div className="flex justify-between items-center text-xs font-sans-body text-[#777E70] pb-2 border-b border-[#E1E4D8] mb-3">
                    <span>CHAPTER 4 · RECURSION & INDUCTION</span>
                    <span className="font-mono-code font-semibold">PAGE {citation.pageNumber || 112}</span>
                  </div>
                  <p className="text-xs text-[#5D655B] mb-2 font-sans-body">
                    Section 4.2.1: The Halting Principle in Recursive Proving
                  </p>
                  <div className="bg-[#FAF8D8] border-l-2 border-[#D97706] p-3 rounded-r my-2 text-sm text-[#17241B]">
                    "{citation.excerpt}"
                  </div>
                  <p className="text-xs text-[#777E70] mt-2 font-sans-body">
                    Figure 4.3 below depicts the sequential push and pop lifecycle across memory address boundaries during function unwinding.
                  </p>
                </div>
              </div>
            )}

            {citation.sourceType === 'slides' && (
              <div className="space-y-3">
                <div className="aspect-[16/10] bg-[#263F2B] text-white rounded-md p-5 flex flex-col justify-between shadow-md">
                  <div className="flex justify-between items-center text-xs text-[#DCE5CE]/80 border-b border-white/10 pb-2">
                    <span className="font-serif-display text-sm">CS 204: Graph Algorithms</span>
                    <span className="font-mono-code">SLIDE {citation.slideNumber || 19} / 38</span>
                  </div>
                  <div className="my-auto space-y-3">
                    <h4 className="text-lg font-semibold text-white">Invariant 3: Three-Color DFS Cycles</h4>
                    <div className="p-3 bg-black/30 rounded border border-white/10 text-xs leading-relaxed text-[#F8F7EF]">
                      <p className="font-semibold text-emerald-300 mb-1">State Definitions:</p>
                      <p>• White: Vertex unvisited in traversal tree</p>
                      <p>• Gray: Vertex actively pushed on recursion stack</p>
                      <p>• Black: Subtree completely processed and popped</p>
                      <p className="mt-2 text-amber-200">
                        Rule: An edge to a Gray vertex marks a true back-edge & directed cycle.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#A8B594]">
                    Instructor: Prof. Henderson · Department of Computer Science
                  </div>
                </div>
              </div>
            )}

            {citation.sourceType === 'audio' && (
              <div className="space-y-3">
                <div className="bg-white border border-[#E1E4D8] rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#697650]">
                    <span className="font-medium">Audio Recording Clip</span>
                    <span className="font-mono-code">{citation.locationLabel}</span>
                  </div>
                  {/* Waveform visual simulation */}
                  <div className="flex items-center gap-1 h-8 px-2 py-1 bg-[#F8F7EF] rounded">
                    {[12, 28, 16, 24, 32, 18, 10, 22, 28, 30, 14, 20, 26, 32, 18, 12, 8, 22, 16, 28, 24, 18, 10, 14].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${i < 10 ? 'bg-[#263F2B]' : 'bg-[#DCE5CE]'}`}
                        style={{ height: `${h}px` }}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-[#17241B] italic bg-[#F1F2E6] p-3 rounded">
                    "{citation.excerpt}"
                  </p>
                </div>
              </div>
            )}

            {citation.sourceType === 'notes' && (
              <div className="space-y-3">
                <div className="bg-[#FFFDF7] border border-[#E1E4D8] rounded-md p-4 font-mono-code text-xs text-[#17241B] shadow-inner space-y-2">
                  <div className="text-[#697650] pb-1 border-b border-[#E1E4D8] flex justify-between">
                    <span>LAB 3 · CALL STACK MEMORY TRACE</span>
                    <span>HANDOUT P. 3</span>
                  </div>
                  <pre className="text-[11px] text-[#263F2B] overflow-x-auto bg-[#F8F7EF] p-2 rounded">
{`// Trace execution for f(n = 4)
push f(4) -> calls f(3), f(2)
  push f(3) -> calls f(2), f(1)
    push f(2) -> calls f(1), f(0) [Base cases reach halts]
Peak stack height = 4 frames -> O(n) auxiliary space`}
                  </pre>
                  <p className="text-xs font-sans-body text-[#5D655B]">{citation.excerpt}</p>
                </div>
              </div>
            )}
          </div>

          {/* Excerpt Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              Exact Excerpt Grounding
            </h4>
            <blockquote className="p-3 bg-[#F8F7EF] border-l-2 border-[#263F2B] rounded-r text-sm text-[#17241B] leading-relaxed">
              "{citation.excerpt}"
            </blockquote>
          </div>

          {/* Context Snippet */}
          <div className="text-xs text-[#5D655B] leading-normal bg-white p-3 border border-[#E1E4D8] rounded-md flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#263F2B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#17241B]">Academic Verification: </span>
              {citation.contextSnippet}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F7EF] border-t border-[#E1E4D8] gap-3">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-medium text-[#263F2B] hover:bg-[#E1E4D8] rounded-md transition-colors flex items-center gap-1.5"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard' : 'Copy Citation Anchor'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onAskAboutCitation && (
              <button
                onClick={() => {
                  onAskAboutCitation(citation);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#D71935] hover:bg-[#b0142b] rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Ask AI Tutor About This</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-[#5D655B] hover:text-[#17241B] hover:bg-[#E1E4D8] rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
