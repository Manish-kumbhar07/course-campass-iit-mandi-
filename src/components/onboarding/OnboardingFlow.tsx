import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { AppRoute } from '../../types';
import {
  BookOpen,
  Calendar,
  Clock,
  Globe,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (courseData: {
    courseName: string;
    subject: string;
    code: string;
    examDate: string;
    dailyMinutes: number;
    language: string;
    difficulties: string[];
    takeDiagnostic: boolean;
  }) => void;
  onNavigate: (route: AppRoute) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onNavigate
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form states
  const [courseName, setCourseName] = useState('Data Structures: Recursion and Graphs');
  const [subject, setSubject] = useState('Computer Science');
  const [code, setCode] = useState('CS 204');
  const [academicLevel, setAcademicLevel] = useState('Second-year Undergraduate');
  const [examDate, setExamDate] = useState('October 25, 2026');
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [language, setLanguage] = useState('English');
  const [difficulties, setDifficulties] = useState<string[]>([
    'Recursion base case termination conditions',
    'Graph traversal prerequisites (Call stack vs. Queue mechanics)'
  ]);
  const [takeDiagnostic, setTakeDiagnostic] = useState(true);

  const availableDifficulties = [
    'Recursion base case termination conditions',
    'Graph traversal prerequisites (Call stack vs. Queue mechanics)',
    'Cycle detection in directed graphs (Three-coloring)',
    'Topological Sorting & Kahn Algorithm',
    'Binary Search Tree balancing & rotations',
    'Dynamic Programming memoization tables'
  ];

  const toggleDifficulty = (item: string) => {
    if (difficulties.includes(item)) {
      setDifficulties(difficulties.filter((d) => d !== item));
    } else {
      setDifficulties([...difficulties, item]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        courseName,
        subject,
        code,
        examDate,
        dailyMinutes,
        language,
        difficulties,
        takeDiagnostic
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7EF] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#E1E4D8]">
        <Logo size="sm" />
        <div className="flex items-center gap-2 text-xs text-[#5D655B]">
          <span className="font-mono-code">Step {currentStep} of {totalSteps}</span>
          <div className="w-24 h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#263F2B] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Step Container */}
      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          {/* STEP 1: What are you studying? */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
                  Course Setup
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
                  What are you studying?
                </h2>
                <p className="text-xs text-[#5D655B]">
                  Tell us about the upcoming course or examination you need to prepare for.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Data Structures: Recursion and Graphs"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#17241B] mb-1">
                      Academic Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#17241B] mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. CS 204"
                      className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Level & Target Exam Date */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
                  Timeline & Context
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
                  Your level and target date
                </h2>
                <p className="text-xs text-[#5D655B]">
                  This helps CourseCompass calibrate explanation depth and pacing.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Academic Level
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value="First-year Undergraduate">First-year Undergraduate</option>
                    <option value="Second-year Undergraduate">Second-year Undergraduate</option>
                    <option value="Upper-division Undergraduate">Upper-division Undergraduate</option>
                    <option value="Graduate / Master's">Graduate / Master's</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Target Examination Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#777E70] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      placeholder="e.g. October 25, 2026"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Daily Study Time & Language */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
                  Pacing Parameters
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
                  Daily study commitment
                </h2>
                <p className="text-xs text-[#5D655B]">
                  How much uninterrupted time can you allocate per day?
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#17241B] mb-2">
                    Available Study Time Per Day
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setDailyMinutes(mins)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          dailyMinutes === mins
                            ? 'border-[#263F2B] bg-[#263F2B] text-white shadow-xs font-semibold'
                            : 'border-[#E1E4D8] bg-[#F8F7EF] text-[#5D655B] hover:text-[#17241B]'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1 opacity-80" />
                        <span>{mins} min/day</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#697650] mt-2">
                    45 minutes provides an ideal balance: 15m reading, 15m diagnostic drill, 15m Socratic practice.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Preferred Language for Tutor Explanations
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#777E70] absolute left-3 top-3" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: What do you need help with? */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
                  Diagnostic Targeting
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
                  What do you find most challenging?
                </h2>
                <p className="text-xs text-[#5D655B]">
                  Select the topics where you currently feel uncertain.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                {availableDifficulties.map((diff) => {
                  const isChecked = difficulties.includes(diff);
                  return (
                    <div
                      key={diff}
                      onClick={() => toggleDifficulty(diff)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'border-[#A8B594] bg-[#F1F2E6] text-[#17241B] font-medium'
                          : 'border-[#E1E4D8] bg-[#F8F7EF]/50 text-[#5D655B]'
                      }`}
                    >
                      <span>{diff}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isChecked ? 'border-[#263F2B] bg-[#263F2B] text-white' : 'border-[#A8B594]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#E1E4D8]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#17241B]">
                  <input
                    type="checkbox"
                    checked={takeDiagnostic}
                    onChange={(e) => setTakeDiagnostic(e.target.checked)}
                    className="rounded border-[#A8B594] text-[#263F2B] focus:ring-[#263F2B]"
                  />
                  <span>Generate an initial 3-question adaptive diagnostic quiz immediately</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Final State - Ready */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
                  Setup Complete
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
                  Your study path is ready.
                </h2>
                <p className="text-xs text-[#5D655B] max-w-md mx-auto leading-relaxed">
                  We have mapped out your prerequisite journey for <strong>{courseName}</strong> ({code}).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-[#E1E4D8]">
                  <span className="text-[#697650]">Selected Course:</span>
                  <span className="font-semibold text-[#17241B]">{code}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E1E4D8]">
                  <span className="text-[#697650]">Daily Time Commitment:</span>
                  <span className="font-mono-code font-bold text-[#263F2B]">{dailyMinutes} min/day</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E1E4D8]">
                  <span className="text-[#697650]">Target Exam:</span>
                  <span className="font-medium text-[#17241B]">{examDate}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-[#697650] font-semibold block uppercase">First Recommended Action:</span>
                  <p className="text-[#263F2B] font-medium">
                    Review Call Stack Mechanics & Take Recursion Base Case Diagnostic
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#E1E4D8] flex items-center justify-between">
            {currentStep > 1 && currentStep < 5 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-medium text-[#5D655B] hover:text-[#17241B] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-[#777E70] hover:text-[#17241B] underline"
                >
                  Skip to finish
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>{currentStep === 5 ? 'Enter My Course Workspace' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-[11px] text-[#777E70] mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#697650]" />
          <span>Course parameters and academic materials remain in your private workspace.</span>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#777E70]">
        CourseCompass · Academic Learning Architecture
      </div>
    </div>
  );
};
