import React from 'react';
import {
  StudentProfile,
  StudyPlanDay,
  ConceptNode,
  StudentTab,
  SourceCitation,
  EnrolledSubject
} from '../../types';
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { StudyStreak } from './StudyStreak';
import { StudentProgressCharts } from './StudentProgressCharts';
import { AddSubjectSection } from './AddSubjectSection';
import { TopicProgressReport } from './TopicProgressReport';

interface OverviewViewProps {
  profile: StudentProfile;
  studyPlan: StudyPlanDay[];
  concepts: ConceptNode[];
  onNavigateStudent: (tab: StudentTab) => void;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onOpenOnboarding: () => void;
  onSwitchSubject?: (subject: EnrolledSubject) => void;
  onAddNewSubject?: (newSubject: EnrolledSubject) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  profile,
  studyPlan,
  concepts,
  onNavigateStudent,
  onToggleTask,
  onInspectCitation,
  onOpenOnboarding,
  onSwitchSubject = () => {},
  onAddNewSubject = () => {}
}) => {
  const masteredConcepts = concepts.filter((c) => c.status === 'mastered');
  const totalHoursLogged = ((profile.last7DaysStreak?.reduce((acc, d) => acc + d.minutes, 0) || 345) / 60).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Top Clean Banner: Student Context & Quick Progress Summary */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#697650]">
              <span className="font-semibold text-[#263F2B]">{profile.university}</span>
              <span>·</span>
              <span>{profile.academicLevel}</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#263F2B]">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#5D655B] max-w-2xl leading-relaxed">
              Active Course: <strong className="text-[#17241B]">{profile.currentCourse}</strong> ({profile.courseCode}).
              Daily study target: <strong className="text-[#17241B]">{profile.dailyStudyMinutes} minutes</strong>.
            </p>
          </div>

          {/* Exam Countdown & Progress Highlight Card */}
          <div className="flex items-center gap-4 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl p-4 shrink-0">
            <div className="text-center px-3 border-r border-[#E1E4D8]">
              <span className="block font-mono-code text-2xl sm:text-3xl font-bold text-[#263F2B]">
                {profile.overallMastery || 74}%
              </span>
              <span className="text-[10px] text-[#5D655B] uppercase tracking-wider font-semibold">
                Exam Readiness
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17241B]">
                <Calendar className="w-3.5 h-3.5 text-[#697650]" />
                <span>{profile.examDate}</span>
              </div>
              <p className="text-[11px] text-[#D71935] font-mono font-bold">
                {profile.examCountdownDays} Days to Midterm
              </p>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium inline-block">
                On Track for A-grade
              </span>
            </div>
          </div>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#E1E4D8]/70">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Study Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-orange-700">
                {profile.studyStreakDays || 7} Days
              </span>
            </div>
            <span className="text-[10px] text-orange-800 font-medium block mt-1">
              Daily Goal Reached 🔥
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Hours Logged (Week)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {totalHoursLogged} hrs
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block mt-1">
              +18% above target
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Mastered Topics</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {masteredConcepts.length} / {concepts.length}
              </span>
            </div>
            <span className="text-[10px] text-[#697650] block mt-1">
              Key syllabus milestones
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Retention Stability</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-emerald-700">94%</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-medium block mt-1">
              Low memory decay
            </span>
          </div>
        </div>
      </div>

      {/* 2. Encouraging Study Streak Visual Component */}
      <StudyStreak
        profile={profile}
        onOpenSprint={() => {}}
        onStartQuiz={() => {}}
      />

      {/* 3. Student Progress Visual Charts & Graphs (Weekly Activity & Retention Trajectory) */}
      <StudentProgressCharts profile={profile} />

      {/* 4. Highly Focused "Add New Subject" & "My Enrolled Subjects" Section */}
      <AddSubjectSection
        profile={profile}
        onSwitchSubject={onSwitchSubject}
        onAddNewSubject={onAddNewSubject}
      />

      {/* 5. Detailed Student Progress Report by Topic (Neat table, no quizzes) */}
      <TopicProgressReport
        concepts={concepts}
        courseCode={profile.courseCode}
      />
    </div>
  );
};
