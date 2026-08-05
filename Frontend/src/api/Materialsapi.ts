import { api } from "./client";

export interface Material {
  id: string;
  fileName: string;
  courseName: string;
  uploadedAt: string; // ISO date string
  progress: number; // 0–100, how much of the material has been studied
}

export async function getMaterials(): Promise<Material[]> {
  const res = await api.get<Material[]>("/materials");
  return res.data;
}

/**
 * Uploads a PDF and reports real upload progress (0–100) via the
 * onProgress callback, driven by axios's onUploadProgress. This is
 * upload progress (bytes sent), separate from the "reading progress"
 * shown on material cards once a file is already stored.
 */
export async function uploadMaterial(
  file: File,
  courseName: string,
  onProgress?: (percent: number) => void,
): Promise<Material> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("courseName", courseName);

  const res = await api.post<Material>("/materials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return res.data;
}
