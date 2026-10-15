import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  X,
  GraduationCap,
  Layers,
  ChevronRight,
  Globe,
  Target
} from 'lucide-react';
import { StudentProfile, EnrolledSubject } from '../../types';

interface AddSubjectSectionProps {
  profile: StudentProfile;
  onSwitchSubject: (subject: EnrolledSubject) => void;
  onAddNewSubject: (newSubject: EnrolledSubject) => void;
}

export const AddSubjectSection: React.FC<AddSubjectSectionProps> = ({
  profile,
  onSwitchSubject,
  onAddNewSubject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Custom Form state - All completely customizable (no fixed subject lock)
  const [courseName, setCourseName] = useState('');
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [examDate, setExamDate] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [learningGoals, setLearningGoals] = useState('');

  const enrolled = profile.enrolledSubjects || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !subject.trim()) return;

    const finalCode = courseCode.trim() || subject.substring(0, 3).toUpperCase() + ' 101';

    const newSubj: EnrolledSubject = {
      id: `subj-${Date.now()}`,
      name: courseName.trim(),
      code: finalCode,
      department: subject.trim(),
      overallMastery: 0,
      examDate: examDate.trim() || 'Scheduled Assessment',
      daysToExam: 30,
      totalTopics: 0,
      masteredTopics: 0,
      weeklyHoursLogged: 0,
      dailyGoalMinutes: dailyMinutes,
      active: true
    };

    onAddNewSubject(newSubj);
    setSuccessNotification(`Successfully created and enrolled in ${newSubj.code}: ${newSubj.name}!`);
    setIsModalOpen(false);

    // Reset form
    setCourseName('');
    setSubject('');
    setCourseCode('');
    setExamDate('');
    setLearningGoals('');

    setTimeout(() => {
      setSuccessNotification(null);
    }, 4500);
  };

  return (
    <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Toast Notification */}
      {successNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
        <div>
          <h2 className="font-serif-display text-xl font-bold text-[#263F2B] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#697650]" />
            <span>Enrolled Subjects & Courses</span>
          </h2>
          <p className="text-xs text-[#5D655B] mt-0.5">
            Manage your academic curriculum. Switch active workspaces or add custom subjects anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Custom Subject</span>
        </button>
      </div>

      {/* Enrolled Courses Grid */}
      {enrolled.length === 0 ? (
        <div className="p-8 text-center bg-[#F8F7EF] rounded-xl border border-[#E1E4D8] space-y-2">
          <BookOpen className="w-8 h-8 text-[#697650] mx-auto" />
          <h4 className="text-xs font-semibold text-[#17241B]">No enrolled subjects yet</h4>
          <p className="text-[11px] text-[#5D655B] max-w-sm mx-auto">
            Click "+ Add Custom Subject" above to create any course with your own syllabus, exam dates, and daily study targets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolled.map((subj) => {
            const isActive = subj.code === profile.courseCode;
            return (
              <div
                key={subj.id}
                onClick={() => onSwitchSubject(subj)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'border-[#263F2B] bg-[#F1F2E6]/60 ring-1 ring-[#263F2B] shadow-xs'
                    : 'border-[#E1E4D8] bg-[#F8F7EF]/50 hover:bg-[#F8F7EF] hover:border-[#A8B594]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#697650]">{subj.code}</span>
                    {isActive ? (
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Active Workspace
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5D655B] hover:text-[#17241B]">
                        Click to switch →
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-[#17241B] line-clamp-1">{subj.name}</h3>
                  <p className="text-[11px] text-[#5D655B]">{subj.department}</p>
                </div>

                <div className="pt-2 border-t border-[#E1E4D8]/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-[#263F2B]">
                    {subj.overallMastery}% Mastery
                  </span>
                  <span className="text-[#697650]">
                    {subj.daysToExam ? `${subj.daysToExam}d to exam` : 'Self-paced'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Course Creation Modal with All Requested Fields */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#E1E4D8]">
              <div>
                <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                  Add Custom Subject & Course
                </h3>
                <p className="text-xs text-[#5D655B]">
                  Create any subject with your own schedule, exam date, and learning goals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#777E70] hover:text-[#17241B] p-1.5 rounded-lg cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#17241B] mb-1">
                  Course Name <span className="text-[#D71935]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Advanced Machine Learning, Microeconomics, Modern European History"
                  className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Academic Subject / Department <span className="text-[#D71935]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Computer Science, Economics, Physics"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS 401, ECON 202"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Academic Level</span>
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value="School">School / High School</option>
                    <option value="Undergraduate">Undergraduate (College)</option>
                    <option value="Graduate">Graduate / Master's / PhD</option>
                    <option value="Competitive Exam">Competitive Exam (GATE, JEE, GRE, USMLE)</option>
                    <option value="Professional">Professional Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Preferred Language</span>
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Target Exam Date (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="e.g. December 15, 2026"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Daily Study Target</span>
                  </label>
                  <select
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value={15}>15 minutes / day</option>
                    <option value={30}>30 minutes / day</option>
                    <option value={45}>45 minutes / day (Recommended)</option>
                    <option value={60}>60 minutes / day</option>
                    <option value={90}>90 minutes / day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#697650]" />
                  <span>Learning Goals (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g. Master core algorithms, achieve >85% on final exam, understand graph theory proofs"
                  className="w-full px-3.5 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E1E4D8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-[#5D655B] hover:text-[#17241B] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
