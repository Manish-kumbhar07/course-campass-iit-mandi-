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
  ArrowRight,
  UploadCloud,
  Plus,
  Layers,
  HelpCircle,
  Brain,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { StudyStreak } from './StudyStreak';
import { StudentProgressCharts } from './StudentProgressCharts';
import { AddSubjectSection } from './AddSubjectSection';
import { TopicProgressReport } from './TopicProgressReport';

interface OverviewViewProps {
  profile: StudentProfile;
  studyPlan: StudyPlanDay[];
  concepts: ConceptNode[];
  materialsCount?: number;
  onNavigateStudent: (tab: StudentTab) => void;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onOpenOnboarding: () => void;
  onSwitchSubject?: (subject: EnrolledSubject) => void;
  onAddNewSubject?: (newSubject: EnrolledSubject) => void;
  onCreateCourse?: () => void;
  onUploadMaterials?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  profile,
  studyPlan,
  concepts,
  materialsCount = 0,
  onNavigateStudent,
  onToggleTask,
  onInspectCitation,
  onOpenOnboarding,
  onSwitchSubject = () => {},
  onAddNewSubject = () => {},
  onCreateCourse = () => {},
  onUploadMaterials = () => {}
}) => {
  const hasCourses = Boolean(
    profile.currentCourse || (profile.enrolledSubjects && profile.enrolledSubjects.length > 0)
  );

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // If user has NO courses:
  if (!hasCourses) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-10 sm:p-14 text-center space-y-5 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F2E6] border border-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto shadow-2xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#17241B]">
              Your study workspace is empty.
            </h2>
            <p className="text-xs sm:text-sm text-[#5D655B] leading-relaxed">
              Create your first course to begin building your personalized study path, prerequisite map, and source-grounded AI tutor.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onCreateCourse}
              className="px-6 py-3 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create my first course</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const masteredConcepts = concepts.filter((c) => c.status === 'mastered');
  const attentionConcepts = concepts.filter((c) => c.status === 'attention');
  const learningConcepts = concepts.filter((c) => c.status === 'learning');

  // Identify next focus concept
  const focusConcept =
    attentionConcepts[0] ||
    learningConcepts[0] ||
    concepts[0] ||
    null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header with Personalized Time Greeting & Core Progress */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#697650]">
              <span className="font-semibold text-[#263F2B]">{profile.university || 'CourseCompass Academic'}</span>
              <span>·</span>
              <span>{profile.academicLevel || 'Undergraduate'}</span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#263F2B]">
              {getGreeting()}, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#5D655B] max-w-2xl leading-relaxed">
              Active Course: <strong className="text-[#17241B]">{profile.currentCourse}</strong> ({profile.courseCode}).
              Target study time: <strong className="text-[#17241B]">{profile.dailyStudyMinutes} min/day</strong>.
            </p>
          </div>

          {/* Exam Countdown & Overall Mastery Badge */}
          <div className="flex items-center gap-4 bg-[#F8F7EF] border border-[#E1E4D8] rounded-xl p-4 shrink-0">
            <div className="text-center px-3 border-r border-[#E1E4D8]">
              <span className="block font-mono-code text-2xl sm:text-3xl font-bold text-[#263F2B]">
                {profile.overallMastery || 0}%
              </span>
              <span className="text-[10px] text-[#5D655B] uppercase tracking-wider font-semibold">
                Overall Mastery
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17241B]">
                <Calendar className="w-3.5 h-3.5 text-[#697650]" />
                <span>{profile.examDate || 'Scheduled Assessment'}</span>
              </div>
              <p className="text-[11px] text-[#697650] font-mono">
                {profile.examCountdownDays ? `${profile.examCountdownDays} Days to Exam` : 'Self-Paced'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Calculated Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#E1E4D8]/70">
          {/* Card 1: Course Material */}
          <div
            onClick={() => onNavigateStudent('materials')}
            className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8] hover:border-[#697650] transition-colors cursor-pointer group"
          >
            <span className="text-[11px] text-[#5D655B] block font-medium">Course Material</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {materialsCount}
              </span>
              <span className="text-xs text-[#5D655B]">sources indexed</span>
            </div>
            <span className="text-[10px] text-[#697650] font-medium block mt-1 group-hover:text-[#263F2B]">
              {materialsCount > 0 ? 'Verified corpus ready →' : '+ Add your first source →'}
            </span>
          </div>

          {/* Card 2: Concept Mastery */}
          <div
            onClick={() => onNavigateStudent('mastery' as any)}
            className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8] hover:border-[#697650] transition-colors cursor-pointer group"
          >
            <span className="text-[11px] text-[#5D655B] block font-medium">Concept Mastery</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-emerald-700">
                {masteredConcepts.length}
              </span>
              <span className="text-xs text-[#5D655B]">/ {concepts.length} mastered</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-medium block mt-1 group-hover:underline">
              {attentionConcepts.length} need attention →
            </span>
          </div>

          {/* Card 3: Study Streak */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Study Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {profile.studyStreakDays || 0}
              </span>
              <span className="text-xs text-[#5D655B]">days active</span>
            </div>
            <span className="text-[10px] text-[#697650] font-medium block mt-1">
              Daily habit on track
            </span>
          </div>

          {/* Card 4: Next Assessment */}
          <div
            onClick={() => onNavigateStudent('quiz')}
            className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8] hover:border-[#697650] transition-colors cursor-pointer group"
          >
            <span className="text-[11px] text-[#5D655B] block font-medium">Next Assessment</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                Adaptive Quiz
              </span>
            </div>
            <span className="text-[10px] text-[#697650] font-medium block mt-1 group-hover:text-[#263F2B]">
              Practice weak topics →
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Core Questions Section: Where do I stand? What should I do right now? What is coming up next? */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question 1: Where do I stand? */}
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-[#263F2B]" />
              <span>1. Where do I stand?</span>
            </div>
            <h3 className="font-serif-display text-base font-bold text-[#17241B]">
              Knowledge Baseline & Retention
            </h3>

            {concepts.length === 0 ? (
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Complete your first lesson or quiz to see your mastery score and retention baseline here.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D655B]">Mastered:</span>
                  <span className="font-mono font-bold text-emerald-700">{masteredConcepts.length} concepts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D655B]">Learning:</span>
                  <span className="font-mono font-bold text-amber-700">{learningConcepts.length} concepts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5D655B]">Needs Attention:</span>
                  <span className="font-mono font-bold text-[#D71935]">{attentionConcepts.length} concepts</span>
                </div>
                <div className="w-full h-2 bg-[#E1E4D8] rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${concepts.length > 0 ? (masteredConcepts.length / concepts.length) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${concepts.length > 0 ? (learningConcepts.length / concepts.length) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-[#D71935] h-full"
                    style={{ width: `${concepts.length > 0 ? (attentionConcepts.length / concepts.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateStudent('knowledge-map')}
            className="w-full py-2 bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Prerequisite Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Question 2: What should I do right now? */}
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <Brain className="w-4 h-4 text-[#263F2B]" />
              <span>2. What should I do right now?</span>
            </div>
            <h3 className="font-serif-display text-base font-bold text-[#17241B]">
              Today's Recommended Focus
            </h3>

            {focusConcept ? (
              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17241B] truncate">{focusConcept.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    focusConcept.status === 'attention' ? 'bg-rose-100 text-[#D71935]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {focusConcept.status === 'attention' ? 'Needs Review' : 'Practice'}
                  </span>
                </div>
                <p className="text-[11px] text-[#5D655B] line-clamp-2">
                  {focusConcept.summary || 'Fundamental concept required for upcoming exam preparation.'}
                </p>
                {focusConcept.primaryMisconception && (
                  <p className="text-[10px] text-[#D71935] font-medium">
                    Common pitfall: "{focusConcept.primaryMisconception}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#5D655B] leading-relaxed">
                Add study material or complete a diagnostic quiz to generate your personalized daily focus concept.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateStudent('quiz')}
              className="flex-1 py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateStudent('tutor')}
              className="py-2 px-3 bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              title="Ask AI Tutor"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question 3: What is coming up next? */}
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#263F2B]" />
              <span>3. What is coming up next?</span>
            </div>
            <h3 className="font-serif-display text-base font-bold text-[#17241B]">
              Exam & Schedule Milestones
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#17241B] block">Target Exam</span>
                  <span className="text-[11px] text-[#5D655B]">{profile.examDate || 'Self-Paced Assessment'}</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#263F2B] bg-white px-2 py-1 rounded border border-[#E1E4D8]">
                  {profile.examCountdownDays ? `${profile.examCountdownDays} days` : 'Flexible'}
                </span>
              </div>

              <div className="p-3 bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#17241B] block">Spaced Revision</span>
                  <span className="text-[11px] text-[#5D655B]">Active retention deck</span>
                </div>
                <button
                  onClick={() => onNavigateStudent('flashcards')}
                  className="text-xs text-[#263F2B] font-semibold hover:underline"
                >
                  Review cards →
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateStudent('weekly-report')}
            className="w-full py-2 bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Full Weekly Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty Material Banner if user has 0 materials */}
      {materialsCount === 0 && (
        <div className="bg-[#FAF9F5] border border-[#E1E4D8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#17241B]">
              Your course is ready for material.
            </h3>
            <p className="text-xs text-[#5D655B]">
              Add your first PDF, lecture video, slide deck, or YouTube lesson to build your grounded study workspace.
            </p>
          </div>
          <button
            onClick={onUploadMaterials}
            className="px-4 py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#DCE5CE]" />
            <span>Upload study material</span>
          </button>
        </div>
      )}

      {/* 3. Encouraging Study Streak Component */}
      {profile.studyStreakDays && profile.studyStreakDays > 0 ? (
        <StudyStreak
          profile={profile}
          onOpenSprint={() => onNavigateStudent('quiz')}
          onStartQuiz={() => onNavigateStudent('quiz')}
        />
      ) : null}

      {/* 4. Student Progress Visual Charts (Retention Trajectory) */}
      {profile.overallMastery > 0 && <StudentProgressCharts profile={profile} />}

      {/* 5. Custom Subject & Course Management Section (Dynamic & Non-fixed) */}
      <AddSubjectSection
        profile={profile}
        onSwitchSubject={onSwitchSubject}
        onAddNewSubject={onAddNewSubject}
      />

      {/* 6. Detailed Student Progress Report by Topic */}
      {concepts.length > 0 && (
        <TopicProgressReport
          concepts={concepts}
          courseCode={profile.courseCode}
        />
      )}
    </div>
  );
};
