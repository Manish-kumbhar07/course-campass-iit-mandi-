import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Mic,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { SourceReference } from '../../types';
import { PUBLIC_SAMPLE_CITATIONS } from '../../services/mock-services';
import { HeroStudentVisual } from './HeroStudentVisual';

interface MultiDisciplinaryWorkspaceMockupProps {
  onInspectCitation?: (cite: SourceReference) => void;
  onStartLearning?: () => void;
}

type SubjectId = 'econ' | 'cs' | 'bio' | 'calc';

interface SubjectData {
  id: SubjectId;
  tabLabel: string;
  courseCode: string;
  courseName: string;
  readinessScore: number;
  sources: {
    audio: string;
    slides: string;
    textbook: string;
  };
  metrics: {
    name: string;
    pct: number;
    tag: string;
    color: 'green' | 'amber';
    badgeExtra?: string;
  }[];
  drill: {
    title: string;
    question: string;
    options: { id: number; text: string; correct: boolean }[];
    solutionSteps: string[];
    citations: string[];
  };
}

const SUBJECT_CONFIGS: Record<SubjectId, SubjectData> = {
  econ: {
    id: 'econ',
    tabLabel: 'Intro to Macroeconomics',
    courseCode: 'ECON102',
    courseName: 'Intro to Macroeconomics',
    readinessScore: 78,
    sources: {
      audio: 'Lecture_Recording_W4.m4a (Time 18:45)',
      slides: 'Professor_Slides_Ch3.pdf',
      textbook: 'Textbook_Chapters_4_5.pdf'
    },
    metrics: [
      { name: 'Key Theories & Models', pct: 92, tag: '92% Mastery', color: 'green' },
      { name: 'Formula Derivations', pct: 45, tag: '45% Needs Revision', color: 'amber', badgeExtra: '🔥 Try 5-Min Drill' },
      { name: 'Past Exam Questions', pct: 60, tag: '3 of 5 Solved', color: 'green' }
    ],
    drill: {
      title: 'Midterm Practice Drill',
      question: 'Which of the following is most likely to trigger demand-pull inflation?',
      options: [
        { id: 0, text: 'Rapid surge in aggregate demand exceeding short-run aggregate supply', correct: true },
        { id: 1, text: 'A sudden raw commodity supply shock causing production cost increases', correct: false },
        { id: 2, text: 'Contractionary monetary policy raising central bank benchmark yields', correct: false }
      ],
      solutionSteps: [
        'Step 1: In Lecture W4 @ 18:45, Prof. Miller defines demand-pull inflation as AD shifting rightward along the inelastic portion of the SRAS curve.',
        'Step 2: When consumers, business investments, and government purchases outpace productive capacity (Y > Y*), price levels rise as firms ration constrained output.',
        'Step 3: Verified in Textbook Ch. 4 (p. 118) equation: ΔP/P = f(AD - AS).'
      ],
      citations: ['Lecture W4 (18:45)', 'Slides Ch. 3 (Slide 14)', 'Textbook Ch. 4 (p. 118)']
    }
  },
  cs: {
    id: 'cs',
    tabLabel: 'Data Structures & Algorithms',
    courseCode: 'CS204',
    courseName: 'Data Structures & Algorithms',
    readinessScore: 74,
    sources: {
      audio: 'Lecture_08_Recursion.mp4 (Time 14:32)',
      slides: 'Slide_Deck_12_CallStacks.pdf',
      textbook: 'Algorithms_Ch4_Recursion.pdf'
    },
    metrics: [
      { name: 'Asymptotic Analysis & Big-O', pct: 95, tag: '95% Mastered', color: 'green' },
      { name: 'Recursion & Call Stacks', pct: 44, tag: '44% Needs Revision', color: 'amber', badgeExtra: '🔥 Try 5-Min Drill' },
      { name: 'Graph DFS/BFS Practice', pct: 65, tag: '4 of 6 Solved', color: 'green' }
    ],
    drill: {
      title: 'Midterm Practice Drill',
      question: 'Why does unbounded recursion trigger an execution stack overflow error?',
      options: [
        { id: 0, text: 'Each recursive call pushes an activation record until finite contiguous stack memory is exhausted', correct: true },
        { id: 1, text: 'Dynamic heap allocation triggers an automatic garbage collection halt', correct: false },
        { id: 2, text: 'Static compiler memory cannot allocate arrays inside nested scopes', correct: false }
      ],
      solutionSteps: [
        'Step 1: Every invocation pushes a new stack frame containing return addresses and local parameters.',
        'Step 2: Without progressing to base case halting, frames accumulate faster than return pops.',
        'Step 3: Documented in Slide Deck 12 (Slide 19) and Textbook Ch. 4 (p. 112).'
      ],
      citations: ['Lecture 08 @ 14:32', 'Slide Deck 12', 'Textbook Ch. 4']
    }
  },
  bio: {
    id: 'bio',
    tabLabel: 'Biology & Life Sciences',
    courseCode: 'BIO110',
    courseName: 'Cellular & Molecular Biology',
    readinessScore: 84,
    sources: {
      audio: 'OfficeHours_Audio_W5.m4a (Time 09:12)',
      slides: 'Cell_Signaling_Pathways.pdf',
      textbook: 'MolecularBiology_Ch7.pdf'
    },
    metrics: [
      { name: 'Mitochondrial Respiration', pct: 90, tag: '90% Mastery', color: 'green' },
      { name: 'GPCR Signal Cascades', pct: 52, tag: '52% Needs Revision', color: 'amber', badgeExtra: '🔥 Try 5-Min Drill' },
      { name: 'Enzyme Kinetics Diagnostics', pct: 75, tag: '6 of 8 Solved', color: 'green' }
    ],
    drill: {
      title: 'Midterm Practice Drill',
      question: 'What is the immediate consequence when GTP bound to the G-alpha subunit is hydrolyzed to GDP?',
      options: [
        { id: 0, text: 'G-alpha re-associates with G-beta/gamma, halting effector enzyme activation', correct: true },
        { id: 1, text: 'Adenylate cyclase undergoes irreversible phosphorylation', correct: false },
        { id: 2, text: 'Extracellular ligands detach and degrade spontaneously', correct: false }
      ],
      solutionSteps: [
        'Step 1: Intrinsic GTPase activity of the G-alpha subunit hydrolyzes GTP into GDP.',
        'Step 2: The subunit adopts its inactive conformation, terminating second-messenger production.',
        'Step 3: Confirmed in Cellular Pathways Slides (Slide 22).'
      ],
      citations: ['Office Hours W5', 'Signaling Slides (Slide 22)', 'Textbook Ch. 7']
    }
  },
  calc: {
    id: 'calc',
    tabLabel: 'Applied Calculus',
    courseCode: 'MATH152',
    courseName: 'Applied Calculus & Series',
    readinessScore: 69,
    sources: {
      audio: 'Recitation_Taylor_Series.m4a (Time 22:10)',
      slides: 'Convergence_Tests_CheatSheet.pdf',
      textbook: 'Stewart_Calculus_Ch11.pdf'
    },
    metrics: [
      { name: 'Integration by Parts', pct: 88, tag: '88% Mastery', color: 'green' },
      { name: 'Alternating Series Remainder', pct: 40, tag: '40% Needs Revision', color: 'amber', badgeExtra: '🔥 Try 5-Min Drill' },
      { name: 'Power Series Interval Radius', pct: 50, tag: '2 of 4 Solved', color: 'green' }
    ],
    drill: {
      title: 'Midterm Practice Drill',
      question: 'Which test guarantees convergence for an alternating series when terms decrease monotonically to zero?',
      options: [
        { id: 0, text: 'Leibniz Alternating Series Test', correct: true },
        { id: 1, text: 'Direct Ratio Test with limit equal to one', correct: false },
        { id: 2, text: 'Integral Test with an unbounded upper limit', correct: false }
      ],
      solutionSteps: [
        'Step 1: Verify condition 1: lim_{n->inf} b_n = 0.',
        'Step 2: Verify condition 2: b_{n+1} <= b_n for all n.',
        'Step 3: The remainder |R_n| is strictly bounded by b_{n+1}.'
      ],
      citations: ['Recitation Series (22:10)', 'Convergence Sheet', 'Calculus Ch. 11']
    }
  }
};

export const MultiDisciplinaryWorkspaceMockup: React.FC<MultiDisciplinaryWorkspaceMockupProps> = ({
  onInspectCitation,
  onStartLearning
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('econ');
  const [selectedOption, setSelectedOption] = useState<number | null>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'workspace' | 'student'>('workspace');

  const current = SUBJECT_CONFIGS[selectedSubject];

  const handleSelectSubject = (id: SubjectId) => {
    setSelectedSubject(id);
    setSelectedOption(0);
    setShowSolution(false);
  };

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none">
      {/* Background Soft Shadow / Layer Effect to Match Image */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl blur-md pointer-events-none" />

      {/* Main Browser Mockup Panel (Natural Light UI) - Compact height */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl border border-[#E5EAE2] shadow-lg shadow-emerald-950/[0.03] p-3.5 sm:p-4 text-[#17241B]">
        
        {/* Window Bar Header with Close/Minimize/Maximize Dots & Mode Switcher */}
        <div className="flex items-center justify-between mb-2 border-b border-[#F0F4EC] pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="ml-1.5 text-[10px] font-mono text-[#8C9886]">CourseCompass Studio</span>
          </div>

          {/* Mode Switcher: Workspace vs Student Study Desk */}
          <div className="flex items-center bg-[#F3F6F0] p-0.5 rounded-lg border border-[#E3E8DC] text-[9.5px] font-medium">
            <button
              type="button"
              onClick={() => setActiveMode('workspace')}
              className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeMode === 'workspace'
                  ? 'bg-white text-[#183B25] font-semibold shadow-2xs'
                  : 'text-[#6A7465] hover:text-[#17241B]'
              }`}
            >
              <span>Workspace Drill</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('student')}
              className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeMode === 'student'
                  ? 'bg-white text-[#183B25] font-semibold shadow-2xs'
                  : 'text-[#6A7465] hover:text-[#17241B]'
              }`}
            >
              <span>Student In Focus</span>
            </button>
          </div>
        </div>

        {/* Top Subject-Switcher Tab Bar (Universal Multi-Disciplinary Versatility) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-[#EEF2EA] text-[10px] sm:text-[10.5px] font-medium no-scrollbar">
          {(['bio', 'cs', 'econ', 'calc'] as SubjectId[]).map((subjId) => {
            const subj = SUBJECT_CONFIGS[subjId];
            const isActive = selectedSubject === subjId;
            return (
              <button
                key={subjId}
                onClick={() => handleSelectSubject(subjId)}
                className={`px-2 py-0.5 rounded transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'text-[#183B25] font-semibold bg-[#EDF5EE] border-b-2 border-[#183B25]'
                    : 'text-[#6A7465] hover:text-[#17241B] hover:bg-[#F4F7F1]'
                }`}
              >
                <span>[{subj.tabLabel}]</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#183B25]" />}
              </button>
            );
          })}
        </div>

        {/* Header Bar with Course Title & Exam Readiness Status */}
        <div className="flex items-center justify-between pt-1.5 pb-1.5 border-b border-[#F0F3ED] gap-2">
          <h3 className="font-bold text-xs sm:text-sm text-[#17241B] tracking-tight">
            {current.courseCode}: {current.courseName}
          </h3>
          <span className="bg-[#183B25] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
            {current.readinessScore}% Exam Ready
          </span>
        </div>

        {/* Conditional View: Student Study Desk vs Interactive Workspace */}
        {activeMode === 'student' ? (
          <div className="pt-2 space-y-2 animate-in fade-in duration-200">
            {/* Student Study Sanctuary Header */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F8F2] border border-[#DEE5D6] gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#183B25] text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-emerald-500/25 shadow-xs shrink-0">
                  <span>AS</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#17241B] text-xs">
                    College Student Study Desk
                  </h4>
                  <p className="text-[#65725F] text-[10px]">
                    Curriculum synthesized from lectures, PDFs &amp; slides
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1 shadow-2xs">
                  <Flame className="w-3 h-3 text-orange-600" />
                  7-Day Streak
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  45m Met
                </span>
              </div>
            </div>

            {/* Compact organized student study visual */}
            <div className="rounded-xl overflow-hidden border border-[#DCE4D4] shadow-xs bg-white p-1 max-h-[220px] flex items-center justify-center">
              <div className="scale-90 transform-gpu origin-center w-full">
                <HeroStudentVisual />
              </div>
            </div>

            {/* Return action */}
            <div className="flex items-center justify-between pt-0.5 text-[10px]">
              <span className="text-[#65725F]">
                Focused study desk powered by CourseCompass
              </span>
              <button
                type="button"
                onClick={() => setActiveMode('workspace')}
                className="text-[#183B25] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Live Drill &amp; Diagnostics</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Visual Layout: Divided into Two Balanced Panels (Shorter Compact Spacing) */
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
          
          {/* ========================================================= */}
          {/* LEFT PANEL: Unified Resource Pipeline & Diagnostics       */}
          {/* ========================================================= */}
          <div className="sm:col-span-6 space-y-2 flex flex-col justify-between">
            
            {/* Section A: Unified Resource Pipeline */}
            <div className="space-y-1">
              <span className="block text-[9px] font-bold tracking-wider text-[#8A9685] uppercase">
                UNIFIED STUDY SOURCES
              </span>

              {/* Light gray container with connected tree branches */}
              <div className="p-2 rounded-lg bg-[#F6F8F3] border border-[#E3E8DE] space-y-1 text-[10px]">
                {/* Source 1: Audio / Lecture Recording */}
                <div className="flex items-center gap-1.5 text-[#17241B]">
                  <div className="w-4 h-4 rounded bg-white border border-[#D8E2D2] flex items-center justify-center shrink-0 text-emerald-800">
                    <Mic className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-mono text-[10px] truncate font-medium">
                    {current.sources.audio}
                  </span>
                </div>

                {/* Tree Branch 1 */}
                <div className="flex items-center gap-1.5 text-[#17241B] pl-1.5 border-l-2 border-[#D8E2D2] ml-2">
                  <div className="w-4 h-4 rounded bg-white border border-[#D8E2D2] flex items-center justify-center shrink-0 text-teal-800">
                    <FileText className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-mono text-[10px] truncate font-medium">
                    {current.sources.slides}
                  </span>
                </div>

                {/* Tree Branch 2 */}
                <div className="flex items-center gap-1.5 text-[#17241B] pl-1.5 border-l-2 border-[#D8E2D2] ml-2">
                  <div className="w-4 h-4 rounded bg-white border border-[#D8E2D2] flex items-center justify-center shrink-0 text-amber-800">
                    <BookOpen className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-mono text-[10px] truncate font-medium">
                    {current.sources.textbook}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Study Session Status with Streak (Compact row) */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[#F6F8F3] border border-[#E3E8DE] text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#183B25] text-white flex items-center justify-center font-bold text-[8.5px] shadow-2xs">
                  <span>AS</span>
                </div>
                <div className="leading-tight">
                  <span className="font-semibold text-[#17241B]">Active Session</span>
                  <span className="text-[#63705E] ml-1.5">45m Target Met</span>
                </div>
              </div>
              <span className="text-[9.5px] font-bold text-orange-700 bg-orange-100/90 px-1.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-0.5 shadow-2xs">
                <Flame className="w-2.5 h-2.5 text-orange-600" />
                7-Day Streak
              </span>
            </div>

            {/* Section B: Exam Readiness Metrics & Diagnostics */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-[#8A9685] uppercase">
                <span>EXAM READINESS METRICS</span>
                <span>DIAGNOSTICS</span>
              </div>

              {/* Metric 1 */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-[#17241B]">
                    {current.metrics[0].name}
                  </span>
                  <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    {current.metrics[0].tag}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5EAE0] overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${current.metrics[0].pct}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Weak area needing revision */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-[#17241B]">
                    {current.metrics[1].name}
                  </span>
                  <span className="text-[9.5px] font-semibold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    {current.metrics[1].tag}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5EAE0] overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${current.metrics[1].pct}%` }}
                  />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-[#17241B]">
                    {current.metrics[2].name}
                  </span>
                  <span className="text-[9.5px] font-medium text-[#5D6758]">
                    {current.metrics[2].tag}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5EAE0] overflow-hidden">
                  <div
                    className="h-full bg-[#233D29] rounded-full transition-all duration-500"
                    style={{ width: `${current.metrics[2].pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: Active Practice & Instant Result             */}
          {/* ========================================================= */}
          <div className="sm:col-span-6 relative flex flex-col justify-between">
            {/* Front Card with Compact Padding */}
            <div className="relative z-10 bg-white rounded-xl border border-[#E1E7DD] p-2.5 sm:p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#F0F3ED]">
                <h4 className="font-bold text-xs text-[#17241B]">
                  {current.drill.title}
                </h4>
                <span className="text-[9px] bg-[#EAECE6] text-[#60675C] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  LIVE Socratic Tutor
                </span>
              </div>

              {/* Student Chat Inquiry with Selected Icon */}
              <div className="p-1.5 px-2 rounded-lg bg-[#F6F8F3] border border-[#E1E8DC] space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#183B25] text-white flex items-center justify-center text-[8.5px] font-bold ring-1 ring-emerald-500/25">
                      <span>AS</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#17241B]">
                      Student Inquiry
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <span className="text-[8.5px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-[10.5px] text-[#2F3D2B] font-medium leading-snug italic">
                  "{current.drill.question}"
                </p>
              </div>

              {/* Multiple Choice Clickable Options (Compact) */}
              <div className="space-y-1">
                {current.drill.options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-1.5 px-2 rounded-lg border text-[10px] cursor-pointer transition-all flex items-start gap-1.5 ${
                      selectedOption === opt.id
                        ? 'bg-[#EBF5ED] border-emerald-600 text-[#142417] font-medium shadow-2xs'
                        : 'bg-[#FAFBF9] border-[#E5EAE0] text-[#475243] hover:bg-white'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                          selectedOption === opt.id
                            ? 'border-emerald-700 bg-emerald-700 text-white'
                            : 'border-[#A3AEA0] bg-white'
                        }`}
                      >
                        {selectedOption === opt.id && (
                          <Check className="w-2 h-2 stroke-[3]" />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] leading-tight">{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Instant In-View Result Banner - No Scroll Needed! */}
              <div className={`p-1.5 px-2 rounded-lg border flex items-center justify-between text-[9.5px] ${
                current.drill.options.find(o => o.id === selectedOption)?.correct
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center gap-1 font-semibold">
                  {current.drill.options.find(o => o.id === selectedOption)?.correct ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>Result: <strong>Verified Correct</strong> (+10 Mastery Pts)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-amber-600 text-white flex items-center justify-center text-[8px] font-bold">!</span>
                      <span>Result: <strong>Revision Needed</strong> (See Citations)</span>
                    </>
                  )}
                </div>
                <span className="text-[9px] font-mono opacity-80">3 Grounded Sources</span>
              </div>

              {/* Step-by-Step Solution Drawer (Concise & Compact) */}
              <div className="pt-1 border-t border-[#F0F3ED] space-y-1">
                <div
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center justify-between text-[10px] font-semibold text-[#183B25] cursor-pointer hover:underline"
                >
                  <div className="flex items-center gap-1">
                    <span>Step-by-Step Citation Solution</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  {showSolution ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </div>

                {/* Collapsed Button or Expanded Drawer */}
                {!showSolution ? (
                  <button
                    type="button"
                    onClick={() => setShowSolution(true)}
                    className="w-full py-1 px-2 rounded-md bg-[#F5F8F3] hover:bg-[#EBF2E8] border border-[#DCE4D7] text-[10px] font-medium text-[#2F3D2B] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Inspect Step-by-Step Citations (3 Sources)</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-md bg-[#FAFDF8] border border-[#D6E6D2] text-[10px] text-[#2F3D2B] space-y-1 animate-in fade-in duration-200 max-h-28 overflow-y-auto">
                    <p className="font-semibold text-emerald-900 text-[10px]">
                      Verified Resolution:
                    </p>
                    {current.drill.solutionSteps.map((step, idx) => (
                      <p key={idx} className="leading-tight text-[9.5px] text-[#475243]">
                        {step}
                      </p>
                    ))}
                    <div className="pt-0.5 border-t border-[#E1ECE0] flex flex-wrap gap-1 text-[8.5px] font-mono text-emerald-800">
                      {current.drill.citations.map((cite, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => {
                            if (onInspectCitation) {
                              const citationList = Object.values(PUBLIC_SAMPLE_CITATIONS);
                              onInspectCitation(citationList[cIdx % citationList.length]);
                            }
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200 transition-colors cursor-pointer flex items-center gap-0.5"
                        >
                          <span>{cite}</span>
                          <ExternalLink className="w-2 h-2 opacity-70" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ========================================================= */}
        {/* CARD FOOTER (Shorter Compact Spacing)                     */}
        {/* ========================================================= */}
        <div className="pt-2 mt-2 border-t border-[#F0F3ED] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Grounded in: Slides, Lectures & Textbook with tiny icons */}
          <div className="text-[#6C7667] text-[10px] flex items-center gap-1.5">
            <span>Grounded in: Slides, Lectures &amp; Textbook</span>
            <div className="flex items-center gap-1 text-[#4A5546]">
              <Mic className="w-3 h-3 text-emerald-800" />
              <BookOpen className="w-3 h-3 text-amber-800" />
              <FileText className="w-3 h-3 text-teal-800" />
            </div>
          </div>

          {/* Bottom Right Vibrant Dark Forest Green CTA */}
          <button
            onClick={() => {
              if (onStartLearning) onStartLearning();
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#0B7A48] hover:bg-[#09663C] text-white text-[10.5px] font-semibold flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 self-end sm:self-auto cursor-pointer"
          >
            <span>Generate Personalized Drill</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
