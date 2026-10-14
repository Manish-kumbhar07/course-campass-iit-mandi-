import React from 'react';
import { PublicTab, SourceCitation } from '../../types';
import {
  Compass,
  ArrowRight,
  Video,
  FileText,
  Presentation,
  Headphones,
  CheckCircle2,
  Network,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  Search,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  onEnterStudentApp: () => void;
  onInspectCitation: (citation: SourceCitation) => void;
  activeTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudentApp,
  onInspectCitation,
  activeTab,
  onSelectTab
}) => {
  const sampleCitation: SourceCitation = {
    id: 'hero-demo-cite',
    sourceType: 'video',
    sourceTitle: 'Lecture 08: Recursive Call Stack Mechanics',
    locationLabel: 'Timestamp 14:32',
    timestampSeconds: 872,
    excerpt: 'Each recursive call allocates a new activation record on the call stack until base condition halts recursion.',
    contextSnippet: 'Demonstrated on chalkboard with activation records in memory layout.'
  };

  return (
    <div className="min-h-screen bg-[#F8F7EF] text-[#17241B]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-[#E1E4D8]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold text-[#697650] tracking-wide uppercase flex items-center gap-2">
                <span>Academic Learning Architecture</span>
                <span>·</span>
                <span className="text-[#263F2B] font-mono-code">Fictional Demo Environment</span>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#263F2B] leading-[1.12] text-balance">
                Turn scattered study material into your clearest path forward.
              </h1>

              <p className="text-base sm:text-lg text-[#5D655B] max-w-2xl leading-relaxed">
                College courses scatter knowledge across 50-minute lecture videos, 400-page textbooks, slide decks, and lab handouts. CourseCompass synthesizes them into an interactive prerequisite knowledge map with source-grounded AI tutoring and adaptive quizzes.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onEnterStudentApp}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#D71935] hover:bg-[#b0142b] rounded-lg transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Launch Demo Student App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTab('how-it-works')}
                  className="px-5 py-3.5 text-sm font-medium text-[#263F2B] bg-[#F1F2E6] hover:bg-[#DCE5CE] border border-[#E1E4D8] rounded-lg transition-colors"
                >
                  Explore How It Works
                </button>
              </div>

              {/* Student Context Note */}
              <div className="pt-4 border-t border-[#E1E4D8]/80 text-xs text-[#5D655B] flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Demo Profile: <strong className="text-[#17241B]">Ananya Sharma</strong> (2nd-Year CS)</span>
                <span>·</span>
                <span>Course: <strong className="text-[#17241B]">Data Structures</strong></span>
                <span>·</span>
                <span>Target: <strong className="text-[#17241B]">Exam in 12 Days</strong></span>
              </div>
            </div>

            {/* Right Column: Grounded Ingestion & Citation Visual Stage */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8] text-xs">
                  <span className="font-serif-display font-bold text-[#263F2B] text-sm">
                    Multi-Source Ingestion Engine
                  </span>
                  <span className="text-[#697650] font-mono-code">5 Sources Linked</span>
                </div>

                {/* Sample Ingested Cards */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#17241B]">Lecture 08 Video</p>
                        <p className="text-[#5D655B] text-[11px]">48m 20s · 3 Concepts Extracted</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onInspectCitation(sampleCitation)}
                      className="text-[#D71935] hover:underline font-medium text-[11px] flex items-center gap-1"
                    >
                      Inspect 14:32 <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#17241B]">Textbook Ch. 4 PDF</p>
                        <p className="text-[#5D655B] text-[11px]">34 Pages · Halting Principles</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-mono-code text-[11px]">Indexed</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                        <Presentation className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#17241B]">Lecture 12 Slides</p>
                        <p className="text-[#5D655B] text-[11px]">38 Slides · Three-Color DFS</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-mono-code text-[11px]">Indexed</span>
                  </div>
                </div>

                {/* Grounded Citation Preview Box */}
                <div className="p-3.5 rounded-lg bg-[#F1F2E6] border border-[#A8B594]/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#697650] font-medium">
                    <span>Source-Grounded Citation Anchor</span>
                    <span className="font-mono-code text-[#263F2B]">Lecture 08 @ 14:32</span>
                  </div>
                  <p className="text-xs text-[#17241B] italic leading-relaxed">
                    "Every recursive call allocates an activation record on the stack until a base condition halts execution."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-b border-[#E1E4D8]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              The Four-Stage Methodology
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#263F2B]">
              How CourseCompass structures university learning
            </h2>
            <p className="text-sm sm:text-base text-[#5D655B] leading-relaxed">
              Instead of treating an AI model as an unchecked textbook substitute, CourseCompass transforms your professor’s actual materials into an audited, prerequisite-driven study pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-3 shadow-2xs">
              <span className="font-mono-code text-sm font-bold text-[#697650]">01.</span>
              <h3 className="text-base font-semibold text-[#17241B]">Multi-Modal Ingestion</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Upload lecture video recordings, textbook PDFs, slide decks, audio office hours, and handwritten lab notes. Each source is timestamped and indexed.
              </p>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-3 shadow-2xs">
              <span className="font-mono-code text-sm font-bold text-[#697650]">02.</span>
              <h3 className="text-base font-semibold text-[#17241B]">Prerequisite Graphing</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Concepts are not stored as isolated flashcards. CourseCompass maps which topics depend on foundational prerequisites (e.g., Call Stack before DFS).
              </p>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-3 shadow-2xs">
              <span className="font-mono-code text-sm font-bold text-[#697650]">03.</span>
              <h3 className="text-base font-semibold text-[#17241B]">Grounded Socratic Tutor</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Ask questions anytime. Every response cites exact page numbers, slide slides, or lecture video seconds so you can verify the claim directly in original courseware.
              </p>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-3 shadow-2xs">
              <span className="font-mono-code text-sm font-bold text-[#697650]">04.</span>
              <h3 className="text-base font-semibold text-[#17241B]">Adaptive Diagnostic Quizzes</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Take targeted questions tailored to your identified weak concepts. Incorrect choices explain the specific mental misconception with reference citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogy & Key Features */}
      <section id="features" className="py-20 bg-[#F1F2E6]/50 border-b border-[#E1E4D8]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              System Architecture
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#263F2B]">
              Engineered for rigorous academic comprehension
            </h2>
            <p className="text-sm sm:text-base text-[#5D655B] leading-relaxed">
              Designed around research-backed cognitive principles: retrieval practice, diagnostic feedback, and prerequisite hierarchy mapping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#17241B]">Knowledge Map & Dependency Graph</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                See at a glance why you might struggle with Graph Cycles: the prerequisite node (Recursion Base Cases) is below 50% mastery. Never study an advanced algorithm in the dark.
              </p>
              <div className="text-xs text-[#263F2B] font-medium pt-2">
                Prerequisite integrity checks · Mastery scoring · Visual dependency tree
              </div>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#17241B]">Personalized 45-Min Daily Study Plan</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Built specifically around student Ananya's constraint: 45 focused minutes each day leading to her examination on October 25. The planner allocates reading, quiz drills, and flashcard review.
              </p>
              <div className="text-xs text-[#263F2B] font-medium pt-2">
                Adaptive pacing · Exam countdown calendar · Prioritized repair tasks
              </div>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#17241B]">Misconception Diagnostics</h3>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                When you select a distractor in an adaptive quiz, CourseCompass does not just say "Incorrect." It diagnoses the specific theoretical confusion—such as confusing an activation record with a heap allocation.
              </p>
              <div className="text-xs text-[#263F2B] font-medium pt-2">
                Cited wrong-option rationale · Instant remedial flashcard creation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Academic Trust */}
      <section id="security" className="py-20 border-b border-[#E1E4D8]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E1E4D8] rounded-2xl p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#263F2B]" /> Academic Trust & Privacy
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#263F2B]">
                Your university courseware remains your own.
              </h2>
              <p className="text-sm sm:text-base text-[#5D655B] leading-relaxed">
                Academic materials, professor lecture recordings, and student notes carry intellectual property and privacy implications. CourseCompass is designed with strict boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#17241B]">Zero Public Training</h4>
                <p className="text-xs text-[#5D655B] leading-relaxed">
                  Your uploaded syllabi, slides, and exam prep recordings are never used to train global or public foundation models.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#17241B]">FERPA Mindset</h4>
                <p className="text-xs text-[#5D655B] leading-relaxed">
                  Student learning records, diagnostic quiz histories, and mastery metrics are private to the enrolled student profile.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#17241B]">Audited Grounding</h4>
                <p className="text-xs text-[#5D655B] leading-relaxed">
                  Every factual assertion links to a concrete timestamp or page in your instructor's provided material to prevent hallucinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F8F7EF]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif-display text-3xl font-bold text-[#263F2B]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-semibold text-[#17241B]">
                What formats can I upload into a course?
              </h4>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                CourseCompass ingests MP4/WebM lecture recordings, PDF textbooks and readings, PowerPoint/Keynote slides, audio tracks (such as office hours recordings), and handwritten lab notes.
              </p>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-semibold text-[#17241B]">
                How does the citation link directly to a video timestamp?
              </h4>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                During indexing, audio transcription and visual slide recognition align speech with slide transitions. When the AI tutor references a theorem or demonstration, it generates an anchor linking directly to that exact second in the lecture recording.
              </p>
            </div>

            <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-semibold text-[#17241B]">
                Who is the demo student in this environment?
              </h4>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Ananya Sharma, a second-year undergraduate preparing for her Data Structures (CS 204) examination. Her active difficulties—Recursion base cases and graph traversal prerequisites—are already preloaded so you can test all features immediately.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8">
            <button
              onClick={onEnterStudentApp}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-[#D71935] hover:bg-[#b0142b] rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <span>Enter Student Workspace as Ananya Sharma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#E1E4D8] bg-[#F1F2E6]/40 text-xs text-[#5D655B]">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#263F2B] font-serif-display font-semibold">
            <Compass className="w-4 h-4" /> CourseCompass
          </div>
          <div>
            Turn scattered study material into your clearest path forward.
          </div>
          <div className="text-[#777E70]">
            Fictional academic demo · Data Structures CS 204
          </div>
        </div>
      </footer>
    </div>
  );
};
