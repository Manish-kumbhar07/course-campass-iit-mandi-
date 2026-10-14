import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
  Video,
  Presentation,
  Headphones,
  Image,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
  Loader2,
  FileCode
} from 'lucide-react';
import { CourseDocument, DocumentType } from '../../types';
import { Api } from '../../services/api-client';

export interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: DocumentType;
  uploadPercent: number;
  status:
    | 'queued'
    | 'uploading'
    | 'uploaded'
    | 'processing'
    | 'extracting_text'
    | 'transcribing_audio'
    | 'understanding_diagrams'
    | 'building_concepts'
    | 'building_prerequisites'
    | 'ready'
    | 'failed';
  stageDescription: string;
  error?: string;
  jobId?: string;
}

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

const ALLOWED_EXTENSIONS = [
  'pdf',
  'ppt',
  'pptx',
  'mp4',
  'mov',
  'webm',
  'mp3',
  'wav',
  'm4a',
  'jpg',
  'jpeg',
  'png',
  'webp'
];

interface UploadDropzoneProps {
  courseId: string;
  onUploadSuccess?: (document: CourseDocument) => void;
  onClose?: () => void;
  maxFiles?: number;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  courseId,
  onUploadSuccess,
  onClose,
  maxFiles = 10
}) => {
  const [fileList, setFileList] = useState<UploadFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activePollers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const getDocType = (filename: string): DocumentType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
    if (['ppt', 'pptx'].includes(ext)) return 'slides';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    return 'pdf';
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `.${ext} format is not supported. Please upload PDF, PPT/PPTX, video, audio, or images.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds the 500MB size limit (${formatSize(file.size)}).`;
    }
    return null;
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGlobalError(null);

    const newItems: UploadFileItem[] = [];

    Array.from(files).forEach((file) => {
      // Duplicate detection
      const isDuplicate = fileList.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (isDuplicate) {
        setGlobalError(`"${file.name}" is already in the upload queue.`);
        return;
      }

      const validationError = validateFile(file);
      const item: UploadFileItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: getDocType(file.name),
        uploadPercent: 0,
        status: validationError ? 'failed' : 'queued',
        stageDescription: validationError ? 'Validation failed' : 'Queued for upload',
        error: validationError || undefined
      };

      newItems.push(item);
    });

    if (fileList.length + newItems.length > maxFiles) {
      setGlobalError(`You can upload up to ${maxFiles} files at once.`);
      return;
    }

    setFileList((prev) => [...prev, ...newItems]);

    // Automatically trigger upload for queued valid files
    newItems.forEach((item) => {
      if (item.status === 'queued') {
        uploadSingleFile(item.id, item.file);
      }
    });
  };

  const uploadSingleFile = async (itemId: string, file: File) => {
    setFileList((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'uploading',
              uploadPercent: 30,
              stageDescription: 'Streaming to secure course storage...'
            }
          : item
      )
    );

    try {
      const res = await Api.materials.upload(courseId, file, file.name);

      setFileList((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: 'processing',
                uploadPercent: 100,
                jobId: res.job?.id,
                stageDescription: res.job?.stageDescription || 'Extracting course knowledge...'
              }
            : item
        )
      );

      if (res.job?.id) {
        pollJobStatus(itemId, res.job.id, res.material);
      } else {
        // Immediate completion
        finishItemSuccess(itemId, res.material);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed. Please retry.';
      setFileList((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: 'failed',
                error: errMsg,
                stageDescription: 'Upload failed'
              }
            : item
        )
      );
    }
  };

  const pollJobStatus = (itemId: string, jobId: string, material: CourseDocument) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const job = await Api.materials.getJobStatus(jobId);

        let mappedStatus: UploadFileItem['status'] = 'processing';
        if (job.stage === 'reading_content') mappedStatus = 'extracting_text';
        else if (job.stage === 'understanding_diagrams') mappedStatus = 'understanding_diagrams';
        else if (job.stage === 'transcribing_lecture') mappedStatus = 'transcribing_audio';
        else if (job.stage === 'finding_concepts') mappedStatus = 'building_concepts';
        else if (job.stage === 'building_prerequisites') mappedStatus = 'building_prerequisites';
        else if (job.stage === 'ready' || job.isCompleted) mappedStatus = 'ready';

        setFileList((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: mappedStatus,
                  uploadPercent: job.progressPercent || 80,
                  stageDescription: job.stageDescription || 'Processing...'
                }
              : item
          )
        );

        if (job.isCompleted || mappedStatus === 'ready') {
          clearInterval(interval);
          activePollers.current.delete(itemId);
          finishItemSuccess(itemId, material);
        } else if (job.error) {
          clearInterval(interval);
          activePollers.current.delete(itemId);
          setFileList((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: 'failed',
                    error: job.error,
                    stageDescription: 'Processing failed'
                  }
                : item
            )
          );
        }
      } catch {
        // Continue polling unless timeout reached
        if (attempts > 30) {
          clearInterval(interval);
          activePollers.current.delete(itemId);
          finishItemSuccess(itemId, material);
        }
      }
    }, 1500);

    activePollers.current.set(itemId, interval);
  };

  const finishItemSuccess = (itemId: string, material: CourseDocument) => {
    setFileList((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'ready',
              uploadPercent: 100,
              stageDescription: 'Indexed & ready for AI tutoring'
            }
          : item
      )
    );
    if (onUploadSuccess) {
      onUploadSuccess({
        ...material,
        status: 'ready'
      });
    }
  };

  const handleRetry = (itemId: string) => {
    const item = fileList.find((f) => f.id === itemId);
    if (item) {
      uploadSingleFile(itemId, item.file);
    }
  };

  const handleRemove = (itemId: string) => {
    const poller = activePollers.current.get(itemId);
    if (poller) {
      clearInterval(poller);
      activePollers.current.delete(itemId);
    }
    setFileList((prev) => prev.filter((f) => f.id !== itemId));
  };

  const renderFileIcon = (type: DocumentType) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-indigo-600" />;
      case 'slides':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-emerald-600" />;
      case 'image':
        return <Image className="w-5 h-5 text-sky-600" />;
      default:
        return <FileText className="w-5 h-5 text-[#263F2B]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop course material files or click to browse"
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-[#263F2B] bg-[#F1F2E6]'
            : 'border-[#E1E4D8] bg-[#F8F7EF]/60 hover:bg-[#F1F2E6]/50 hover:border-[#A8B594]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.ppt,.pptx,.mp4,.mov,.webm,.mp3,.wav,.m4a,.jpg,.jpeg,.png,.webp"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#E1E4D8] flex items-center justify-center text-[#263F2B] shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#17241B]">
              Drop your course materials here, or <span className="text-[#263F2B] underline">browse</span>
            </p>
            <p className="text-xs text-[#5D655B]">
              PDF, PPT/PPTX slides, MP4 lecture videos, MP3/M4A audio recordings, and diagrams. Up to 500MB per file.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-[#E1E4D8] text-[#5D655B]">PDF</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-[#E1E4D8] text-[#5D655B]">PPT / PPTX</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-[#E1E4D8] text-[#5D655B]">MP4 / MOV</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-[#E1E4D8] text-[#5D655B]">MP3 / M4A</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white border border-[#E1E4D8] text-[#5D655B]">PNG / JPG</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#F8E2E3] flex items-center justify-between text-xs text-[#D71935]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="p-1 hover:bg-[#F8E2E3] rounded text-[#D71935]"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploaded File List */}
      {fileList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#17241B] uppercase tracking-wider">
              Files ({fileList.length})
            </h4>
            <span className="text-xs text-[#5D655B]">
              {fileList.filter((f) => f.status === 'ready').length} of {fileList.length} ready
            </span>
          </div>

          <div className="space-y-2">
            {fileList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-[#E1E4D8] shadow-2xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-[#F8F7EF] border border-[#E1E4D8] shrink-0">
                      {renderFileIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#17241B] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#5D655B]">{formatSize(item.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge */}
                    {item.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}

                    {item.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8F8] text-[#D71935] border border-[#F8E2E3]">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}

                    {['uploading', 'processing', 'extracting_text', 'transcribing_audio', 'understanding_diagrams', 'building_concepts', 'building_prerequisites'].includes(
                      item.status
                    ) && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                        <span className="capitalize">{item.status.replace(/_/g, ' ')}</span>
                      </span>
                    )}

                    {/* Retry button */}
                    {item.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(item.id)}
                        className="p-1.5 text-[#5D655B] hover:text-[#17241B] hover:bg-[#F8F7EF] rounded-lg transition-colors"
                        title="Retry upload"
                        aria-label={`Retry uploading ${item.name}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-[#5D655B] hover:text-[#D71935] hover:bg-[#FFF8F8] rounded-lg transition-colors"
                      title="Remove file"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and description */}
                {item.status !== 'failed' && (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-[#E1E4D8] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          item.status === 'ready'
                            ? 'bg-[#263F2B]'
                            : 'bg-[#697650]'
                        }`}
                        style={{ width: `${item.uploadPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#5D655B]">
                      <span>{item.stageDescription}</span>
                      <span>{item.uploadPercent}%</span>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {item.error && (
                  <p className="text-[11px] text-[#D71935] font-medium pt-1">
                    {item.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done / Close Actions */}
      {onClose && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#263F2B] hover:bg-[#1e3222] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};

