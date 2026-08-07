import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, UploadCloud, Loader2, X } from "lucide-react";

// API Imports
import {
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  type Material,
} from "../api/Materialsapi";
import { getCourses, type Course } from "../api/Coursesapi";
import { getApiErrorMessage } from "../api/authApi";

export default function StartStudyingPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // 1. Store the selected course ID (initialized empty or with default course ID)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch materials and courses on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([getMaterials(), getCourses()])
      .then(([materialsData, coursesData]) => {
        if (!cancelled) {
          setMaterials(materialsData);
          setCourses(coursesData);

          // 2. Default selected course to the FIRST course's ID
          if (coursesData.length > 0) {
            setSelectedCourseId(coursesData[0].id);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(
              err,
              "Could not load your materials or courses.",
            ),
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

  // Stage selected file
  const handleFileSelect = (file: File): void => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  };

  const handleDeleteMaterial = async (e: MouseEvent, id: string) => {
    e.preventDefault(); // Prevents the Link from triggering navigation
    e.stopPropagation(); // Stops the click event from bubbling up

    try {
      await deleteMaterial(id);
      // Remove material locally from state
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setUploadError(getApiErrorMessage(err, "Failed to delete material."));
    }
  };
  // Perform upload on button click
  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) return;
    if (!selectedCourseId) {
      setUploadError("Please select a course before uploading.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);

    //delete material function

    try {
      // 3. Pass courseId to uploadMaterial
      const newMaterial = await uploadMaterial(
        selectedFile,
        selectedCourseId,
        setUploadProgress,
      );
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

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">
        Start Studying
      </h1>
      <p className="text-sm text-[#5B6156] mb-8">
        Upload a lecture PDF and pick up where you left off on the rest.
      </p>

      {/* Course Selector */}
      <div className="flex items-center gap-3 mb-6">
        <label
          htmlFor="course-select"
          className="text-sm font-medium text-[#253D31]"
        >
          Choose Course:
        </label>

        {/* 4. Dropdown binds value to course.id while displaying course.name */}
        <select
          id="course-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border border-[#DCD2B4] rounded-lg px-3 py-1.5 text-sm text-[#5B6156] bg-[#FFFDF7] focus:outline-none focus:ring-2 focus:ring-[#253D31]/20 transition-colors cursor-pointer"
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
        className={`relative flex flex-col items-center justify-center p-8 min-h-[200px] rounded-2xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-[#8CA37E] bg-[#EFE8D4]"
            : "border-[#DCD2B4] bg-[#FFFDF7] hover:border-[#B7AE8E]"
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
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2 w-full pb-8">
            <div className="w-12 h-12 rounded-xl bg-[#EFE8D4] flex items-center justify-center">
              <FileText size={22} className="text-[#2F4A3D]" />
            </div>
            <p className="text-sm font-medium text-[#253D31] truncate max-w-md">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[#A9A18A]">
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
                className="px-3 py-1.5 text-xs font-medium text-[#5B6156] hover:text-[#253D31] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="px-4 py-2 bg-[#253D31] text-[#FFFDF7] text-xs font-medium rounded-lg hover:bg-[#2F4A3D] transition-colors flex items-center gap-2 shadow-sm"
              >
                <UploadCloud size={15} />
                Upload
              </button>
            </div>
          </div>
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

      {/* Materials Grid */}
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
              to={`/app/workspace/${m.id}`}
              className="group relative p-5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl hover:border-[#8CA37E] transition-colors cursor-pointer block"
            >
              {/* Delete ("X") Button */}
              <button
                type="button"
                onClick={(e) => handleDeleteMaterial(e, m.id)}
                className="absolute top-3 right-3 p-1 rounded-md text-[#A9A18A] hover:text-[#8B3A3A] hover:bg-[#EFE8D4] transition-colors opacity-80 group-hover:opacity-100"
                title="Delete material"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-3 mb-4 pr-6">
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
