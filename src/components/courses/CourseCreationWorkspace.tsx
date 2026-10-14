import React, { useState } from 'react';
import { AppRoute, CourseDocument, DocumentType } from '../../types';
import {
  UploadCloud,
  FileText,
  Video,
  Presentation,
  Headphones,
  Image,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface CourseCreationWorkspaceProps {
  onCourseCreated: (newCourseData: {
    name: string;
    subject: string;
    examDate: string;
    documents: CourseDocument[];
  }) => void;
  onNavigate: (route: AppRoute) => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  type: DocumentType;
  sizeFormatted: string;
  sizeBytes: number;
  status: 'ready' | 'uploading' | 'error';
}

export const CourseCreationWorkspace: React.FC<CourseCreationWorkspaceProps> = ({
  onCourseCreated,
  onNavigate
}) => {
  const [courseName, setCourseName] = useState('Data Structures: Recursion and Graphs');
  const [subject, setSubject] = useState('Computer Science');
  const [examDate, setExamDate] = useState('October 25, 2026');

  // File list state
  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: 'f-1',
      name: 'Lecture 08 - Recursive Call Stack & Base Cases.mp4',
      type: 'video',
      sizeFormatted: '482 MB',
      sizeBytes: 505413632,
      status: 'ready'
    },
    {
      id: 'f-2',
      name: 'Introduction to Algorithms - Chapter 4 Recursion.pdf',
      type: 'pdf',
      sizeFormatted: '14.2 MB',
      sizeBytes: 14889728,
      status: 'ready'
    },
    {
      id: 'f-3',
      name: 'Lecture 12 Slides - Graph Representations & DFS.pptx',
      type: 'slides',
      sizeFormatted: '8.6 MB',
      sizeBytes: 9017753,
      status: 'ready'
    }
  ]);

  // 7-Stage Processing Simulator State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const processingStages = [
    { title: 'Secure upload', desc: 'Validating cryptographic container and file signatures' },
    { title: 'Reading content', desc: 'Extracting formatted text, headings, and code blocks' },
    { title: 'Understanding diagrams', desc: 'Analyzing whiteboard diagrams and graph visual trees' },
    { title: 'Transcribing lecture', desc: 'Generating timestamped speech-to-text transcript' },
    { title: 'Finding concepts', desc: 'Isolating key topics, theorems, and definitions' },
    { title: 'Building prerequisites', desc: 'Constructing dependency edges between memory & graph concepts' },
    { title: 'Preparing your study space', desc: 'Generating diagnostic quiz seeds and flashcard summaries' }
  ];

  const handleAddSampleFile = (type: DocumentType) => {
    const sampleNames: Record<DocumentType, { name: string; size: string }> = {
      video: { name: 'Recitation 04 - Stack Frames Memory Trace.mp4', size: '210 MB' },
      pdf: { name: 'Lab 3 Handout - Recursion Induction.pdf', size: '2.4 MB' },
      slides: { name: 'Lecture 13 - BFS & Shortest Paths.pptx', size: '6.1 MB' },
      audio: { name: 'Henderson Office Hours - Graph Traversal.m4a', size: '18.4 MB' },
      image: { name: 'Whiteboard - Three Color DFS Diagram.png', size: '3.8 MB' },
      notes: { name: 'Student Handwritten Notes - Call Stack.pdf', size: '1.2 MB' }
    };

    const newFile: UploadedFileItem = {
      id: `f-${Date.now()}`,
      name: sampleNames[type].name,
      type,
      sizeFormatted: sampleNames[type].size,
      sizeBytes: 1024 * 1024 * 5,
      status: 'ready'
    };

    setFiles([...files, newFile]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleStartProcessing = () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setCurrentStageIndex(0);
    setProgressPercent(10);

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        const next = prev + 1;
        if (next < processingStages.length) {
          setProgressPercent(Math.round(((next + 1) / processingStages.length) * 100));
          return next;
        } else {
          clearInterval(stageInterval);
          setTimeout(() => {
            setIsProcessing(false);
            const courseDocuments: CourseDocument[] = files.map((f) => ({
              id: f.id,
              title: f.name,
              type: f.type,
              formattedSize: f.sizeFormatted,
              durationOrPages: f.type === 'video' ? '48 min' : f.type === 'pdf' ? '34 pgs' : '38 slides',
              status: 'indexed',
              extractedConcepts: ['Call Stack', 'Base Cases', 'DFS Traversal']
            }));

            onCourseCreated({
              name: courseName,
              subject,
              examDate,
              documents: courseDocuments
            });
            onNavigate('/app/overview');
          }, 800);
          return prev;
        }
      });
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4 sm:px-0 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-[#E1E4D8]">
        <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider">
          Multi-Modal Course Ingestion
        </span>
        <h1 className="font-serif-display text-3xl font-bold text-[#263F2B]">
          Create Course Workspace & Upload Materials
        </h1>
        <p className="text-xs sm:text-sm text-[#5D655B]">
          Upload your lectures, slide decks, readings, and audio office hours. CourseCompass will extract the underlying prerequisite knowledge tree.
        </p>
      </div>

      {!isProcessing ? (
        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-[#17241B]">Course Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#17241B] mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#17241B] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>
              <div>
                <label className="block font-medium text-[#17241B] mb-1">Target Exam Date</label>
                <input
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div className="bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E1E4D8]">
              <h3 className="text-sm font-semibold text-[#17241B]">Upload Academic Materials</h3>
              <span className="text-[11px] text-[#697650] font-mono-code">PDF, PPTX, MP4, Audio</span>
            </div>

            <div className="border-2 border-dashed border-[#A8B594] rounded-2xl p-8 bg-[#F8F7EF] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#17241B]">
                  Drag and drop lecture files, textbook chapters, or slides here
                </p>
                <p className="text-xs text-[#5D655B]">
                  Supports PDF textbooks, PPTX decks, MP4 video recordings, and M4A audio office hours
                </p>
              </div>

              {/* Sample file buttons */}
              <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleAddSampleFile('video')}
                  className="px-3 py-1.5 bg-white border border-[#E1E4D8] rounded-lg text-[#263F2B] hover:bg-[#DCE5CE] font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <Video className="w-3.5 h-3.5 text-[#D71935]" /> + Add Lecture Video
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleFile('pdf')}
                  className="px-3 py-1.5 bg-white border border-[#E1E4D8] rounded-lg text-[#263F2B] hover:bg-[#DCE5CE] font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#263F2B]" /> + Add Textbook PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleFile('slides')}
                  className="px-3 py-1.5 bg-white border border-[#E1E4D8] rounded-lg text-[#263F2B] hover:bg-[#DCE5CE] font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <Presentation className="w-3.5 h-3.5 text-[#263F2B]" /> + Add Slide Deck
                </button>
              </div>
            </div>

            {/* Uploaded Files Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#697650] uppercase tracking-wider block">
                Queued Course Files ({files.length}):
              </span>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-7 h-7 rounded bg-white text-[#263F2B] flex items-center justify-center border border-[#E1E4D8] shrink-0">
                        {file.type === 'video' && <Video className="w-4 h-4 text-[#D71935]" />}
                        {file.type === 'pdf' && <FileText className="w-4 h-4 text-[#263F2B]" />}
                        {file.type === 'slides' && <Presentation className="w-4 h-4 text-[#263F2B]" />}
                        {file.type === 'audio' && <Headphones className="w-4 h-4 text-[#263F2B]" />}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-[#17241B] truncate">{file.name}</p>
                        <p className="text-[11px] text-[#5D655B]">{file.sizeFormatted} · Ready for pipeline</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 text-[#777E70] hover:text-[#D71935] hover:bg-rose-50 rounded transition-colors ml-2"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Note and Start CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE]">
            <div className="flex items-center gap-2 text-xs text-[#5D655B]">
              <ShieldCheck className="w-4 h-4 text-[#263F2B] shrink-0" />
              <span>
                Uploaded files are stored within your private course workspace and never shared publicly.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartProcessing}
              disabled={files.length === 0}
              className="px-6 py-3 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              <span>Build My Study Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* The 7-Stage Multi-Modal Ingestion Pipeline in Progress */
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-8 sm:p-12 shadow-sm text-center space-y-8 animate-in fade-in duration-200">
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-[#263F2B] text-white flex items-center justify-center mx-auto shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-[#DCE5CE]" />
            </div>
            <h2 className="font-serif-display text-2xl font-bold text-[#263F2B]">
              Synthesizing Courseware & Building Knowledge Map
            </h2>
            <p className="text-xs text-[#5D655B]">
              Stage {currentStageIndex + 1} of {processingStages.length}: <strong>{processingStages[currentStageIndex].title}</strong>
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full h-2.5 bg-[#F1F2E6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#263F2B] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="font-mono-code text-xs text-[#697650]">{progressPercent}% Completed</span>
          </div>

          {/* 7-Stage Visual Checklist */}
          <div className="max-w-md mx-auto text-left space-y-2.5 pt-4 border-t border-[#E1E4D8]">
            {processingStages.map((stage, idx) => {
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-[#F1F2E6] border-[#263F2B] font-medium'
                      : isDone
                      ? 'bg-[#F8F7EF] border-[#E1E4D8] text-[#17241B]'
                      : 'bg-white border-[#E1E4D8]/50 text-[#777E70] opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#263F2B] animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#A8B594]"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{idx + 1}. {stage.title}</p>
                    <p className="text-[11px] text-[#5D655B]">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
