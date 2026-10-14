import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  ShieldCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { StudentProfile, ConceptNode, StudentTab, SourceCitation } from '../../types';

interface IntellectualDashboardProps {
  profile: StudentProfile;
  concepts: ConceptNode[];
  onNavigateStudent: (tab: StudentTab) => void;
  onInspectCitation?: (citation: SourceCitation) => void;
}

export const IntellectualDashboard: React.FC<IntellectualDashboardProps> = ({
  profile,
  concepts,
  onNavigateStudent,
  onInspectCitation
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'bottlenecks' | 'retention' | 'pulse'>('matrix');
  const [selectedDomainIndex, setSelectedDomainIndex] = useState<number | null>(null);

  // Interactive pulse question state
  const [pulseAnswered, setPulseAnswered] = useState<boolean>(false);
  const [selectedPulseOption, setSelectedPulseOption] = useState<number | null>(null);
  const [pulseScoreBonus, setPulseScoreBonus] = useState<number>(0);

  const cognitiveReadinessScore = Math.min(100, (profile.overallMastery || 58) + 20 + pulseScoreBonus);
  const weakConcepts = concepts.filter((c) => c.status === 'attention');
  const masteredConcepts = concepts.filter((c) => c.status === 'mastered');
  const learningConcepts = concepts.filter((c) => c.status === 'learning');

  // Academic Cognitive Dimensions
  const cognitiveDimensions = [
    {
      id: 'asymptotics',
      name: 'Asymptotic Proofs & Complexity',
      score: 92,
      tier: 'Mastered',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-600',
      description: 'Solid intuition for Big-O, Big-Omega upper/lower bounds and master theorem substitution.',
      prereqClear: true,
      questionsAttempted: 14,
      accuracy: '93%'
    },
    {
      id: 'recursion',
      name: 'Recursive Call Stack Mechanics',
      score: 64,
      tier: 'Needs Revision',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      description: 'Base case termination mechanics and activation record push/pop lifecycles.',
      prereqClear: false,
      questionsAttempted: 12,
      accuracy: '58%',
      bottleneck: 'Base case omitting causes unbounded stack expansion'
    },
    {
      id: 'graph_traversal',
      name: 'Graph Traversal (DFS/BFS)',
      score: 52,
      tier: 'Critical Attention',
      statusColor: 'text-[#D71935] bg-rose-50 border-rose-200',
      barColor: 'bg-[#D71935]',
      description: 'Cycle detection, visited sets, and topological sort ordering mechanics.',
      prereqClear: false,
      questionsAttempted: 8,
      accuracy: '50%',
      bottleneck: 'Confusing call stack recursion in DFS with FIFO queue traversal in BFS'
    },
    {
      id: 'dynamic_prog',
      name: 'Dynamic Programming & Memoization',
      score: 78,
      tier: 'Developing',
      statusColor: 'text-blue-800 bg-blue-50 border-blue-200',
      barColor: 'bg-blue-600',
      description: 'Optimal substructure identification and state-transition table population.',
      prereqClear: true,
      questionsAttempted: 10,
      accuracy: '80%'
    }
  ];

  const handleSelectPulse = (idx: number) => {
    if (pulseAnswered) return;
    setSelectedPulseOption(idx);
    setPulseAnswered(true);
    if (idx === 1) {
      // Correct option
      setPulseScoreBonus(3);
    }
  };

  const handleResetPulse = () => {
    setPulseAnswered(false);
    setSelectedPulseOption(null);
  };

  return (
    <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header Strip: Intellectual Brand & Predicted Exam Grade */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E1E4D8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF3E5] border border-[#D0E2C4] text-xs font-semibold text-[#263F2B]">
              <Brain className="w-3.5 h-3.5 text-emerald-700" />
              Intellectual Progress Engine
            </span>
            <span className="text-xs text-[#697650] font-mono">
              Diagnostic v3.4 · Real-time
            </span>
          </div>
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#17241B]">
            Cognitive Mastery & Exam Readiness Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#5D655B] max-w-2xl leading-relaxed">
            Multi-factor analysis tracking your conceptual retention, algorithmic intuition, and prerequisite dependencies for <strong className="text-[#17241B]">{profile.currentCourse}</strong>.
          </p>
        </div>

        {/* Predicted Academic Grade Card */}
        <div className="flex items-center gap-3 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl px-4 py-3 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#263F2B] text-white flex flex-col items-center justify-center font-mono shadow-xs">
            <span className="text-xs text-emerald-300 font-bold">GRADE</span>
            <span className="text-lg font-extrabold leading-none">A-</span>
          </div>
          <div className="space-y-0.5 text-xs">
            <span className="font-semibold text-[#17241B] block">Predicted Bracket</span>
            <span className="text-[11px] text-[#697650] block font-mono">
              Likelihood: 84% High Distinction
            </span>
            <span className="text-[10px] text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded font-medium inline-block">
              +6% lift from study streak
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Intellectual Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Overall Cognitive Score */}
        <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E1E4D8] space-y-1.5 relative overflow-hidden group hover:border-[#263F2B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#697650]">
              Readiness Index
            </span>
            <Target className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#17241B]">
              {cognitiveReadinessScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              +4% this wk
            </span>
          </div>
          <p className="text-[11px] text-[#5D655B] leading-tight">
            Comprehensive grasp across {concepts.length} key syllabus topics
          </p>
        </div>

        {/* Metric 2: Memory Retention Index */}
        <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E1E4D8] space-y-1.5 hover:border-[#263F2B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#697650]">
              Retention Stability
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#17241B]">
              88.4%
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Solid
            </span>
          </div>
          <p className="text-[11px] text-[#5D655B] leading-tight">
            Ebbinghaus decay curve protected by consecutive daily reviews
          </p>
        </div>

        {/* Metric 3: Diagnostic Problem-Solving Velocity */}
        <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E1E4D8] space-y-1.5 hover:border-[#263F2B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#697650]">
              Solving Velocity
            </span>
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#17241B]">
              1m 42s
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              -18s avg
            </span>
          </div>
          <p className="text-[11px] text-[#5D655B] leading-tight">
            Average time per exam proof question with 86% accuracy
          </p>
        </div>

        {/* Metric 4: Prerequisite Health */}
        <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E1E4D8] space-y-1.5 hover:border-[#263F2B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#697650]">
              Prerequisite Chain
            </span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#17241B]">
              4 / 5
            </span>
            <span className="text-xs font-semibold text-amber-700">
              1 Bottleneck
            </span>
          </div>
          <p className="text-[11px] text-[#5D655B] leading-tight">
            Recursion base cases blocking full Graph Traversal mastery
          </p>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E1E4D8] pb-1 overflow-x-auto">
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === 'matrix'
                  ? 'text-[#263F2B] border-b-2 border-[#263F2B] bg-[#F8F7EF]/50'
                  : 'text-[#697650] hover:text-[#17241B]'
              }`}
            >
              Cognitive Mastery Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bottlenecks')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bottlenecks'
                  ? 'text-[#263F2B] border-b-2 border-[#263F2B] bg-[#F8F7EF]/50'
                  : 'text-[#697650] hover:text-[#17241B]'
              }`}
            >
              <span>Critical Bottlenecks</span>
              <span className="w-4 h-4 rounded-full bg-[#D71935] text-white text-[10px] flex items-center justify-center font-bold">
                {weakConcepts.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('retention')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === 'retention'
                  ? 'text-[#263F2B] border-b-2 border-[#263F2B] bg-[#F8F7EF]/50'
                  : 'text-[#697650] hover:text-[#17241B]'
              }`}
            >
              Retention Curve & Spaced Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pulse')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pulse'
                  ? 'text-[#263F2B] border-b-2 border-[#263F2B] bg-[#F8F7EF]/50'
                  : 'text-[#697650] hover:text-[#17241B]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Rapid Intellectual Pulse</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-[#697650]">
            Last calibrated today from study logs
          </span>
        </div>

        {/* Tab 1: Cognitive Mastery Matrix */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {cognitiveDimensions.map((dim, idx) => (
                <div
                  key={dim.id}
                  onClick={() => setSelectedDomainIndex(selectedDomainIndex === idx ? null : idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDomainIndex === idx
                      ? 'bg-[#F9FAF6] border-[#263F2B] shadow-xs'
                      : 'bg-white border-[#E1E4D8] hover:border-[#BAC6A7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-xs text-[#17241B]">{dim.name}</h4>
                      <p className="text-[11px] text-[#5D655B] mt-0.5">{dim.description}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${dim.statusColor}`}
                    >
                      {dim.tier}
                    </span>
                  </div>

                  {/* Dimension Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#697650] font-mono">
                        {dim.questionsAttempted} drills · {dim.accuracy} accuracy
                      </span>
                      <span className="font-mono font-bold text-[#17241B]">{dim.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#E1E4D8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${dim.barColor}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottleneck Callout if present */}
                  {dim.bottleneck && (
                    <div className="mt-2.5 p-2 bg-[#FFF8F8] border border-[#F8E2E3] rounded-lg text-[10px] text-[#D71935] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Warning: {dim.bottleneck}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateStudent('quiz');
                        }}
                        className="font-bold underline hover:no-underline ml-2 shrink-0 cursor-pointer"
                      >
                        Drill Now
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3.5 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#5D655B] text-center sm:text-left">
                Want to level up your lowest scoring dimension before midterm?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateStudent('quiz')}
                  className="px-3 py-1.5 bg-[#263F2B] hover:bg-[#1E3322] text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Take Targeted Diagnostic Drill</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateStudent('knowledge-map')}
                  className="px-3 py-1.5 bg-white hover:bg-[#F1F2E6] border border-[#D5DFCF] text-[#263F2B] rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Explore Prerequisite Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Critical Bottlenecks */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-3">
            <div className="p-4 bg-[#FFF8F8] border border-[#F8E2E3] rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D71935]">
                <AlertTriangle className="w-4 h-4" />
                <span>Prerequisite Blockers That Restrict Exam Ceiling</span>
              </div>
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Our cognitive graph indicates that solving these two specific misconceptions will unlock up to <strong className="text-[#17241B]">+18 points</strong> on your upcoming exam:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-white border border-[#F8E2E3] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#17241B]">Recursion Base Case Omission</span>
                    <span className="font-mono text-xs font-bold text-[#D71935]">42% Mastery</span>
                  </div>
                  <p className="text-[11px] text-[#5D655B]">
                    Students repeatedly forget to check structural progression toward the base condition, causing memory leaks in activation records.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-[#F8E2E3]">
                    <span className="text-[11px] text-[#697650]">Source: Textbook Ch. 4 (p. 112)</span>
                    <button
                      type="button"
                      onClick={() => onNavigateStudent('tutor')}
                      className="text-[#263F2B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Ask AI Tutor <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#F8E2E3] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#17241B]">Cycle Detection In Directed Graphs</span>
                    <span className="font-mono text-xs font-bold text-[#D71935]">48% Mastery</span>
                  </div>
                  <p className="text-[11px] text-[#5D655B]">
                    Confusing nodes currently in the recursion stack with previously completed nodes in post-order DFS traversals.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-[#F8E2E3]">
                    <span className="text-[11px] text-[#697650]">Source: Lecture 08 (14:32)</span>
                    <button
                      type="button"
                      onClick={() => onNavigateStudent('quiz')}
                      className="text-[#263F2B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Take 3-Min Quiz <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Retention Curve & Spaced Schedule */}
        {activeTab === 'retention' && (
          <div className="p-4 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-semibold text-xs text-[#17241B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Ebbinghaus Spaced Repetition Stability
                </h4>
                <p className="text-[11px] text-[#5D655B]">
                  Calculates natural forgetting curves so you review exactly before memory decay occurs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#263F2B] bg-white px-3 py-1 rounded-lg border border-[#E1E4D8]">
                Optimal Next Review: 18h
              </span>
            </div>

            {/* Visual Retention Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#E1E4D8] rounded-lg space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Strong Retention (Stage 3)
                </span>
                <p className="font-semibold text-[#17241B]">Asymptotic Analysis & Big-O</p>
                <div className="w-full h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '95%' }} />
                </div>
                <span className="text-[10px] text-[#697650] block">Safe for 14 days</span>
              </div>

              <div className="p-3 bg-white border border-[#E1E4D8] rounded-lg space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Decaying Soon (Stage 2)
                </span>
                <p className="font-semibold text-[#17241B]">Stack Activation Records</p>
                <div className="w-full h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '64%' }} />
                </div>
                <span className="text-[10px] text-amber-700 block font-semibold">Review recommended today</span>
              </div>

              <div className="p-3 bg-white border border-[#E1E4D8] rounded-lg space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D71935]">
                  High Risk (Stage 1)
                </span>
                <p className="font-semibold text-[#17241B]">Graph Cycle Detection</p>
                <div className="w-full h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D71935] rounded-full" style={{ width: '38%' }} />
                </div>
                <span className="text-[10px] text-[#D71935] block font-semibold">Decaying in 4 hours</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onNavigateStudent('flashcards')}
                className="px-3.5 py-1.5 bg-[#263F2B] hover:bg-[#1E3322] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Spaced Repetition Flashcards</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Rapid Intellectual Pulse Check */}
        {activeTab === 'pulse' && (
          <div className="p-5 bg-[#FAFBF8] border border-[#DDE5D4] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                  ⚡
                </span>
                <div>
                  <h4 className="font-semibold text-xs text-[#17241B]">
                    60-Second Intellectual Recall Challenge
                  </h4>
                  <p className="text-[11px] text-[#5D655B]">
                    Instant cognitive probe calibrated to your current course topics.
                  </p>
                </div>
              </div>
              {pulseAnswered && (
                <button
                  type="button"
                  onClick={handleResetPulse}
                  className="text-xs text-[#263F2B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              )}
            </div>

            {/* Question Card */}
            <div className="bg-white border border-[#E1E4D8] rounded-xl p-4 space-y-3 shadow-2xs">
              <p className="text-xs sm:text-sm font-semibold text-[#17241B] leading-relaxed">
                "Why does deep recursion in an unbounded search graph lead to a runtime Stack Overflow rather than a Heap Out-of-Memory exception?"
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 0,
                    text: 'The heap cannot grow beyond the main executable program boundary.',
                    isCorrect: false
                  },
                  {
                    id: 1,
                    text: 'Each function invocation allocates an activation record in thread-limited stack space until maximum call depth is breached.',
                    isCorrect: true
                  },
                  {
                    id: 2,
                    text: 'Garbage collection freezes recursive frames during execution.',
                    isCorrect: false
                  }
                ].map((option, idx) => {
                  const isSelected = selectedPulseOption === idx;
                  const isCorrect = option.isCorrect;

                  let styleClass = 'border-[#E1E4D8] bg-white hover:bg-[#F9FAF6] text-[#17241B]';
                  if (pulseAnswered) {
                    if (isCorrect) {
                      styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isSelected) {
                      styleClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      styleClass = 'border-[#E1E4D8] bg-white opacity-60 text-[#5D655B]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={pulseAnswered}
                      onClick={() => handleSelectPulse(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${styleClass}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {pulseAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Cognitive Feedback */}
              {pulseAnswered && (
                <div
                  className={`p-3 rounded-lg text-xs space-y-1 ${
                    selectedPulseOption === 1
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {selectedPulseOption === 1 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Intellectual Recall Confirmed! (+3% Readiness Index)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Key Distinction Missed: Review Stack Allocation vs Heap Memory</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Referenced from <strong className="font-semibold">Textbook Ch. 4 (p. 112)</strong> and <strong className="font-semibold">Lecture 08 (14:32)</strong>: Function calls synchronously push activation records into fixed per-thread stack limits.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
