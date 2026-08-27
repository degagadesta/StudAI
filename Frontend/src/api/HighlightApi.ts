import { api } from "./client";

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

export interface HighlightPosition {
  startOffset: number;
  endOffset: number;
}

export interface Highlight {
  id: string;
  materialId: string;
  studentId: string;
  pageNumber: number;
  textContent: string;
  position: HighlightPosition;
  color: HighlightColor;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHighlightPayload {
  pageNumber: number;
  textContent: string;
  position: HighlightPosition;
  color?: HighlightColor;
  note?: string | null;
}

export interface UpdateHighlightPayload {
  color?: HighlightColor;
  note?: string | null;
}

export async function getHighlights(materialId: string): Promise<Highlight[]> {
  const res = await api.get(`/student/materials/${materialId}/highlights`);
  return res.data.data;
}

export async function createHighlight(
  materialId: string,
  payload: CreateHighlightPayload,
): Promise<Highlight> {
  const res = await api.post(
    `/student/materials/${materialId}/highlights`,
    payload,
  );
  return res.data.data;
}

export async function updateHighlight(
  highlightId: string,
  payload: UpdateHighlightPayload,
): Promise<Highlight> {
  const res = await api.patch(`/student/highlights/${highlightId}`, payload);
  return res.data.data;
}

export async function deleteHighlight(highlightId: string): Promise<void> {
  await api.delete(`/student/highlights/${highlightId}`);
}
