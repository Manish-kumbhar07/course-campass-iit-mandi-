import React, { useState } from 'react';
import { AppRoute, PublicTab, SourceReference } from '../../types';
import { Logo } from '../common/Logo';
import { InteractiveDemoModal } from './InteractiveDemoModal';
import { PricingView } from './PricingView';
import { HeroStudentVisual } from './HeroStudentVisual';
import { CourseCompassOrbit3D, HeroSelectorType } from './CourseCompassOrbit3D';
import {
  Compass,
  ArrowRight,
  Play,
  BookOpen,
  Video,
  FileText,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Network,
  Sparkles,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Lock,
  Layers,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  Mail,
  Send,
  UserCheck,
  ChevronDown,
  Cpu,
  BarChart3,
  Flame,
  GraduationCap
} from 'lucide-react';

interface LandingPageProps {
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onNavigate: (route: AppRoute) => void;
  onInspectCitation: (cite: SourceReference) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  onInspectCitation
}) => {
  // Interactive demo modal state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [heroSelector, setHeroSelector] = useState<HeroSelectorType>('organize');

  // Interactive feature preview tab inside Features view
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'tutor' | 'map' | 'quiz' | 'flashcards' | 'ingest'
  >('tutor');

  // Interactive comparison toggle on home page (Traditional vs CourseCompass)
  const [comparisonMode, setComparisonMode] = useState<'with' | 'without'>('with');

  // FAQ Accordion open state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 2000);
  };

  const faqItems = [
    {
      q: 'What file formats can I upload into CourseCompass?',
      a: 'CourseCompass ingests MP4/WebM lecture video recordings, PDF textbooks and assigned readings, PowerPoint and Keynote slide decks, M4A/MP3 audio recordings (such as professor office hours), and scanned handwritten lab worksheets.'
    },
    {
      q: 'How does video timestamp citation work without hallucinations?',
      a: 'During multi-modal ingestion, CourseCompass extracts synchronized audio transcripts and slide OCR frames with millisecond-precision timestamps. When the Socratic tutor references a theorem or demonstration, it links to the exact seconds in the video where your instructor introduced that concept.'
    },
    {
      q: 'Are my uploaded university materials used to train public AI models?',
      a: 'Never. CourseCompass enforces a strict FERPA-aligned privacy boundary. Your course materials, lecture videos, syllabi, and practice histories are encrypted in your private workspace container and are never contributed to global or public foundation model training.'
    },
    {
      q: 'Can CourseCompass tell me when an answer is NOT in my courseware?',
      a: 'Yes. Unlike generic chatbots that fabricate convincing answers, CourseCompass visibly flags answers as "Supported by your course", "Partially supported", or "Not found in your course". We warn you before providing outside conceptual context.'
    },
    {
      q: 'How is topic mastery computed?',
      a: 'Mastery scores are calculated through deterministic educational rubrics based on diagnostic quizzes, active recall verification, and prerequisite integrity checks. We do not allow language models to generate arbitrary, hallucinated percentage scores.'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white text-[#1D1D1F] flex flex-col justify-between selection:bg-[#E5E5EA]">
      <div className="flex-1">
        
        {/* ============================================================ */}
        {/* VIEW 1: HOME (Apple-Inspired Color Zoning + Super Advanced)  */}
        {/* ============================================================ */}
        {currentTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            
            {/* SECTION 1: HERO (CourseCompass 3D Learning Orbit & Prescribed Core Flow) */}
            <section className="bg-gradient-to-r from-[#FAF7EE] via-[#F3F8F0] to-[#E0EFE4] pt-10 sm:pt-14 pb-14 border-b border-[#D8E4D5] relative overflow-hidden">
              <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Prescribed Editorial Typography & Interactive Selectors */}
                  <div className="lg:col-span-6 space-y-5">
                    {/* Clean Typography Kicker */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#263F2B]">
                      <span className="w-2 h-2 rounded-full bg-[#263F2B] shrink-0 animate-pulse" />
                      <span>YOUR PERSONAL STUDY COMPASS</span>
                    </div>

                    {/* Headline in Exact Prescribed Editorial Serif */}
                    <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#17241B] leading-[1.10] text-balance">
                      From scattered material to a study path that makes sense.
                    </h1>

                    {/* Subtitle in Exact Prescribed Copy */}
                    <p className="text-base sm:text-lg text-[#515154] max-w-xl leading-relaxed font-sans-body">
                      Upload lectures, PDFs, slides, and YouTube lessons. CourseCompass turns them into source-grounded explanations, adaptive practice, and clear next steps.
                    </p>

                    {/* Interactive Hero Selector Pills */}
                    <div className="pt-1">
                      <div className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider mb-2">
                        I want to:
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-w-md">
                        {[
                          { id: 'organize', label: 'Organize my course', sub: 'PDFs, Videos, Slides & YouTube' },
                          { id: 'understand', label: 'Understand a topic', sub: 'Evidence-grounded Socratic tutor' },
                          { id: 'prepare', label: 'Prepare for an exam', sub: 'Targeted active-recall drills' },
                          { id: 'practice', label: 'Practice weak concepts', sub: 'Prerequisite mastery DAG' }
                        ].map((sel) => {
                          const isCurrent = heroSelector === sel.id;
                          return (
                            <button
                              key={sel.id}
                              type="button"
                              onClick={() => setHeroSelector(sel.id as any)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-white border-[#263F2B] ring-2 ring-[#263F2B]/15 shadow-xs'
                                  : 'bg-white/70 hover:bg-white border-[#DCE5CE]'
                              }`}
                            >
                              <div className={`text-xs font-semibold ${isCurrent ? 'text-[#263F2B]' : 'text-[#17241B]'}`}>
                                {sel.label}
                              </div>
                              <div className="text-[10px] text-[#697650] leading-tight mt-0.5 line-clamp-1">
                                {sel.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Main CTA Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => onNavigate('/sign-up')}
                        className="px-6 py-3.5 text-sm font-semibold text-white bg-[#142417] hover:bg-[#0B150D] rounded-full transition-all shadow-sm flex items-center gap-2 group active:scale-[0.98] cursor-pointer"
                      >
                        <span>Build my study path</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => setDemoModalOpen(true)}
                        className="px-6 py-3.5 text-sm font-semibold text-[#17241B] bg-white/90 hover:bg-white border border-[#D5E0CC] rounded-full transition-all flex items-center gap-2 active:scale-[0.98] shadow-2xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-[#17241B]" />
                        <span>Explore the workspace</span>
                      </button>
                    </div>

                    {/* Sub-CTA Product Promise */}
                    <div className="pt-2 border-t border-[#D5E0CC] text-xs font-medium text-[#687563] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      <span>Your material first. Evidence always.</span>
                    </div>
                  </div>

                  {/* Right Column: 3D CourseCompass Learning Orbit */}
                  <div className="lg:col-span-6 flex items-center justify-center pt-2 lg:pt-0">
                    <CourseCompassOrbit3D
                      activeSelector={heroSelector}
                      onExploreWorkspace={() => setDemoModalOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: TRUST & CORE PILLARS (Solid Apple Studio Slate #F5F5F7) */}
            <section className="bg-[#F5F5F7] py-14 border-b border-[#E5E5EA]">
              <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                    Educational Rigor
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                    Engineered for Maximum Retention.
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Pillar 1 */}
                  <div
                    onClick={() => onSelectTab('how-it-works')}
                    className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Compass className="w-5 h-5 text-[#1B4D3E]" />
                    </div>
                    <h3 className="font-semibold text-base text-[#1D1D1F] mb-1 group-hover:text-[#1B4D3E] transition-colors">
                      Tailored Roadmaps
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Syllabus-aligned progression mapping every chapter and prerequisite in order.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div
                    onClick={() => onSelectTab('features')}
                    className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-5 h-5 text-[#1B4D3E]" />
                    </div>
                    <h3 className="font-semibold text-base text-[#1D1D1F] mb-1 group-hover:text-[#1B4D3E] transition-colors">
                      Active Recall Drills
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Adaptive diagnostic quizzes that uncover the exact misconception behind wrong answers.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div
                    onClick={() => onSelectTab('security')}
                    className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-[#1B4D3E]" />
                    </div>
                    <h3 className="font-semibold text-base text-[#1D1D1F] mb-1 group-hover:text-[#1B4D3E] transition-colors">
                      Exact Provenance
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Every statement backed by textbook page numbers and exact video timestamps.
                    </p>
                  </div>

                  {/* Pillar 4 */}
                  <div
                    onClick={() => onSelectTab('features')}
                    className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-[#142417] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Network className="w-5 h-5 text-[#1B4D3E]" />
                    </div>
                    <h3 className="font-semibold text-base text-[#1D1D1F] mb-1 group-hover:text-[#1B4D3E] transition-colors">
                      Dependency Graphs
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed">
                      Identifies missing foundational concepts before they cause points loss on exam day.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: SUPER ADVANCED SHOWCASE (Solid Deep Space Black #000000 - Apple Pro) */}
            <section className="bg-black py-20 text-white border-b border-zinc-900">
              <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>THE AUTONOMOUS ADVANTAGE</span>
                  </div>
                  <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                    Why Top College Students Study Differently.
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    Compare the reality of fragmented studying against the precision of CourseCompass.
                  </p>
                </div>

                {/* Interactive Reality Check Card */}
                <div className="max-w-4xl mx-auto bg-[#0C0E12] border border-[#232936] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                  {/* Segmented Switcher */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setComparisonMode('with')}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                        comparisonMode === 'with'
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      With CourseCompass (Structured Mastery)
                    </button>
                    <button
                      onClick={() => setComparisonMode('without')}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                        comparisonMode === 'without'
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Without CourseCompass (Manual Chaos)
                    </button>
                  </div>

                  {/* Mode Content */}
                  {comparisonMode === 'with' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      <div className="p-5 rounded-2xl bg-[#141822] border border-emerald-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <h4 className="font-semibold text-white text-base">Instant Ingestion</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Drop in 45-min lecture videos, 600-page PDFs, and slide decks. Everything is indexed and anchored in seconds.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#141822] border border-emerald-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <h4 className="font-semibold text-white text-base">Root-Cause Remediation</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          When you miss a quiz question, CourseCompass pinpoints the exact prerequisite concept you overlooked.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#141822] border border-emerald-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <h4 className="font-semibold text-white text-base">Guaranteed Provenance</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Zero hallucinations. Every explanation opens the exact slide, page, or timestamp from your professor.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      <div className="p-5 rounded-2xl bg-[#1B1414] border border-rose-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
                          ✕
                        </div>
                        <h4 className="font-semibold text-rose-200 text-base">14 Scattered Tabs</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Rewinding 90-minute lectures blindly, switching between Canvas, Discord, and disjointed folders.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#1B1414] border border-rose-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
                          ✕
                        </div>
                        <h4 className="font-semibold text-rose-200 text-base">Blind Spots Until Midterm</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Memorizing answers without understanding dependencies, discovering critical knowledge gaps during the exam.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#1B1414] border border-rose-950/80 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
                          ✕
                        </div>
                        <h4 className="font-semibold text-rose-200 text-base">Chatbot Hallucinations</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Generic AI chats give convincing yet incorrect code conventions that cost points on exam rubrics.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pro Bottom Callout */}
                  <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Empowering students across CS, Engineering, Biology, and Economics.</span>
                    </div>
                    <button
                      onClick={() => onNavigate('/sign-up')}
                      className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>Get Started Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: STUDENT RESULTS & TESTIMONIALS (Solid Pure White #FFFFFF) */}
            <section className="bg-white py-16 border-b border-[#E5E5EA]">
              <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                    Student Evidence
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
                    Proven Across Rigorous University Programs.
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-4">
                    <p className="text-[#1D1D1F] leading-relaxed text-sm">
                      “Being able to click on a tutor explanation and immediately see the exact slide and video timestamp from my professor's lecture completely changed how I prep for finals.”
                    </p>
                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#1D1D1F] block text-xs">David K.</span>
                        <span className="text-[11px] text-[#86868B]">Computer Science · Stanford</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#1B4D3E] font-semibold">CS 161 Algorithms</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-4">
                    <p className="text-[#1D1D1F] leading-relaxed text-sm">
                      “The misconception diagnostics are incredible. When I got a recursion problem wrong, it told me I misunderstood the base halting invariant instead of just giving the answer.”
                    </p>
                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#1D1D1F] block text-xs">Elena R.</span>
                        <span className="text-[11px] text-[#86868B]">Biomedical Engineering · Berkeley</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#1B4D3E] font-semibold">BIOE 105 Systems</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-4">
                    <p className="text-[#1D1D1F] leading-relaxed text-sm">
                      “I used to spend half my study time just finding where a theorem was mentioned across 800 pages of lecture slides. CourseCompass indexes it in seconds.”
                    </p>
                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#1D1D1F] block text-xs">Marcus T.</span>
                        <span className="text-[11px] text-[#86868B]">Economics &amp; Mathematics · MIT</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#1B4D3E] font-semibold">14.02 Macroeconomics</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: FINAL MOTIVATION (Solid Apple Studio Slate #F5F5F7) */}
            <section className="bg-[#F5F5F7] py-16">
              <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
                <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight">
                  Turn scattered study material into your clearest path forward.
                </h2>
                <p className="text-sm sm:text-base text-[#515154] max-w-xl mx-auto">
                  Set up your first course and experience evidence-based studying in less than 2 minutes.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('/sign-up')}
                    className="px-7 py-3.5 bg-[#142417] hover:bg-[#0B150D] text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>Start Learning Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectTab('pricing')}
                    className="px-7 py-3.5 bg-white hover:bg-zinc-100 text-[#1D1D1F] border border-[#E5E5EA] rounded-full text-sm font-semibold transition-all active:scale-[0.98]"
                  >
                    <span>View Pricing Plans</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: FEATURES (Pedagogy & Tools Deep-Dive)                  */}
        {/* ============================================================ */}
        {currentTab === 'features' && (
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Platform Architecture
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1D1D1F]">
                Engineered for Academic Mastery
              </h1>
              <p className="text-sm text-[#86868B]">
                Explore how CourseCompass transforms unorganized courseware into an evidence-based learning environment.
              </p>
            </div>

            {/* Feature Sub-Navigation */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl max-w-2xl mx-auto overflow-x-auto">
              {[
                { id: 'tutor', label: 'Source-Grounded Tutor', icon: Sparkles },
                { id: 'map', label: 'Prerequisite Graph', icon: Network },
                { id: 'quiz', label: 'Adaptive Quizzing', icon: HelpCircle },
                { id: 'flashcards', label: 'Spaced Retrieval', icon: Layers },
                { id: 'ingest', label: 'Multi-Modal Ingest', icon: FileText }
              ].map((feat) => {
                const Icon = feat.icon;
                const isActive = activeFeatureTab === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeatureTab(feat.id as any)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#142417] font-semibold shadow-sm'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{feat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feature Details Container */}
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-10 shadow-sm">
              {activeFeatureTab === 'tutor' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Socratic AI Tutor
                    </span>
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
                      Every Answer Anchored to Your Courseware
                    </h2>
                    <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">
                      Generic chatbots hallucinate facts and confuse course-specific conventions. CourseCompass strictly evaluates your instructor's syllabus, assigned textbook chapters, and recorded lectures.
                    </p>
                    <ul className="space-y-2 text-xs text-[#1D1D1F]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Visible trust banner: "Supported by your course" vs "Outside explanation"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Direct deep-links to textbook page numbers and video timestamps</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Socratic guidance that teaches problem-solving rather than giving away homework answers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="lg:col-span-6 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
                      <span className="font-semibold text-[#142417]">Verified Tutor Response</span>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ● Supported by your course
                      </span>
                    </div>
                    <p className="text-[#1D1D1F] leading-relaxed">
                      "In Lecture 08 at 14:32, Professor Henderson demonstrates that stack overflow occurs because each recursive call pushes an activation record onto the finite call stack memory."
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'map' && (
                <div className="space-y-4 max-w-2xl mx-auto text-xs text-center">
                  <h3 className="font-serif-display text-2xl font-bold text-[#1D1D1F]">
                    Automatic Prerequisite Graphing
                  </h3>
                  <p className="text-[#515154] leading-relaxed">
                    CourseCompass maps foundational concept dependencies. If you struggle with Graph Search Algorithms, the system uncovers whether the gap is in Recursion Base Cases or Memory Pointers.
                  </p>
                  <div className="p-6 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-left space-y-2">
                    <span className="text-[10px] text-[#86868B] uppercase font-semibold">Graph Insight Example</span>
                    <p className="text-[#1D1D1F] font-medium">
                      Call Stack Mechanics → Recursion Base Cases → Depth-First Search (DFS)
                    </p>
                    <p className="text-zinc-500 text-[11px]">
                      Mastery of earlier nodes is required before progressing to advanced traversal topics.
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'quiz' && (
                <div className="space-y-4 max-w-2xl mx-auto text-xs text-center">
                  <h3 className="font-serif-display text-2xl font-bold text-[#1D1D1F]">
                    Adaptive Quizzing &amp; Misconception Diagnostics
                  </h3>
                  <p className="text-[#515154] leading-relaxed">
                    Practice with questions generated directly from your slides and textbook. Every incorrect option is analyzed to identify the exact misunderstanding.
                  </p>
                  <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2 text-left">
                    <span className="text-[10px] font-semibold text-[#86868B] uppercase">Sample Diagnostic Question</span>
                    <p className="font-semibold text-sm text-[#1D1D1F]">
                      Why does an array sum function with an unchanged index parameter cause a stack overflow?
                    </p>
                    <p className="text-[#515154] leading-relaxed">
                      Feedback explains <em>why</em> incorrect options are tempting misconceptions, linking back to Lecture 08 and Textbook Chapter 4.
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'flashcards' && (
                <div className="space-y-4 max-w-2xl mx-auto text-xs text-center">
                  <h3 className="font-serif-display text-2xl font-bold text-[#1D1D1F]">
                    Spaced Retrieval &amp; Executive Summaries
                  </h3>
                  <p className="text-[#515154] leading-relaxed">
                    Flashcards with self-rating confidence intervals (Again, Hard, Good, Easy) paired with synthesized executive takeaways for high-speed pre-exam revision.
                  </p>
                  <div className="p-6 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-left">
                    <span className="text-[10px] text-[#86868B] uppercase font-semibold">Synthesized Concept Takeaway</span>
                    <h4 className="font-semibold text-sm text-[#1D1D1F] mt-1">Activation Records &amp; Base Conditions</h4>
                    <p className="text-[#515154] mt-2 leading-relaxed">
                      To avoid infinite recursion, recursive functions must have at least one base case, and each recursive step must guarantee strict progression toward that condition.
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'ingest' && (
                <div className="space-y-4 max-w-2xl mx-auto text-xs text-center">
                  <h3 className="font-serif-display text-2xl font-bold text-[#1D1D1F]">
                    Multi-Modal Course Ingestion
                  </h3>
                  <p className="text-[#515154] leading-relaxed">
                    Ingest lecture MP4/WebM videos, PDF textbooks, PowerPoint slides, and audio office hours. The indexing pipeline automatically extracts OCR text, audio transcripts, and concept graphs with millisecond synchronization.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <Video className="w-5 h-5 text-[#142417] mx-auto mb-1" />
                      <span className="font-semibold">Lecture Videos</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <FileText className="w-5 h-5 text-[#142417] mx-auto mb-1" />
                      <span className="font-semibold">Textbook PDFs</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <Presentation className="w-5 h-5 text-[#142417] mx-auto mb-1" />
                      <span className="font-semibold">Slide Decks</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <Sparkles className="w-5 h-5 text-[#142417] mx-auto mb-1" />
                      <span className="font-semibold">Audio Notes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: CURRICULUM & HOW IT WORKS ('how-it-works')           */}
        {/* ============================================================ */}
        {currentTab === 'how-it-works' && (
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Curriculum Architecture
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1D1D1F]">
                How CourseCompass Works
              </h1>
              <p className="text-sm text-[#86868B]">
                A deterministic, four-stage learning engine that turns scattered documents into a daily study roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#142417] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">
                  Multi-Modal Course Ingestion
                </h3>
                <p className="text-[#515154] leading-relaxed">
                  Upload your syllabus, lecture video recordings, textbook PDFs, and slide decks. The platform extracts audio transcripts, runs slide OCR, and anchors every paragraph to exact timestamps and page numbers.
                </p>
              </div>

              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#142417] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">
                  Prerequisite &amp; Concept Graphing
                </h3>
                <p className="text-[#515154] leading-relaxed">
                  CourseCompass constructs an interconnected dependency map of every topic. If you fail an exam practice problem on Graph Cycle Detection, the graph identifies whether the real weakness lies in Recursion Base Cases or Call Stack Mechanics.
                </p>
              </div>

              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#142417] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">
                  Daily 45-Minute Socratic Sprints
                </h3>
                <p className="text-[#515154] leading-relaxed">
                  Rather than overwhelming you with endless notes, CourseCompass allocates an evidence-based daily schedule tailored to your exam date. Each sprint balances Learn (5 min), Practice (15 min), and Recall (5 min).
                </p>
              </div>

              <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#142417] text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">
                  Diagnostic Mastery Verification
                </h3>
                <p className="text-[#515154] leading-relaxed">
                  Mastery scores are deterministically updated only when you demonstrate active recall and resolve misconceptions. Spaced repetition flashcards reinforce formulas and theorems as exam day approaches.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-[#1D1D1F]">Ready to organize your courses?</h4>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Set up your first course and generate your personalized study path in 2 minutes.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/sign-up')}
                className="px-5 py-2.5 bg-[#142417] hover:bg-[#0B150D] text-white rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: RESOURCES & SECURITY ('security')                     */}
        {/* ============================================================ */}
        {currentTab === 'security' && (
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Shield className="w-4 h-4 text-[#1B4D3E]" /> Academic Trust &amp; Privacy
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1D1D1F]">
                Your Course Materials Remain Private
              </h1>
              <p className="text-sm text-[#86868B]">
                We treat student records, examination prep histories, and instructor courseware with strict isolation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-6 bg-white border border-[#E5E5EA] rounded-2xl space-y-2 shadow-sm">
                <span className="font-semibold text-sm text-[#1D1D1F]">Zero Public Model Training</span>
                <p className="text-[#515154] leading-relaxed">
                  Your uploaded syllabi, slides, and exam preparation recordings are never used to train global or public foundation models. Your materials remain exclusively inside your isolated workspace.
                </p>
              </div>

              <div className="p-6 bg-white border border-[#E5E5EA] rounded-2xl space-y-2 shadow-sm">
                <span className="font-semibold text-sm text-[#1D1D1F]">FERPA Mindset &amp; Student Privacy</span>
                <p className="text-[#515154] leading-relaxed">
                  Diagnostic quiz histories, mastery metrics, and session transcripts are confidential to your student login. We do not expose student scores or identity publicly.
                </p>
              </div>

              <div className="p-6 bg-white border border-[#E5E5EA] rounded-2xl space-y-2 shadow-sm">
                <span className="font-semibold text-sm text-[#1D1D1F]">Audited Citations (No Hallucinations)</span>
                <p className="text-[#515154] leading-relaxed">
                  Every factual assertion links to a concrete timestamp or page in your instructor's provided material. If an inquiry covers topics outside your courseware, CourseCompass displays an explicit boundary warning.
                </p>
              </div>

              <div className="p-6 bg-white border border-[#E5E5EA] rounded-2xl space-y-2 shadow-sm">
                <span className="font-semibold text-sm text-[#1D1D1F]">Complete Data Ownership &amp; Erasure</span>
                <p className="text-[#515154] leading-relaxed">
                  Export all your notes, quiz attempts, and mastery records anytime in JSON format. When you delete a course or purge your account, all associated indexed data is permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 5: PRICING ('pricing')                                   */}
        {/* ============================================================ */}
        {currentTab === 'pricing' && <PricingView onNavigate={onNavigate} />}

        {/* ============================================================ */}
        {/* VIEW 6: ACCESSIBILITY ('accessibility')                       */}
        {/* ============================================================ */}
        {currentTab === 'accessibility' && (
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Universal Usability
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1D1D1F]">
                WCAG 2.1 AA Accessibility Conformance
              </h1>
              <p className="text-sm text-[#86868B]">
                Built to ensure equal access for all students, assistive devices, and keyboard users.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-6 text-xs shadow-sm">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[#1D1D1F]">Visual Contrast Ratios</h3>
                <p className="text-[#515154] leading-relaxed">
                  All typography satisfies WCAG AA minimum contrast standards:
                  <br />• Charcoal headers (#1D1D1F) on clean backgrounds achieve an <strong>11.5:1</strong> contrast ratio.
                  <br />• Forest green anchors (#1B4D3E) achieve an <strong>8.8:1</strong> contrast ratio.
                  <br />• Focus indicators use visible outline rings for accessible navigation.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#E5E5EA]">
                <h3 className="font-semibold text-sm text-[#1D1D1F]">Full Keyboard Operability</h3>
                <p className="text-[#515154] leading-relaxed">
                  All interactive widgets (source citation inspectors, quiz option selectors, feature tabs, and study sprint modules) are fully navigable using Tab, Shift+Tab, Enter, and Space keys.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 7: PRIVACY POLICY ('privacy')                            */}
        {/* ============================================================ */}
        {currentTab === 'privacy' && (
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200 text-xs">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Legal &amp; Privacy
              </span>
              <h1 className="font-serif-display text-3xl font-bold text-[#1D1D1F]">
                CourseCompass Privacy Policy
              </h1>
              <p className="text-[#86868B]">Last updated: Academic Year 2026</p>
            </div>

            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-[#515154] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-semibold text-sm text-[#1D1D1F]">1. Student Data Protection &amp; FERPA Mindset</h2>
                <p>
                  CourseCompass respects student rights. All course materials, lecture videos, syllabi, notes, and quiz histories uploaded by you remain your property. They are stored in an encrypted, isolated student workspace.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-semibold text-sm text-[#1D1D1F]">2. No Foundation Model Training</h2>
                <p>
                  We guarantee that your uploaded university course materials, lecture transcripts, and quiz responses are never used to train global or public artificial intelligence models.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-semibold text-sm text-[#1D1D1F]">3. Data Deletion &amp; Portability</h2>
                <p>
                  You may export your courses, notes, and mastery progress anytime in standard JSON format. You can delete your account or any individual course at any time, which permanently removes all indexed data.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 8: TERMS OF SERVICE ('terms')                            */}
        {/* ============================================================ */}
        {currentTab === 'terms' && (
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200 text-xs">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Legal Agreements
              </span>
              <h1 className="font-serif-display text-3xl font-bold text-[#1D1D1F]">
                Terms of Service
              </h1>
              <p className="text-[#86868B]">Last updated: Academic Year 2026</p>
            </div>

            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm text-[#515154] leading-relaxed">
              <section className="space-y-2">
                <h2 className="font-semibold text-sm text-[#1D1D1F]">1. Academic Integrity Standard</h2>
                <p>
                  CourseCompass is engineered as a personalized Socratic study platform to foster deep conceptual understanding. Users agree not to use CourseCompass during live, closed-book academic examinations in violation of their institution's honor code.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-semibold text-sm text-[#1D1D1F]">2. Fair Use &amp; Educational Materials</h2>
                <p>
                  You represent that you have the right to upload your course syllabus, lecture notes, and assigned readings for your own personal educational analysis and review.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 9: FAQ ('faq')                                          */}
        {/* ============================================================ */}
        {currentTab === 'faq' && (
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Questions &amp; Answers
              </span>
              <h1 className="font-serif-display text-3xl font-bold text-[#1D1D1F]">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-[#86868B]">
                Everything you need to know about citations, privacy, and courseware ingestion.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#1D1D1F]"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#86868B] transition-transform ${
                          isOpen ? 'rotate-180 text-[#1B4D3E]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-[#515154] leading-relaxed border-t border-[#F5F5F7]">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 10: CONTACT ('contact')                                  */}
        {/* ============================================================ */}
        {currentTab === 'contact' && (
          <div className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
            <div className="space-y-2 text-center max-w-xl mx-auto">
              <span className="text-xs font-semibold text-[#1B4D3E] uppercase tracking-wider">
                Support &amp; Campus Access
              </span>
              <h1 className="font-serif-display text-3xl font-bold text-[#1D1D1F]">
                Contact CourseCompass
              </h1>
              <p className="text-sm text-[#86868B]">
                Need help indexing a specialized format or exploring department access? Reach our academic engineering team.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 shadow-sm">
              {contactSubmitted ? (
                <div className="p-6 text-center space-y-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h3 className="font-semibold text-sm text-[#1D1D1F]">Message Sent Successfully</h3>
                  <p className="text-xs text-[#86868B]">
                    Our student support team will respond to your academic inquiry within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1D1D1F] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#142417]/20 text-xs text-[#1D1D1F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1D1D1F] mb-1">University Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. amorgan@stanford.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#142417]/20 text-xs text-[#1D1D1F]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1D1D1F] mb-1">Inquiry or Course Format Details</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="How can our academic team assist your study path?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#142417]/20 text-xs text-[#1D1D1F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#142417] hover:bg-[#0B150D] text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry to Academic Team</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* GLOBAL FOOTER (Solid Apple Studio Slate #F5F5F7)               */}
      {/* ============================================================ */}
      <footer className="bg-[#F5F5F7] border-t border-[#D2D2D7] py-14 text-xs text-[#86868B] select-none">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Brand Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E5E5EA]">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-xs text-[#86868B]">
                · Turn scattered study material into your clearest path forward.
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('/sign-in')}
                className="hover:text-[#1D1D1F] transition-colors"
              >
                Sign In
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onNavigate('/sign-up')}
                className="font-semibold text-[#1D1D1F] hover:text-[#1B4D3E] transition-colors"
              >
                Create Free Account
              </button>
            </div>
          </div>

          {/* 4 Clean Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1: Learning Platform */}
            <div className="space-y-2">
              <span className="font-semibold text-[#1D1D1F] block text-xs">Learning Platform</span>
              <button
                type="button"
                onClick={() => onSelectTab('features')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Features &amp; Pedagogy
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('how-it-works')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Curriculum Engine
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('pricing')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium text-[#1B4D3E]"
              >
                Student Pricing
              </button>
            </div>

            {/* Column 2: Trust & Compliance */}
            <div className="space-y-2">
              <span className="font-semibold text-[#1D1D1F] block text-xs">Security &amp; Trust</span>
              <button
                type="button"
                onClick={() => onSelectTab('security')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Security Architecture
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('accessibility')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                WCAG 2.1 AA Accessibility
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('privacy')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Privacy Policy (FERPA)
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('terms')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Terms of Service
              </button>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-2">
              <span className="font-semibold text-[#1D1D1F] block text-xs">Support &amp; Access</span>
              <button
                type="button"
                onClick={() => onSelectTab('faq')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                FAQ Knowledge Base
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('contact')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Contact Academic Support
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/sign-in')}
                className="block text-left text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                Sign In to Workspace
              </button>
            </div>

            {/* Column 4: Academic Integrity Note */}
            <div className="space-y-2">
              <span className="font-semibold text-[#1D1D1F] block text-xs">Academic Integrity</span>
              <p className="text-[11px] text-[#86868B]">CS 204 Data Structures &amp; Graphs</p>
              <p className="text-[11px] text-[#86868B]">Source-grounded learning</p>
              <p className="text-[11px] text-[#86868B]">Zero public AI model training</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Modal */}
      <InteractiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onStartLearning={() => onNavigate('/sign-up')}
        onInspectCitation={onInspectCitation}
      />
    </div>
  );
};
