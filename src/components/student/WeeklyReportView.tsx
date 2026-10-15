import React from 'react';
import {
  StudentProfile,
  ConceptNode,
  StudyPlanDay,
  StudentTab
} from '../../types';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Brain,
  Award,
  ArrowRight,
  Sparkles,
  Calendar,
  BookOpen
} from 'lucide-react';

interface WeeklyReportViewProps {
  profile: StudentProfile;
  concepts: ConceptNode[];
  studyPlan: StudyPlanDay[];
  onNavigateStudent: (tab: StudentTab) => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  profile,
  concepts,
  studyPlan,
  onNavigateStudent
}) => {
  const mastered = concepts.filter((c) => c.status === 'mastered');
  const needsAttention = concepts.filter((c) => c.status === 'attention');
  const learning = concepts.filter((c) => c.status === 'learning');

  const totalMinutesWeek =
    profile.last7DaysStreak?.reduce((acc, d) => acc + (d.minutes || 0), 0) ||
    profile.dailyStudyMinutes * 4;
  const hoursWeek = (totalMinutesWeek / 60).toFixed(1);

  // Misconceptions from concepts that need attention
  const detectedMisconceptions = concepts
    .filter((c) => c.primaryMisconception && c.status === 'attention')
    .map((c) => ({
      conceptName: c.name,
      topic: c.topic,
      misconception: c.primaryMisconception,
      recommendation: `Review source citations and re-verify base constraints for ${c.name}.`
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#697650] uppercase tracking-wider font-semibold">
              <Calendar className="w-4 h-4 text-[#263F2B]" />
              <span>Weekly Academic Performance & Retention Audit</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#263F2B]">
              Weekly Learning Report
            </h1>
            <p className="text-xs sm:text-sm text-[#5D655B] max-w-2xl leading-relaxed">
              Automated synthesis of study time, concept mastery progression, diagnostic quiz accuracy, and identified prerequisite gaps for <strong className="text-[#17241B]">{profile.currentCourse || 'Current Course'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl p-4 shrink-0">
            <div className="text-center px-3 border-r border-[#E1E4D8]">
              <span className="block font-mono-code text-2xl sm:text-3xl font-bold text-[#263F2B]">
                {hoursWeek}h
              </span>
              <span className="text-[10px] text-[#5D655B] uppercase tracking-wider font-semibold">
                Time Logged
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block font-mono-code text-2xl sm:text-3xl font-bold text-emerald-700">
                {profile.overallMastery || 0}%
              </span>
              <span className="text-[10px] text-[#5D655B] uppercase tracking-wider font-semibold">
                Course Mastery
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#E1E4D8]/70">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Study Sessions</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {profile.studyStreakDays || 0}
              </span>
              <span className="text-xs text-[#5D655B]">active days</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-medium block mt-1">
              Consistency on track
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Mastered Concepts</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-emerald-700">
                {mastered.length}
              </span>
              <span className="text-xs text-[#5D655B]">/ {concepts.length} total</span>
            </div>
            <span className="text-[10px] text-[#697650] block mt-1">
              Verified by quizzes
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Attention Needed</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#D71935]">
                {needsAttention.length}
              </span>
              <span className="text-xs text-[#5D655B]">concepts</span>
            </div>
            <span className="text-[10px] text-[#D71935] font-medium block mt-1">
              Requires focused review
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Exam Readiness</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {profile.examCountdownDays ? `${profile.examCountdownDays}d` : '30d'}
              </span>
              <span className="text-xs text-[#5D655B]">remaining</span>
            </div>
            <span className="text-[10px] text-[#697650] block mt-1">
              Target: {profile.examDate || 'Upcoming assessment'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Hours Logged & Misconceptions Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Hours Breakdown */}
        <div className="lg:col-span-6 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#697650]" />
              <h3 className="text-sm font-bold text-[#17241B]">Daily Study Minutes (Last 7 Days)</h3>
            </div>
            <span className="text-xs text-[#5D655B]">Goal: {profile.dailyStudyMinutes} min/day</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {(profile.last7DaysStreak || [
              { day: 'Mon', minutes: 45, completed: true },
              { day: 'Tue', minutes: 30, completed: true },
              { day: 'Wed', minutes: 60, completed: true },
              { day: 'Thu', minutes: 45, completed: true },
              { day: 'Fri', minutes: 20, completed: false },
              { day: 'Sat', minutes: 50, completed: true },
              { day: 'Sun', minutes: 45, completed: true }
            ]).map((d, i) => {
              const heightPercent = Math.min(100, Math.round((d.minutes / Math.max(60, profile.dailyStudyMinutes)) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full h-32 bg-[#F8F7EF] rounded-lg relative flex items-end p-1">
                    <div
                      className={`w-full rounded-md transition-all ${
                        d.minutes >= profile.dailyStudyMinutes
                          ? 'bg-[#263F2B]'
                          : d.minutes > 0
                          ? 'bg-[#697650]'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#17241B]">{d.day}</span>
                  <span className="text-[10px] text-[#5D655B] font-mono">{d.minutes}m</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Concept Mastery Distribution */}
        <div className="lg:col-span-6 bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#263F2B]" />
              <h3 className="text-sm font-bold text-[#17241B]">Concept Mastery Breakdown</h3>
            </div>
            <span className="text-xs text-[#5D655B]">{concepts.length} total concepts</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mastered ({mastered.length})
                </span>
                <span className="font-mono text-[#5D655B]">
                  {concepts.length > 0 ? Math.round((mastered.length / concepts.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#263F2B] rounded-full"
                  style={{
                    width: `${concepts.length > 0 ? (mastered.length / concepts.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Learning in Progress ({learning.length})
                </span>
                <span className="font-mono text-[#5D655B]">
                  {concepts.length > 0 ? Math.round((learning.length / concepts.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#697650] rounded-full"
                  style={{
                    width: `${concepts.length > 0 ? (learning.length / concepts.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#D71935] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Attention Needed ({needsAttention.length})
                </span>
                <span className="font-mono text-[#5D655B]">
                  {concepts.length > 0 ? Math.round((needsAttention.length / concepts.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D71935] rounded-full"
                  style={{
                    width: `${concepts.length > 0 ? (needsAttention.length / concepts.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repeated Misconceptions Section */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D71935]" />
            <h3 className="text-sm font-bold text-[#17241B]">Identified Misconceptions & Prerequisite Gaps</h3>
          </div>
          <span className="text-xs text-[#5D655B]">Diagnosed from adaptive assessments</span>
        </div>

        {detectedMisconceptions.length === 0 ? (
          <div className="p-8 text-center bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-semibold text-[#17241B]">No recurring misconceptions detected</h4>
            <p className="text-[11px] text-[#5D655B]">
              Your recent practice quiz answers demonstrate solid conceptual foundations without recurring error patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedMisconceptions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#17241B]">{item.conceptName}</span>
                  <span className="text-[10px] font-mono text-[#D71935] uppercase tracking-wider font-bold">
                    Misconception
                  </span>
                </div>
                <p className="text-[#D71935] font-medium text-[11px]">"{item.misconception}"</p>
                <p className="text-[#5D655B] text-[11px] pt-1 border-t border-[#F8E2E3]">
                  <strong>Action:</strong> {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Next Steps for Upcoming Week */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#263F2B]" />
            <h3 className="text-sm font-bold text-[#17241B]">Recommended Next Steps (Week Ahead)</h3>
          </div>
          <span className="text-xs text-[#697650] font-semibold">Priority Action Plan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-[#263F2B] text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h4 className="text-xs font-bold text-[#17241B]">Review Weak Concepts</h4>
              <p className="text-[11px] text-[#5D655B] leading-relaxed">
                Spend 20 minutes revisiting base case halts and recursion call stack memory traces.
              </p>
            </div>
            <button
              onClick={() => onNavigateStudent('tutor')}
              className="w-full py-2 bg-white hover:bg-[#F1F2E6] border border-[#E1E4D8] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Ask AI Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-[#263F2B] text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h4 className="text-xs font-bold text-[#17241B]">Practice Diagnostic Quiz</h4>
              <p className="text-[11px] text-[#5D655B] leading-relaxed">
                Take an adaptive 5-question test on DFS cycle detection and 3-color vertex marking.
              </p>
            </div>
            <button
              onClick={() => onNavigateStudent('quiz')}
              className="w-full py-2 bg-white hover:bg-[#F1F2E6] border border-[#E1E4D8] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2.5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-[#263F2B] text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h4 className="text-xs font-bold text-[#17241B]">Flashcard Spaced Repetition</h4>
              <p className="text-[11px] text-[#5D655B] leading-relaxed">
                Complete a 10-card review session to solidify long-term memory before the weekend.
              </p>
            </div>
            <button
              onClick={() => onNavigateStudent('flashcards')}
              className="w-full py-2 bg-white hover:bg-[#F1F2E6] border border-[#E1E4D8] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Review Cards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

