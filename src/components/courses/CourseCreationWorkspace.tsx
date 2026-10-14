import React, { useState } from 'react';
import { AppRoute, CourseDocument } from '../../types';
import {
  UploadCloud,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';
import { Api } from '../../services/api-client';
import { UploadDropzone } from '../common/UploadDropzone';

interface CourseCreationWorkspaceProps {
  onCourseCreated: (newCourseData: {
    id?: string;
    name: string;
    code: string;
    subject: string;
    examDate: string;
    dailyStudyMinutes?: number;
    documents: CourseDocument[];
  }) => void;
  onNavigate: (route: AppRoute) => void;
}

export const CourseCreationWorkspace: React.FC<CourseCreationWorkspaceProps> = ({
  onCourseCreated,
  onNavigate
}) => {
  const [step, setStep] = useState<'details' | 'upload'>('details');

  // Form states
  const [courseName, setCourseName] = useState('');
  const [subject, setSubject] = useState('');
  const [code, setCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(45);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Created course state
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<CourseDocument[]>([]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseName.trim()) {
      setError('Please provide a course title.');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide an academic subject.');
      return;
    }

    const finalCode = code.trim() || subject.substring(0, 3).toUpperCase() + ' 101';

    setIsLoading(true);
    try {
      const course = await Api.courses.create({
        name: courseName.trim(),
        code: finalCode,
        subject: subject.trim(),
        examDate: examDate.trim() || undefined,
        dailyStudyMinutes: dailyMinutes
      });

      setCreatedCourseId(course.id);
      setCode(finalCode);
      setStep('upload');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onCourseCreated({
      id: createdCourseId || undefined,
      name: courseName,
      code,
      subject,
      examDate,
      dailyStudyMinutes: dailyMinutes,
      documents: uploadedDocuments
    });
    onNavigate('/app/overview');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-0 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-[#E1E4D8]">
        <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
          Course Workspace Initialization
        </span>
        <h1 className="font-serif-display text-3xl font-bold text-[#263F2B]">
          {step === 'details' ? 'Create New Course' : `Upload Materials for ${code}`}
        </h1>
        <p className="text-xs sm:text-sm text-[#5D655B]">
          {step === 'details'
            ? 'Set up your academic subject to build personalized study paths, prerequisite graphs, and grounded AI tutoring.'
            : 'Add your lecture recordings, slide presentations, textbook chapters, or diagrams. CourseCompass extracts conceptual dependencies.'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 text-xs font-medium">
        <div
          className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
            step === 'details'
              ? 'border-[#263F2B] text-[#263F2B] font-bold'
              : 'border-transparent text-[#777E70]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#263F2B] text-white flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Course Details</span>
        </div>
        <div
          className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
            step === 'upload'
              ? 'border-[#263F2B] text-[#263F2B] font-bold'
              : 'border-transparent text-[#777E70]'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 'upload' ? 'bg-[#263F2B] text-white' : 'bg-[#E1E4D8] text-[#5D655B]'
            }`}
          >
            2
          </span>
          <span>Upload Study Materials</span>
        </div>
      </div>

      {/* Step 1: Course Details */}
      {step === 'details' && (
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <h3 className="text-sm font-semibold text-[#17241B] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#697650]" />
              <span>Academic Course Information</span>
            </h3>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] flex items-center gap-2 text-xs text-[#D71935]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#17241B] mb-1">
                  Course Title <span className="text-[#D71935]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Molecular Biology & Genetics"
                  className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Academic Subject <span className="text-[#D71935]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Biology"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Course Code <span className="text-[#777E70] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BIO 201"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Target Exam Date (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="e.g. November 15, 2026"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Daily Study Target (Minutes)</span>
                  </label>
                  <select
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value={30}>30 minutes / day</option>
                    <option value={45}>45 minutes / day (Recommended)</option>
                    <option value={60}>60 minutes / day</option>
                    <option value={90}>90 minutes / day</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/app/overview')}
              className="text-xs text-[#5D655B] hover:text-[#17241B]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <span>Create Course & Continue to Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Upload Material */}
      {step === 'upload' && createdCourseId && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
              <div>
                <h3 className="text-sm font-semibold text-[#17241B]">Upload Course Materials</h3>
                <p className="text-xs text-[#5D655B]">
                  Course: <strong className="text-[#263F2B]">{courseName}</strong> ({code})
                </p>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                Course Created
              </span>
            </div>

            <UploadDropzone
              courseId={createdCourseId}
              onUploadSuccess={(doc) => {
                setUploadedDocuments((prev) => [doc, ...prev]);
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs text-[#5D655B] hover:text-[#17241B]"
            >
              Skip uploading for now
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#DCE5CE]" />
              <span>Go to Course Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Assurance */}
      <div className="p-4 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] flex items-start gap-3 text-xs text-[#5D655B]">
        <ShieldCheck className="w-5 h-5 text-[#697650] shrink-0 mt-0.5" />
        <p>
          All uploaded lecture videos, slide presentations, and notes are encrypted and isolated within your private student account. They are exclusively used for ground-truth verification and adaptive learning.
        </p>
      </div>
    </div>
  );
};
