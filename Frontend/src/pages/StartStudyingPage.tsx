import { useState, useEffect, useRef, type ChangeEvent, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, UploadCloud, Loader2, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

// API Imports
import {
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  retryMaterialProcessing,
  type Material,
} from "../api/Materialsapi";
import { getCourses, type Course } from "../api/Coursesapi";
import { getApiErrorMessage } from "../api/authApi";
import { useSocket } from "../hooks/useSocket";

// ─── Helper: human-readable status label ────────────────────────────────────
function statusLabel(status: Material["status"]): string {
  switch (status) {
    case "QUEUED":
      return "Waiting…";
    case "EXTRACTING":
      return "Extracting text…";
    case "ANALYZING":
      return "Generating embeddings…";
    case "READY":
      return "Ready";
    case "FAILED":
      return "Processing failed";
    default:
      return status;
  }
}

function isProcessing(status: Material["status"]): boolean {
  return status === "QUEUED" || status === "EXTRACTING" || status === "ANALYZING";
}

// ─── Card component ──────────────────────────────────────────────────────────
interface MaterialCardProps {
  m: Material;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onRetry: (id: string) => void;
  /** IDs that just turned READY — show a brief "Ready ✓" badge */
  justReady: Set<string>;
}

function MaterialCard({ m, onDelete, onRetry, justReady }: MaterialCardProps) {
  const ready = m.status === "READY";
  const failed = m.status === "FAILED";
  const processing = isProcessing(m.status);
  const showReadyBadge = justReady.has(m.id);

  const cardContent = (
    <div
      className={`group relative p-5 bg-surface border rounded-xl transition-all duration-300 ${ready
          ? "border-default hover-border cursor-pointer"
          : failed
            ? "border-error/40 cursor-default"
            : "border-default cursor-default"
        }`}
    >
      {/* Delete button — always available */}
      <button
        type="button"
        onClick={(e) => onDelete(e, m.id)}
        className="absolute top-3 right-3 p-1 rounded-md text-muted hover:text-error hover:bg-elevated transition-colors opacity-80 group-hover:opacity-100 z-10"
        title="Delete material"
      >
        <X size={16} />
      </button>

      {/* Processing overlay */}
      {(processing || failed) && (
        <div className="absolute inset-0 rounded-xl backdrop-blur-[2px] bg-surface/60 flex flex-col items-center justify-center gap-2 z-[5]">
          {processing ? (
            <>
              <Loader2 size={20} className="text-accent animate-spin" />
              <span className="text-xs font-medium text-secondary px-2 text-center">
                {statusLabel(m.status)}
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={20} className="text-error" />
              <span className="text-xs font-medium text-error px-3 text-center line-clamp-2">
                {m.processingError || "Processing failed"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry(m.id);
                }}
                className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-elevated hover:bg-accent/10 text-secondary hover:text-accent transition-colors"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </>
          )}
        </div>
      )}

      {/* "Ready ✓" flash badge */}
      {showReadyBadge && (
        <div className="absolute inset-0 rounded-xl flex items-center justify-center z-[5] pointer-events-none animate-fade-out">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30">
            <CheckCircle2 size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">Ready</span>
          </div>
        </div>
      )}

      {/* Card body — blurred when not ready */}
      <div className={`transition-all duration-300 ${!ready ? "blur-[1.5px] select-none" : ""}`}>
        <div className="flex items-start gap-3 mb-4 pr-6">
          <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
            <FileText size={17} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary truncate">{m.fileName}</p>
            <p className="text-xs text-muted">{m.courseName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-secondary mb-1.5">
          <span>Progress</span>
          <span>{m.progress}%</span>
        </div>
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${m.progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Only wrap in Link when ready
  if (ready) {
    return (
      <Link
        key={m.id}
        to={`/workspace/${m.id}`}
        className="block"
        tabIndex={0}
      >
        {cardContent}
      </Link>
    );
  }

  return <div key={m.id}>{cardContent}</div>;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function StartStudyingPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Track IDs that just became READY so we can flash a "Ready ✓" badge.
   * They are removed after 2 s.
   */
  const [justReady, setJustReady] = useState<Set<string>>(new Set());
  const justReadyTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const markJustReady = (id: string) => {
    setJustReady((prev) => new Set([...prev, id]));
    // Clear any existing timer for safety
    if (justReadyTimers.current.has(id)) {
      clearTimeout(justReadyTimers.current.get(id)!);
    }
    const t = setTimeout(() => {
      setJustReady((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      justReadyTimers.current.delete(id);
    }, 2000);
    justReadyTimers.current.set(id, t);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      justReadyTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Helper to update material status in state
  const updateMaterialStatus = (
    materialId: string,
    status: Material["status"],
    extra?: Partial<Material>,
  ) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId ? { ...m, status, ...extra } : m,
      ),
    );
  };

  // ── Socket listeners ────────────────────────────────────────────────────────
  useSocket<{ materialId: string; status: string }>("material:extracting", (data) => {
    updateMaterialStatus(data.materialId, data.status as Material["status"]);
  });

  useSocket<{ materialId: string; status: string }>("material:analyzing", (data) => {
    updateMaterialStatus(data.materialId, data.status as Material["status"]);
  });

  useSocket<{ materialId: string; status: string; numChunks: number; numPages: number }>(
    "material:ready",
    (data) => {
      updateMaterialStatus(data.materialId, "READY");
      markJustReady(data.materialId);
    },
  );

  useSocket<{ materialId: string; status: string; error: string }>("material:failed", (data) => {
    updateMaterialStatus(data.materialId, "FAILED", { processingError: data.error });
  });

  // ── Initial fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([getMaterials(), getCourses()])
      .then(([materialsData, coursesData]) => {
        if (!cancelled) {
          setMaterials(materialsData);
          setCourses(coursesData);
          if (coursesData.length > 0) {
            setSelectedCourseId(coursesData[0].id);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(err, "Could not load your materials or courses."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFileSelect = (file: File): void => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setSelectedFile(null);
      return;
    }
    setUploadError(null);
    setSelectedFile(file);
  };

  const handleDeleteMaterial = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setUploadError(getApiErrorMessage(err, "Failed to delete material."));
    }
  };

  const handleRetryMaterial = async (id: string) => {
    try {
      // Optimistically set to QUEUED so the spinner shows immediately
      updateMaterialStatus(id, "QUEUED", { processingError: null });
      await retryMaterialProcessing(id);
    } catch (err) {
      setUploadError(getApiErrorMessage(err, "Failed to retry processing."));
      // Revert to FAILED if retry call itself fails
      updateMaterialStatus(id, "FAILED");
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;
    if (!selectedCourseId) {
      setUploadError("Please select a course before uploading.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);

    try {
      const newMaterial = await uploadMaterial(
        selectedFile,
        selectedCourseId,
        setUploadProgress,
      );
      // Add to top of list — starts as QUEUED, socket events will update status
      setMaterials((prev) => [newMaterial, ...prev]);
      setSelectedFile(null);
    } catch (err) {
      setUploadError(
        getApiErrorMessage(err, "Upload failed. Please try again."),
      );
    } finally {
      setUploadProgress(null);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl text-primary mb-1.5">Start Studying</h1>
      <p className="text-sm text-secondary mb-8">
        Upload a lecture PDF and pick up where you left off on the rest.
      </p>

      {/* Course Selector */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="course-select" className="text-sm font-medium text-primary">
          Choose Course:
        </label>
        <select
          id="course-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border border-default rounded-lg px-3 py-1.5 text-sm text-secondary bg-surface focus:outline-none focus:ring-2 focus:ring-accent transition-colors cursor-pointer"
        >
          {courses.length === 0 && (
            <option value="" disabled>
              Select a course
            </option>
          )}
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          if (!selectedFile && uploadProgress === null) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative flex flex-col items-center justify-center p-8 min-h-[200px] rounded-2xl border-2 border-dashed transition-colors ${isDragging
            ? "border-accent bg-elevated"
            : "border-default bg-surface hover-border"
          } ${!selectedFile && uploadProgress === null ? "cursor-pointer" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileInputChange}
          className="hidden"
        />

        {uploadProgress !== null ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-accent animate-spin" />
            <p className="text-sm text-secondary">Uploading… {uploadProgress}%</p>
            <div className="w-64 h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full pb-8">
            <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center">
              <FileText size={22} className="text-accent" />
            </div>
            <p className="text-sm font-medium text-primary truncate max-w-md">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>

            {/* Bottom Right Action Buttons */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="px-4 py-2 bg-accent hover-accent text-inverse text-xs font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <UploadCloud size={15} />
                Upload
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center">
              <UploadCloud size={22} className="text-accent" />
            </div>
            <p className="text-sm text-primary font-medium">
              Drop a PDF here, or click to browse
            </p>
            <p className="text-xs text-muted">PDF only</p>
          </>
        )}
      </div>

      {uploadError && <p className="mt-3 text-sm text-error">{uploadError}</p>}

      {/* Materials Grid */}
      <h2 className="font-serif text-lg text-primary mt-10 mb-4">Your materials</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-elevated animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <p className="text-sm text-error">{loadError}</p>
      ) : materials.length === 0 ? (
        <p className="text-sm text-secondary">
          No materials yet — upload your first PDF above to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <MaterialCard
              key={m.id}
              m={m}
              onDelete={handleDeleteMaterial}
              onRetry={handleRetryMaterial}
              justReady={justReady}
            />
          ))}
        </div>
      )}
    </div>
  );
}
