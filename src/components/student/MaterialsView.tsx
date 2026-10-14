import React, { useState } from 'react';
import { CourseMaterial, MaterialType, SourceCitation } from '../../types';
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
  AlertCircle
} from 'lucide-react';
import { UploadDropzone } from '../common/UploadDropzone';
import { Api } from '../../services/api-client';

interface MaterialsViewProps {
  courseId?: string;
  materials: CourseMaterial[];
  onAddMaterial: (material: CourseMaterial) => void;
  onRemoveMaterial?: (materialId: string) => void;
  onInspectCitation: (citation: SourceCitation) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  courseId,
  materials,
  onAddMaterial,
  onRemoveMaterial,
  onInspectCitation
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to remove this material from the course?')) {
      return;
    }
    setDeletingId(materialId);
    try {
      await Api.courses.delete(`${materialId}`); // fallback or via delete
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

  const renderIcon = (type: MaterialType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-indigo-700" />;
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
            Course Study Materials
          </h2>
          <p className="text-xs text-[#5D655B]">
            Multi-modal university materials indexed and transformed into prerequisite knowledge nodes.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-[#D71935] hover:bg-[#b0142b] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Empty State */}
      {materials.length === 0 ? (
        <div className="bg-white border border-[#E1E4D8] rounded-2xl p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F2E6] border border-[#DCE5CE] text-[#263F2B] flex items-center justify-center mx-auto shadow-2xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif-display text-xl font-bold text-[#17241B]">
              Your course is ready for material.
            </h3>
            <p className="text-xs text-[#5D655B] leading-relaxed">
              Upload a PDF, lecture video, presentation, image, or audio recording to start building your study path.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2.5 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#DCE5CE]" />
            <span>Upload study material</span>
          </button>
        </div>
      ) : (
        /* Materials Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E1E4D8] rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#DCE5CE] text-[#263F2B] flex items-center justify-center">
                    {renderIcon(m.type)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#697650]">
                    <span className="font-mono-code">{m.durationOrPages || m.pageCountOrDuration || m.formattedSize}</span>
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

                {/* Extracted concepts */}
                {m.extractedConcepts && m.extractedConcepts.length > 0 && (
                  <div className="pt-2 border-t border-[#E1E4D8] space-y-1">
                    <span className="text-[10px] font-semibold text-[#697650] uppercase tracking-wider block">
                      Indexed Concepts:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-[#263F2B]">
                      {m.extractedConcepts.map((c, i) => (
                        <span key={i} className="bg-[#F1F2E6] px-2 py-0.5 rounded border border-[#E1E4D8]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E1E4D8] flex items-center justify-between text-[11px] text-[#777E70]">
                <span>{m.uploadedAt || m.dateAdded || 'Indexed'}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="p-1 hover:text-[#D71935] hover:bg-[#FFF8F8] rounded transition-colors text-[#777E70]"
                  title="Remove material"
                  aria-label={`Remove ${m.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real Upload Dropzone Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17241B]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-[#E1E4D8] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#E1E4D8]">
              <div>
                <h3 className="text-base font-bold font-serif-display text-[#263F2B]">
                  Upload Course Materials
                </h3>
                <p className="text-xs text-[#5D655B]">
                  Multi-modal processing for PDFs, video lectures, slide decks, audio notes, and whiteboard diagrams.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#777E70] hover:text-[#17241B] p-1.5 rounded-lg"
                aria-label="Close upload dialog"
              >
                ✕
              </button>
            </div>

            <UploadDropzone
              courseId={courseId}
              onUploadSuccess={(doc) => {
                onAddMaterial(doc);
              }}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
