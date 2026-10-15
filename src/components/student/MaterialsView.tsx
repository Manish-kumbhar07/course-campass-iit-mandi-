import React, { useState } from 'react';
import {
  CourseMaterial,
  MaterialType,
  SourceCitation,
  YouTubeSummary,
  YouTubeSection
} from '../../types';
import {
  UploadCloud,
  FileText,
  Video,
  Presentation,
  Headphones,
  BookOpen,
  Image,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  Bot,
  Brain,
  Layers,
  Filter,
  Loader2,
  Globe,
  Play
} from 'lucide-react';
import { UploadDropzone } from '../common/UploadDropzone';
import { Api } from '../../services/api-client';

interface MaterialsViewProps {
  courseId?: string;
  materials: CourseMaterial[];
  onAddMaterial: (material: CourseMaterial) => void;
  onRemoveMaterial?: (materialId: string) => void;
  onInspectCitation: (citation: SourceCitation) => void;
  onAskTutorAboutSource?: (sourceTitle: string, initialPrompt?: string) => void;
  onGenerateQuizFromSource?: (sourceTitle: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  courseId,
  materials,
  onAddMaterial,
  onRemoveMaterial,
  onInspectCitation,
  onAskTutorAboutSource,
  onGenerateQuizFromSource
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'youtube'>('library');
  const [filterType, setFilterType] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // YouTube Ingestion State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeLang, setYoutubeLang] = useState('English');
  const [isAnalyzingYoutube, setIsAnalyzingYoutube] = useState(false);
  const [youtubeStage, setYoutubeStage] = useState<string>('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [analyzedSummary, setAnalyzedSummary] = useState<YouTubeSummary | null>(null);

  const handleDelete = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to remove this material from the course?')) {
      return;
    }
    setDeletingId(materialId);
    try {
      await Api.courses.delete(`${materialId}`);
      if (onRemoveMaterial) {
        onRemoveMaterial(materialId);
      }
    } catch {
      if (onRemoveMaterial) {
        onRemoveMaterial(materialId);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyzeYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setYoutubeError(null);
    setIsAnalyzingYoutube(true);
    setYoutubeStage('Validating YouTube video link...');

    try {
      setYoutubeStage('Extracting transcript and timestamps...');
      const summary = await Api.youtube.analyze(
        courseId || 'course-cs204',
        {
          url: youtubeUrl.trim(),
          title: youtubeTitle.trim() || undefined,
          language: youtubeLang
        }
      );

      setYoutubeStage('Indexing into course grounded knowledge corpus...');
      setAnalyzedSummary(summary);

      // Add to material list as indexed source
      const newDoc: CourseMaterial = {
        id: summary.source_id,
        courseId: courseId || 'course-cs204',
        title: summary.title,
        type: 'youtube',
        durationOrPages: summary.duration_display,
        uploadedAt: 'Just now',
        status: 'ready',
        summary: summary.overview,
        extractedConcepts: summary.sections.map((s) => s.heading)
      };

      onAddMaterial(newDoc);
      setYoutubeStage('Analysis complete!');
    } catch (err: unknown) {
      setYoutubeError(
        err instanceof Error ? err.message : 'Failed to analyze YouTube video. Please verify the URL and try again.'
      );
    } finally {
      setIsAnalyzingYoutube(false);
    }
  };

  const renderIcon = (type: MaterialType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-700" />;
      case 'youtube':
        return <Play className="w-4 h-4 text-[#D71935]" />;
      case 'slides':
        return <Presentation className="w-4 h-4 text-amber-700" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-emerald-700" />;
      case 'image':
        return <Image className="w-4 h-4 text-sky-700" />;
      default:
        return <FileText className="w-4 h-4 text-[#263F2B]" />;
    }
  };

  // Filtered materials
  const filteredMaterials = materials.filter((m) => {
    if (filterType === 'all') return true;
    if (filterType === 'pdf') return m.type === 'pdf';
    if (filterType === 'video') return m.type === 'video';
    if (filterType === 'youtube') return m.type === 'youtube';
    if (filterType === 'slides') return m.type === 'slides';
    if (filterType === 'audio') return m.type === 'audio';
    if (filterType === 'image') return m.type === 'image';
    if (filterType === 'ready') return m.status === 'ready' || m.status === 'processed';
    if (filterType === 'processing') return m.status === 'processing';
    if (filterType === 'failed') return m.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
              <UploadCloud className="w-4 h-4 text-[#263F2B]" />
              <span>Multi-Modal Source Ingestion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-[#263F2B]">
              Course Study Materials & Ingestion
            </h2>
            <p className="text-xs text-[#5D655B]">
              Transform lecture videos, PDFs, presentations, audio notes, and YouTube lectures into verified learning nodes.
            </p>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F1F2E6] border border-[#E1E4D8] rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-[#263F2B] font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              Source Library ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-[#263F2B] font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              + Upload Files
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'youtube'
                  ? 'bg-white text-[#D71935] font-bold shadow-xs'
                  : 'text-[#5D655B] hover:text-[#17241B]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#D71935]" />
              <span>+ Add YouTube</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SOURCE LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-[#697650] flex items-center gap-1 pr-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            {[
              { id: 'all', label: `All (${materials.length})` },
              { id: 'pdf', label: 'PDFs' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'video', label: 'Videos' },
              { id: 'slides', label: 'Slides' },
              { id: 'audio', label: 'Audio' },
              { id: 'image', label: 'Images' },
              { id: 'ready', label: 'Ready' },
              { id: 'processing', label: 'Processing' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === f.id
                    ? 'bg-[#263F2B] text-white border-[#263F2B] font-semibold'
                    : 'bg-white text-[#5D655B] border-[#E1E4D8] hover:bg-[#F8F7EF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredMaterials.length === 0 ? (
            <div className="bg-white border border-[#E1E4D8] rounded-2xl p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F2E6] border border-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto shadow-2xs">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif-display text-xl font-bold text-[#17241B]">
                  No study material found
                </h3>
                <p className="text-xs text-[#5D655B] leading-relaxed">
                  Add your first PDF textbook, lecture recording, slide deck, or YouTube video to build your grounded knowledge corpus.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-5 py-2.5 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#DCE5CE]" />
                  <span>Upload files</span>
                </button>
                <button
                  onClick={() => setActiveTab('youtube')}
                  className="px-5 py-2.5 bg-white hover:bg-[#F8F7EF] border border-[#E1E4D8] text-[#D71935] rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Play className="w-4 h-4 text-[#D71935]" />
                  <span>Add YouTube link</span>
                </button>
              </div>
            </div>
          ) : (
            /* Materials Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-[#A8B594] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                        {renderIcon(m.type)}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#697650]">
                        <span className="font-mono-code">
                          {m.durationOrPages || m.pageCountOrDuration || m.formattedSize || 'Indexed'}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#17241B] line-clamp-2">
                        {m.title}
                      </h3>
                      {m.summary && (
                        <p className="text-xs text-[#5D655B] mt-1 leading-relaxed line-clamp-2">
                          {m.summary}
                        </p>
                      )}
                    </div>

                    {/* Extracted concepts badges */}
                    {m.extractedConcepts && m.extractedConcepts.length > 0 && (
                      <div className="pt-2 border-t border-[#E1E4D8] space-y-1">
                        <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block">
                          Indexed Concepts:
                        </span>
                        <div className="flex flex-wrap gap-1 text-[11px] text-[#263F2B]">
                          {m.extractedConcepts.slice(0, 3).map((c, i) => (
                            <span key={i} className="bg-[#F1F2E6] px-2 py-0.5 rounded border border-[#E1E4D8]">
                              {c}
                            </span>
                          ))}
                          {m.extractedConcepts.length > 3 && (
                            <span className="text-[10px] text-[#697650] self-center">
                              +{m.extractedConcepts.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#E1E4D8] space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          onAskTutorAboutSource?.(m.title, `Can you explain the main concepts covered in "${m.title}"?`);
                        }}
                        className="flex-1 py-1.5 px-2 bg-[#F1F2E6] hover:bg-[#EAEFE4] text-[#263F2B] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Ask AI Tutor about this source"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask Tutor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onGenerateQuizFromSource?.(m.title);
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-[#F8F7EF] border border-[#E1E4D8] text-[#17241B] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Generate Quiz from this source"
                      >
                        <Brain className="w-3.5 h-3.5 text-[#697650]" />
                        <span>Quiz</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        className="p-1.5 text-[#777E70] hover:text-[#D71935] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove source"
                        aria-label={`Remove ${m.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#777E70] pt-1">
                      <span>{m.uploadedAt || m.dateAdded || 'Ground-truth verified'}</span>
                      <span className="uppercase tracking-wider font-mono">{m.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: UPLOAD LOCAL FILES */}
      {activeTab === 'upload' && (
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
            <div>
              <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                Upload Course Materials
              </h3>
              <p className="text-xs text-[#5D655B]">
                Supports PDFs, videos (MP4/WebM), presentation slides (PPT/PPTX), audio lectures (MP3/M4A), and diagrams.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs text-[#5D655B] hover:text-[#17241B] cursor-pointer"
            >
              ← Back to Library
            </button>
          </div>

          <UploadDropzone
            courseId={courseId || 'course-cs204'}
            onUploadSuccess={(doc) => {
              onAddMaterial(doc);
              setActiveTab('library');
            }}
          />
        </div>
      )}

      {/* VIEW 3: ADD YOUTUBE LINK WORKFLOW */}
      {activeTab === 'youtube' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E4D8]">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#D71935]" />
                <div>
                  <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                    YouTube Lecture Ingestion & Summarization
                  </h3>
                  <p className="text-xs text-[#5D655B]">
                    Paste any public educational lecture or tutorial URL to extract structured timestamps, notes, definitions, and flashcards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs text-[#5D655B] hover:text-[#17241B] cursor-pointer"
              >
                ← Back to Library
              </button>
            </div>

            {/* Ingestion Form */}
            <form onSubmit={handleAnalyzeYoutube} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#17241B] mb-1">
                  YouTube Video URL <span className="text-[#D71935]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Lesson / Lecture Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    placeholder="e.g. Graph Algorithms: Depth First Search"
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#17241B] mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Video Language</span>
                  </label>
                  <select
                    value={youtubeLang}
                    onChange={(e) => setYoutubeLang(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF] focus:outline-none focus:border-[#263F2B]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                  </select>
                </div>
              </div>

              {youtubeError && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] flex items-center gap-2 text-[#D71935]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{youtubeError}</span>
                </div>
              )}

              {/* Progress Feedback */}
              {isAnalyzingYoutube && (
                <div className="p-4 rounded-xl bg-[#F1F2E6] border border-[#DCE5CE] flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#263F2B] animate-spin shrink-0" />
                  <div>
                    <span className="font-semibold text-xs text-[#263F2B] block">Processing YouTube Lecture</span>
                    <span className="text-[11px] text-[#5D655B]">{youtubeStage}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzingYoutube}
                className="px-6 py-2.5 bg-[#D71935] hover:bg-[#b0142b] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                {isAnalyzingYoutube ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Lecture...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Analyze Video & Index Into Course</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Analyzed YouTube Summary Output */}
          {analyzedSummary && (
            <div className="bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E4D8]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#697650]">
                    <span className="font-semibold text-[#263F2B]">{analyzedSummary.channel}</span>
                    <span>·</span>
                    <span>{analyzedSummary.duration_display}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Indexed into Course
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl font-bold text-[#17241B]">
                    {analyzedSummary.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAskTutorAboutSource?.(analyzedSummary.title);
                    }}
                    className="px-4 py-2 bg-[#263F2B] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask Tutor</span>
                  </button>
                  <button
                    onClick={() => {
                      onGenerateQuizFromSource?.(analyzedSummary.title);
                    }}
                    className="px-4 py-2 bg-[#F1F2E6] text-[#263F2B] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Generate Quiz</span>
                  </button>
                </div>
              </div>

              {/* Executive Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#17241B] uppercase tracking-wider">
                  Executive Overview
                </h4>
                <p className="text-xs text-[#5D655B] leading-relaxed bg-[#F8F7EF] p-4 rounded-xl border border-[#E1E4D8]">
                  {analyzedSummary.overview}
                </p>
              </div>

              {/* Timestamped Sections with Clickable Timestamps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#17241B] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#697650]" />
                  <span>Interactive Timestamped Sections</span>
                </h4>
                <div className="space-y-2.5">
                  {analyzedSummary.sections.map((sec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-[#E1E4D8] bg-[#FAF9F5] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#17241B]">{sec.heading}</span>
                        <a
                          href={`${analyzedSummary.url}&t=${sec.timestamp_seconds}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-[#263F2B] text-white text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-[#1e3222] transition-colors"
                          title="Open video at this timestamp"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{sec.timestamp_display}</span>
                        </a>
                      </div>
                      <p className="text-[#5D655B] text-[11px]">{sec.summary}</p>
                      {sec.key_points && sec.key_points.length > 0 && (
                        <ul className="list-disc pl-4 text-[11px] text-[#263F2B] space-y-0.5">
                          {sec.key_points.map((kp, j) => (
                            <li key={j}>{kp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Definitions & Confusing Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Core Definitions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#17241B] uppercase tracking-wider">
                    Core Definitions Extracted
                  </h4>
                  <div className="space-y-2">
                    {analyzedSummary.core_definitions.map((def, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-1 text-xs">
                        <span className="font-bold text-[#263F2B] block">{def.term}</span>
                        <p className="text-[11px] text-[#5D655B]">{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confusing Areas */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#17241B] uppercase tracking-wider">
                    Common Misconceptions Clarified
                  </h4>
                  <div className="space-y-2">
                    {analyzedSummary.confusing_areas.map((ca, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] space-y-1 text-xs">
                        <span className="font-bold text-[#D71935] block">{ca.topic}</span>
                        <p className="text-[11px] text-[#D71935]">
                          <strong>Misconception:</strong> {ca.common_misconception}
                        </p>
                        <p className="text-[11px] text-[#17241B] pt-1 border-t border-[#F8E2E3]">
                          <strong>Clarification:</strong> {ca.clarification}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Flashcards */}
              {analyzedSummary.suggested_flashcards && analyzedSummary.suggested_flashcards.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-[#17241B] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#697650]" />
                    <span>Suggested Flashcards Generated from Lecture</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analyzedSummary.suggested_flashcards.map((fc, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#F8F7EF] border border-[#E1E4D8] space-y-2 text-xs">
                        <div className="font-semibold text-[#17241B]">Q: {fc.front}</div>
                        <div className="text-[11px] text-[#263F2B] pt-1.5 border-t border-[#E1E4D8]">
                          A: {fc.back}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
