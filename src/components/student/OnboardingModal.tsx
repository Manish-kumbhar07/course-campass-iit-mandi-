import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { X, Calendar, Clock, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updatedProfile: Partial<StudentProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyStudyMinutes);
  const [examDate, setExamDate] = useState(profile.examDate);
  const [currentCourse, setCurrentCourse] = useState(profile.currentCourse);
  const [weakFocus, setWeakFocus] = useState<string[]>([...profile.weakPoints]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      dailyStudyMinutes: dailyMinutes,
      examDate,
      currentCourse,
      weakPoints: weakFocus
    });
    onClose();
  };

  const availableDifficulties = [
    'Recursion base case termination conditions',
    'Graph traversal prerequisites (Call stack vs. Queue mechanics)',
    'Cycle detection in directed graphs',
    'Topological Sorting & Kahn Algorithm',
    'Binary Search Tree Balancing'
  ];

  const toggleDifficulty = (item: string) => {
    if (weakFocus.includes(item)) {
      setWeakFocus(weakFocus.filter((w) => w !== item));
    } else {
      setWeakFocus([...weakFocus, item]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white border border-[#E1E4D8] rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8F7EF] border-b border-[#E1E4D8]">
          <div className="space-y-0.5">
            <h3 className="font-serif-display text-lg font-bold text-[#263F2B]">
              Personalized Study Parameters
            </h3>
            <p className="text-xs text-[#5D655B]">
              Configured for student {profile.name} · {profile.courseCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5D655B] hover:text-[#17241B] hover:bg-[#E1E4D8]/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {/* Daily Study Time Budget */}
          <div className="space-y-2">
            <label className="font-semibold text-[#17241B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#697650]" />
              Daily Study Time Commitment
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDailyMinutes(mins)}
                  className={`py-2 text-center rounded-lg border font-medium transition-colors ${
                    dailyMinutes === mins
                      ? 'border-[#263F2B] bg-[#263F2B] text-white'
                      : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B] hover:text-[#17241B]'
                  }`}
                >
                  {mins} min/day
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#697650]">
              Recommended for Ananya: 45 minutes/day (balances 15m review, 15m quiz, 15m tutor practice).
            </p>
          </div>

          {/* Exam Date */}
          <div className="space-y-2">
            <label className="font-semibold text-[#17241B] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#697650]" />
              Target Examination Date
            </label>
            <input
              type="text"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
            />
          </div>

          {/* Targeted Difficulties */}
          <div className="space-y-2">
            <label className="font-semibold text-[#17241B] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D71935]" />
              Active Diagnostic Weak Spots to Prioritize
            </label>
            <div className="space-y-1.5">
              {availableDifficulties.map((item) => {
                const isChecked = weakFocus.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleDifficulty(item)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                      isChecked
                        ? 'bg-[#F1F2E6] border-[#A8B594] text-[#17241B] font-medium'
                        : 'bg-[#F8F7EF]/50 border-[#E1E4D8] text-[#5D655B]'
                    }`}
                  >
                    <span>{item}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-[#263F2B] bg-[#263F2B] text-white' : 'border-[#A8B594]'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E1E4D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#5D655B] hover:text-[#17241B] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-semibold shadow-xs"
            >
              Update Study Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
