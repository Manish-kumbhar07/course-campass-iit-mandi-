import React, { useState } from 'react';
import { CourseMaterial, MaterialType, SourceCitation } from '../../types';
import {
  UploadCloud,
  FileText,
  Video,
  Presentation,
  Headphones,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Loader2
} from 'lucide-react';

interface MaterialsViewProps {
  materials: CourseMaterial[];
  onAddMaterial: (material: CourseMaterial) => void;
  onInspectCitation: (citation: SourceCitation) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onAddMaterial,
  onInspectCitation
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pipelineStage, setPipelineStage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('Lecture 14: Topological Sorting & DAG Invariants');
  const [newType, setNewType] = useState<MaterialType>('video');
  const [newDuration, setNewDuration] = useState('52m 10s');

  const startSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(15);
    setPipelineStage('Uploading and verifying audio-visual stream...');

    setTimeout(() => {
      setUploadProgress(45);
      setPipelineStage('Generating timestamped academic transcript & slide OCR...');
    }, 900);

    setTimeout(() => {
      setUploadProgress(80);
      setPipelineStage('Extracting conceptual dependencies & prerequisite edges...');
    }, 1800);

    setTimeout(() => {
      setUploadProgress(100);
      setPipelineStage('Corpus indexing complete. Verified citations generated.');

      const newMat: CourseMaterial = {
        id: `mat-${Date.now()}`,
        title: newTitle,
        type: newType,
        size: '512 MB',
        durationOrPages: newDuration,
        dateAdded: 'Just now',
        extractedConcepts: ['Topological Sorting', 'In-Degree Arrays', 'Kahn Algorithm'],
        status: 'ready',
        description: 'Lecture recording focusing on directed acyclic graph linearization and cycle verification.'
      };

      onAddMaterial(newMat);
      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setUploadProgress(0);
      }, 600);
    }, 2700);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Upload Action */}
      <div className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#697650] uppercase tracking-wider">
            <UploadCloud className="w-4 h-4 text-[#263F2B]" />
            <span>Course Knowledge Ingestion</span>
          </div>
          <h2 className="text-xl font-bold font-serif-display text-[#263F2B]">
            Ingested Course Materials
          </h2>
          <p className="text-xs text-[#5D655B]">
            Multi-modal university materials indexed and transformed into prerequisite knowledge nodes.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Course Material</span>
        </button>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                  {m.type === 'video' && <Video className="w-4 h-4" />}
                  {m.type === 'pdf' && <FileText className="w-4 h-4" />}
                  {m.type === 'slides' && <Presentation className="w-4 h-4" />}
                  {m.type === 'audio' && <Headphones className="w-4 h-4" />}
                  {m.type === 'notes' && <BookOpen className="w-4 h-4" />}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#697650]">
                  <span className="font-mono-code">{m.durationOrPages}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Indexed
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#17241B] line-clamp-2">
                  {m.title}
                </h3>
                <p className="text-xs text-[#5D655B] mt-1 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Extracted concepts */}
              <div className="pt-2 border-t border-[#E1E4D8] space-y-1">
                <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block">
                  Extracted Concepts:
                </span>
                <div className="flex flex-wrap gap-1 text-[11px] text-[#263F2B]">
                  {m.extractedConcepts.map((c, i) => (
                    <span key={i} className="bg-[#F1F2E6] px-2 py-0.5 rounded border border-[#E1E4D8]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E4D8] flex items-center justify-between text-[11px] text-[#777E70]">
              <span>Added: {m.dateAdded}</span>
              <span className="font-mono-code">{m.size}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Simulator Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-[#E1E4D8] rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#E1E4D8]">
              <div>
                <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                  Upload & Synthesize Courseware
                </h3>
                <p className="text-xs text-[#5D655B]">
                  Lecture recordings, textbook PDFs, slides, and audio office hours.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="text-[#777E70] hover:text-[#17241B]"
              >
                ✕
              </button>
            </div>

            {!isUploading ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#17241B] mb-1">
                    Document / Recording Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#17241B] mb-1">
                      Material Format
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as MaterialType)}
                      className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
                    >
                      <option value="video">Lecture Video (.mp4)</option>
                      <option value="pdf">Textbook / Reading (.pdf)</option>
                      <option value="slides">Slide Deck (.pptx)</option>
                      <option value="audio">Audio Recording (.m4a)</option>
                      <option value="notes">Lab Worksheet / Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-[#17241B] mb-1">
                      Duration / Page Count
                    </label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E1E4D8] rounded-lg bg-[#F8F7EF]"
                    />
                  </div>
                </div>

                {/* Drag and Drop Box Simulation */}
                <div className="p-6 border-2 border-dashed border-[#A8B594] rounded-xl bg-[#F8F7EF] text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-[#697650] mx-auto" />
                  <p className="font-medium text-[#17241B]">Drag & drop file here, or click to browse</p>
                  <p className="text-[11px] text-[#777E70]">
                    Supports MP4, PDF, PPTX, MP3 up to 2GB per lecture file
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-[#5D655B] hover:text-[#17241B] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startSimulatedUpload}
                    className="px-5 py-2 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg font-semibold shadow-xs"
                  >
                    Start Ingestion Pipeline
                  </button>
                </div>
              </div>
            ) : (
              /* Upload & Ingestion Pipeline Progress */
              <div className="py-6 space-y-4 text-center">
                <Loader2 className="w-8 h-8 text-[#263F2B] animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#17241B]">
                    Ingesting & Indexing Courseware...
                  </h4>
                  <p className="text-xs text-[#5D655B] font-mono-code">{pipelineStage}</p>
                </div>

                <div className="w-full h-2 bg-[#E1E4D8] rounded-full overflow-hidden max-w-sm mx-auto">
                  <div
                    className="h-full bg-[#263F2B] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="font-mono-code text-xs text-[#697650]">{uploadProgress}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
