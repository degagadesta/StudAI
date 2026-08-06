import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, UploadCloud, Loader2 } from "lucide-react";
import {
  getMaterials,
  uploadMaterial,
  type Material,
} from "../api/Materialsapi";
import { getApiErrorMessage } from "../api/authApi";

export default function StartStudyingPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    getMaterials()
      .then((data) => {
        if (!cancelled) setMaterials(data);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(
            getApiErrorMessage(err, "Could not load your materials."),
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFile = async (file: File): Promise<void> => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    try {
      // "General" is a placeholder course tag until course-linked
      // upload (from the Course Workspace, Day 7) replaces this flow.
      const newMaterial = await uploadMaterial(
        file,
        "General",
        setUploadProgress,
      );
      setMaterials((prev) => [newMaterial, ...prev]);
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
    if (file) handleFile(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">
        Start Studying
      </h1>
      <p className="text-sm text-[#5B6156] mb-8">
        Upload a lecture PDF and pick up where you left off on the rest.
      </p>

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          isDragging
            ? "border-[#8CA37E] bg-[#EFE8D4]"
            : "border-[#DCD2B4] bg-[#FFFDF7] hover:border-[#B7AE8E]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileInputChange}
          className="hidden"
        />

        {uploadProgress !== null ? (
          <>
            <Loader2 size={28} className="text-[#2F4A3D] animate-spin" />
            <p className="text-sm text-[#5B6156]">
              Uploading… {uploadProgress}%
            </p>
            <div className="w-64 h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F4A3D] transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#EFE8D4] flex items-center justify-center">
              <UploadCloud size={22} className="text-[#2F4A3D]" />
            </div>
            <p className="text-sm text-[#253D31] font-medium">
              Drop a PDF here, or click to browse
            </p>
            <p className="text-xs text-[#A9A18A]">PDF only</p>
          </>
        )}
      </div>

      {uploadError && (
        <p className="mt-3 text-sm text-[#8B3A3A]">{uploadError}</p>
      )}

      {/* Uploaded materials */}
      <h2 className="font-serif text-lg text-[#253D31] mt-10 mb-4">
        Your materials
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#EFE8D4] animate-pulse"
            />
          ))}
        </div>
      ) : loadError ? (
        <p className="text-sm text-[#8B3A3A]">{loadError}</p>
      ) : materials.length === 0 ? (
        <p className="text-sm text-[#5B6156]">
          No materials yet — upload your first PDF above to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <Link
              key={m.id}
              to={`/app/materials/${m.id}`}
              className="p-5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl hover:border-[#8CA37E] transition-colors cursor-pointer block"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#EFE8D4] flex items-center justify-center shrink-0">
                  <FileText size={17} className="text-[#2F4A3D]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#253D31] truncate">
                    {m.fileName}
                  </p>
                  <p className="text-xs text-[#A9A18A]">{m.courseName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#5B6156] mb-1.5">
                <span>Progress</span>
                <span>{m.progress}%</span>
              </div>
              <div className="h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8CA37E] transition-all"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
