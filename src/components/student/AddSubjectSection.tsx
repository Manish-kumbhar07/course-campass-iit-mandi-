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
  ChevronRight
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

  // Form state
  const [subjectName, setSubjectName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [examDate, setExamDate] = useState('November 20, 2026');
  const [dailyMinutes, setDailyMinutes] = useState(45);

  const enrolled = profile.enrolledSubjects || [
    {
      id: 'subj-cs204',
      name: profile.currentCourse || 'Data Structures: Recursion and Graphs',
      code: profile.courseCode || 'CS 204',
      department: 'Computer Science',
      overallMastery: profile.overallMastery || 74,
      examDate: profile.examDate || 'October 25, 2026',
      daysToExam: profile.examCountdownDays || 12,
      totalTopics: 16,
      masteredTopics: 12,
      weeklyHoursLogged: 6.5,
      active: true
    }
  ];

  // Curated popular subjects for instant 1-click addition
  const presetSubjects = [
    {
      name: 'Organic Chemistry I: Mechanisms',
      code: 'CHEM 210',
      department: 'Chemistry & Life Sciences',
      examDate: 'November 18, 2026',
      dailyMinutes: 45
    },
    {
      name: 'Linear Algebra & Matrix Analysis',
      code: 'MATH 225',
      department: 'Mathematics',
      examDate: 'December 02, 2026',
      dailyMinutes: 40
    },
    {
      name: 'Classical Mechanics & Oscillations',
      code: 'PHYS 150',
      department: 'Physics',
      examDate: 'November 28, 2026',
      dailyMinutes: 50
    },
    {
      name: 'Microeconomic Theory & Applications',
      code: 'ECON 202',
      department: 'Economics',
      examDate: 'December 10, 2026',
      dailyMinutes: 35
    }
  ];

  const handleSelectPreset = (preset: typeof presetSubjects[0]) => {
    setSubjectName(preset.name);
    setCourseCode(preset.code);
    setDepartment(preset.department);
    setExamDate(preset.examDate);
    setDailyMinutes(preset.dailyMinutes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const newSubj: EnrolledSubject = {
      id: `subj-${Date.now()}`,
      name: subjectName.trim(),
      code: courseCode.trim() || 'SUBJ 101',
      department: department.trim() || 'General Studies',
      overallMastery: 20, // Initial baseline for fresh subject
      examDate: examDate.trim() || 'December 15, 2026',
      daysToExam: 35,
      totalTopics: 12,
      masteredTopics: 2,
      weeklyHoursLogged: 0.5,
      dailyGoalMinutes: dailyMinutes,
      active: true
    };

    onAddNewSubject(newSubj);
    setSuccessNotification(`Successfully enrolled in ${newSubj.code}: ${newSubj.name}!`);
    setIsModalOpen(false);

    // Reset form
    setSubjectName('');
    setCourseCode('');

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
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAEFE4] text-[#263F2B]">
              <GraduationCap className="w-4 h-4" />
            </span>
            <h2 className="font-serif-display text-lg font-bold text-[#263F2B]">
              My Enrolled Subjects
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F2E6] text-[#263F2B] border border-[#DCE5CE]">
              {enrolled.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-[#5D655B] mt-0.5">
            Switch between your courses to view customized progress reports, or enroll in a new subject.
          </p>
        </div>

        {/* Primary Add New Subject Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#263F2B] hover:bg-[#1e3222] text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enrolled.map((subject) => {
          const isActive = subject.code === profile.courseCode || subject.active;

          return (
            <div
              key={subject.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-[#F9FAF6] to-white border-[#263F2B] ring-1 ring-[#263F2B]/20 shadow-xs'
                  : 'bg-white border-[#E1E4D8] hover:border-[#A8B594]'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge: Department & Active Status */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F1F2E6] text-[#697650]">
                    {subject.department}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Active Subject
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#777E70] font-mono">
                      {subject.daysToExam}d to exam
                    </span>
                  )}
                </div>

                {/* Subject Title */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-code font-bold text-xs text-[#263F2B]">
                      {subject.code}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#17241B] line-clamp-1 mt-0.5">
                    {subject.name}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5D655B] text-[11px]">Subject Progress</span>
                    <span className="font-mono-code font-bold text-[#17241B]">
                      {subject.overallMastery}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F2E6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subject.overallMastery >= 70
                          ? 'bg-[#263F2B]'
                          : subject.overallMastery >= 50
                          ? 'bg-[#5B7552]'
                          : 'bg-[#A8B594]'
                      }`}
                      style={{ width: `${subject.overallMastery}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#777E70] pt-0.5">
                    <span>{subject.masteredTopics} / {subject.totalTopics} Topics</span>
                    <span>{subject.weeklyHoursLogged}h logged</span>
                  </div>
                </div>
              </div>

              {/* Action Bottom */}
              <div className="pt-4 mt-4 border-t border-[#E1E4D8]/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-[#5D655B]">
                  <Calendar className="w-3 h-3 text-[#697650]" />
                  <span>{subject.examDate}</span>
                </div>

                {isActive ? (
                  <span className="text-xs font-semibold text-[#263F2B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Tracking Now
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSwitchSubject(subject)}
                    className="text-xs font-medium text-[#263F2B] hover:text-[#17241B] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Big Add Subject Card inside Grid */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-xl border-2 border-dashed border-[#D4DCC9] hover:border-[#263F2B] bg-[#FAF9F5] hover:bg-[#F4F6EE] transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer group min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-full bg-[#EAEFE4] group-hover:bg-[#263F2B] group-hover:text-white text-[#263F2B] flex items-center justify-center transition-all shadow-xs">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-[#17241B] group-hover:text-[#263F2B]">
              Enroll in a New Subject
            </h4>
            <p className="text-[11px] text-[#777E70] max-w-[200px] mt-0.5">
              Add your lecture slides, notes, or course code to start tracking.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#263F2B] group-hover:underline flex items-center gap-1 mt-1">
            + Quick Add Subject
          </span>
        </button>
      </div>

      {/* Add New Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17241B]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E1E4D8] space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#EAEFE4] text-[#263F2B]">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-[#263F2B]">
                    Add New Subject to Dashboard
                  </h3>
                  <p className="text-xs text-[#5D655B]">
                    Create a dedicated progress tracking workspace for your course.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#777E70] hover:text-[#17241B] rounded-lg hover:bg-[#F1F2E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#697650] uppercase tracking-wider block">
                Quick-Pick Popular Subjects:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {presetSubjects.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2 text-left rounded-lg bg-[#F8F7EF] hover:bg-[#EAEFE4] border border-[#E1E4D8] transition-colors"
                  >
                    <span className="font-mono-code font-bold text-[#263F2B] block text-[11px]">
                      {preset.code}
                    </span>
                    <span className="text-[11px] text-[#17241B] font-medium line-clamp-1">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#17241B] mb-1">
                  Subject / Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Linear Algebra & Vector Spaces"
                  className="w-full px-3 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17241B] mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. MATH 201"
                    className="w-full px-3 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17241B] mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Life Sciences">Life Sciences</option>
                    <option value="Economics">Economics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17241B] mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="e.g. November 20, 2026"
                    className="w-full px-3 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17241B] mb-1">
                    Daily Study Target
                  </label>
                  <select
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#E1E4D8] rounded-xl bg-[#F8F7EF] focus:bg-white focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value={30}>30 min / day</option>
                    <option value={45}>45 min / day (Recommended)</option>
                    <option value={60}>60 min / day</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E1E4D8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#5D655B] hover:text-[#17241B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#263F2B] hover:bg-[#1e3222] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enroll Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
