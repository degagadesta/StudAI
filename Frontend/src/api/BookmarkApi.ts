import { api } from "./client";

export interface Bookmark {
  id: string;
  name: string;
  pageNumber: number;
  textSelection?: {
    startOffset: number;
    endOffset: number;
    selectedText: string;
  };
  color: "yellow" | "green" | "blue" | "red" | "purple" | "orange";
  note?: string;
  material?: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookmarkPayload {
  name: string;
  pageNumber: number;
  textSelection?: string;
  color?: "yellow" | "green" | "blue" | "red" | "purple" | "orange";
  note?: string;
}

export interface UpdateBookmarkPayload {
  name?: string;
  note?: string;
}

/**
 * Create a new bookmark for a PDF material
 */
export async function createBookmark(
  materialId: string,
  data: CreateBookmarkPayload
): Promise<Bookmark> {
  const response = await api.post(`/student/materials/${materialId}/bookmarks`, data);
  return response.data.data;
}

/**
 * Get all bookmarks for a specific material
 */
export async function getBookmarks(
  materialId: string
): Promise<Bookmark[]> {
  const response = await api.get(`/student/materials/${materialId}/bookmarks`);
  return response.data.data;
}

/**
 * Get all bookmarks for current student across all materials
 */
export async function getAllBookmarks(): Promise<Bookmark[]> {
  const response = await api.get("/student/bookmarks");
  // Backend returns { bookmarks, total, limit, offset }, extract bookmarks array
  const data = response.data.data;
  return Array.isArray(data) ? data : data.bookmarks || [];
}

/**
 * Update an existing bookmark
 */
export async function updateBookmark(
  bookmarkId: string,
  data: UpdateBookmarkPayload
): Promise<Bookmark> {
  const response = await api.patch(`/student/bookmarks/${bookmarkId}`, data);
  return response.data.data;
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(bookmarkId: string): Promise<void> {
  await api.delete(`/student/bookmarks/${bookmarkId}`);
}
