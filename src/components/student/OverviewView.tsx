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
  Layers
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
  const hasCourses = Boolean(profile.currentCourse || (profile.enrolledSubjects && profile.enrolledSubjects.length > 0));

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
              Create your first course and upload your lectures, PDFs, or slides to begin building your personalized study path.
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
  const totalHoursLogged = ((profile.last7DaysStreak?.reduce((acc, d) => acc + d.minutes, 0) || 0) / 60).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Top Clean Banner: Student Context & Quick Progress Summary */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#697650]">
              <span className="font-semibold text-[#263F2B]">{profile.university || 'CourseCompass Student'}</span>
              <span>·</span>
              <span>{profile.academicLevel || 'Undergraduate'}</span>
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
                {profile.overallMastery || 0}%
              </span>
              <span className="text-[10px] text-[#5D655B] uppercase tracking-wider font-semibold">
                Mastery Score
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

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#E1E4D8]/70">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Study Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {profile.studyStreakDays || 0} Days
              </span>
            </div>
            <span className="text-[10px] text-[#697650] font-medium block mt-1">
              Consecutive practice
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Materials Indexed</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-[#263F2B]">
                {materialsCount} Files
              </span>
            </div>
            <span className="text-[10px] text-[#697650] font-medium block mt-1">
              Ground-truth source corpus
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
              {concepts.length > 0 ? 'Concept milestones' : 'No concepts yet'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E1E4D8]">
            <span className="text-[11px] text-[#5D655B] block font-medium">Retention Stability</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono-code text-xl font-bold text-emerald-700">
                {profile.overallMastery > 0 ? `${Math.min(99, profile.overallMastery + 15)}%` : '0%'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-800 font-medium block mt-1">
              {profile.overallMastery > 0 ? 'Active retention tracking' : 'Pending practice'}
            </span>
          </div>
        </div>
      </div>

      {/* Course without documents empty banner */}
      {materialsCount === 0 && (
        <div className="bg-[#FAF9F5] border border-[#E1E4D8] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#17241B]">
              Your course is ready for material.
            </h3>
            <p className="text-xs text-[#5D655B]">
              Upload a PDF, lecture video, presentation, image, or audio recording to start building your study path.
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

      {/* 2. Encouraging Study Streak Visual Component */}
      {profile.studyStreakDays && profile.studyStreakDays > 0 ? (
        <StudyStreak
          profile={profile}
          onOpenSprint={() => onNavigateStudent('quiz')}
          onStartQuiz={() => onNavigateStudent('quiz')}
        />
      ) : null}

      {/* 3. Student Progress Visual Charts & Graphs (Weekly Activity & Retention Trajectory) */}
      {profile.overallMastery > 0 && <StudentProgressCharts profile={profile} />}

      {/* 4. Highly Focused "Add New Subject" & "My Enrolled Subjects" Section */}
      <AddSubjectSection
        profile={profile}
        onSwitchSubject={onSwitchSubject}
        onAddNewSubject={onAddNewSubject}
      />

      {/* 5. Detailed Student Progress Report by Topic */}
      <TopicProgressReport
        concepts={concepts}
        courseCode={profile.courseCode}
      />
    </div>
  );
};
