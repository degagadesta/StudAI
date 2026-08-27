import { api } from "./client";

// Helper function to get the full API base URL
function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || "/api";
}

export interface Material {
  id: string;
  fileName: string;
  courseName: string;
  curriculumCourseId: string;
  courseId: string;
  fileSize: number;
  uploadedAt: string; // ISO date string
  progress: number;
  fileUrl: string; // URL to the PDF file
  status: "QUEUED" | "EXTRACTING" | "ANALYZING" | "READY" | "FAILED" | "DELETED";
  processingError?: string | null;
}


// Raw shape returned by GET /student/pdfs — grouped by curriculumCourseId,
// NOT a flat array. Kept private to this file; getMaterials() flattens it.
interface GroupedMaterialsResponse {
  [curriculumCourseId: string]: {
    curriculumCourseId: string;
    courseId: string;
    courseName: string;
    pdfs: {
      id: string;
      fileName: string;
      fileSize: number;
      uploadDate: string;
      progress: number;
      status: "QUEUED" | "EXTRACTING" | "ANALYZING" | "READY" | "FAILED" | "DELETED";
      processingError?: string | null;
    }[];
  };
}

export async function getMaterials(): Promise<Material[]> {
  const res = await api.get<{
    success: boolean;
    data: GroupedMaterialsResponse;
  }>("/student/pdfs");

  const grouped = res.data.data;

  return Object.values(grouped).flatMap((group) =>
    group.pdfs.map((pdf) => ({
      id: pdf.id,
      fileName: pdf.fileName,
      courseName: group.courseName,
      curriculumCourseId: group.curriculumCourseId,
      courseId: group.courseId,
      fileSize: pdf.fileSize,
      uploadedAt: pdf.uploadDate,
      progress: pdf.progress,
      status: pdf.status,
      processingError: pdf.processingError,
      fileUrl: `${getApiBaseUrl()}/student/pdfs/${pdf.id}/file`,
    })),
  );
}

/**
 * Uploads a PDF and reports real upload progress (0–100) via the
 * onProgress callback, driven by axios's onUploadProgress.
 *
 * Field name MUST be "pdf" — the backend is configured with
 * multer's upload.single('pdf'); any other field name means
 * req.file is undefined and the upload is rejected.
 */
export async function uploadMaterial(
  file: File,
  curriculumCourseId: string,
  onProgress?: (percent: number) => void,
): Promise<Material> {
  const formData = new FormData();

  formData.append("curriculumCourseId", curriculumCourseId);
  formData.append("pdf", file);

  const res = await api.post<{
    success: boolean;
    message: string;
    data: {
      id: string;
      fileName: string;
      fileSize: number;
      uploadDate: string;
      curriculumCourseId: string;
      courseId: string;
      courseName: string;
      progress: number;
      status: "QUEUED" | "EXTRACTING" | "ANALYZING" | "READY" | "FAILED";
    };
  }>("/student/pdfs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  const d = res.data.data;
  return {
    id: d.id,
    fileName: d.fileName,
    courseName: d.courseName,
    curriculumCourseId: d.curriculumCourseId,
    courseId: d.courseId,
    fileSize: d.fileSize,
    uploadedAt: d.uploadDate,
    progress: d.progress,
    status: d.status,
    fileUrl: `/student/pdfs/${d.id}/file`,
  };
}

/**
 * The frontend computes progress itself (current page ÷ total pages,
 * tracked in PdfViewerPage) and pushes it here.
 */
export async function updateMaterialProgress(
  id: string,
  progress: number,
): Promise<void> {
  await api.patch(`/student/pdfs/${id}/progress`, { progress });
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`/student/pdfs/${id}`);
}

export async function retryMaterialProcessing(id: string): Promise<Material> {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: {
      id: string;
      fileName: string;
      fileSize: number;
      uploadDate: string;
      curriculumCourseId: string;
      courseId: string;
      courseName: string;
      progress: number;
      status: "QUEUED" | "EXTRACTING" | "ANALYZING" | "READY" | "FAILED";
      processingError: string | null;
    };
  }>(`/student/pdfs/${id}/retry`);

  const d = res.data.data;
  return {
    id: d.id,
    fileName: d.fileName,
    courseName: d.courseName,
    curriculumCourseId: d.curriculumCourseId,
    courseId: d.courseId,
    fileSize: d.fileSize,
    uploadedAt: d.uploadDate,
    progress: d.progress,
    status: d.status,
    fileUrl: `${getApiBaseUrl()}/student/pdfs/${d.id}/file`,
  };
}

/**
 * NOTE: there is no backend route that returns a single material's
 * JSON metadata — only the list (GET /student/pdfs), the binary file
 * (GET /student/pdfs/:id/file), progress patch, and delete. If a
 * detail page needs single-material metadata, either add that route
 * on the backend or derive it from the already-fetched list.
 */
/* ========================================================================
   STUDY NOTES API ENDPOINTS
   ======================================================================== */

export interface MaterialNoteResponse {
  id?: string;
  pdfId: string;
  content: string;
  updatedAt?: string;
}

/**
 * Fetches saved notes for a specific PDF material.
 *
 * Endpoint: GET /student/materials/:materialId/note
 */
export async function getMaterialNotes(materialId: string): Promise<string> {
  const res = await api.get<{
    success: boolean;
    data: {
      content: string;
    } | null;
  }>(`/student/materials/${materialId}/note`);

  return res.data.data?.content ?? "";
}

/**
 * Saves or updates study notes for a specific PDF material.
 *
 * Endpoint: PUT /student/materials/:materialId/note
 * Body: { content: string }
 */
export async function saveMaterialNotes(
  materialId: string,
  content: string,
): Promise<void> {
  await api.put<{
    success: boolean;
    message?: string;
  }>(`/student/materials/${materialId}/note`, { content });
}
