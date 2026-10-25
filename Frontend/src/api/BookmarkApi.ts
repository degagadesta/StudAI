import { api } from "./client";

export type BookmarkColor = "yellow" | "green" | "blue" | "red" | "purple" | "orange";

export interface BookmarkTextSelection {
  startOffset: number;
  endOffset: number;
  selectedText?: string;
}

export interface Bookmark {
  id: string;
  materialId?: string;
  name: string;
  pageNumber: number;
  textSelection: BookmarkTextSelection | null;
  color: BookmarkColor;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  material?: { id: string; title: string };
}

export interface CreateBookmarkPayload {
  name: string;
  pageNumber: number;
  textSelection?: BookmarkTextSelection;
  color?: BookmarkColor;
  note?: string;
}

export interface UpdateBookmarkPayload {
  name?: string;
  note?: string | null;
}

export interface AllBookmarksResult {
  bookmarks: Bookmark[];
  total: number;
  limit: number;
  offset: number;
}

export async function getBookmarks(materialId: string): Promise<Bookmark[]> {
  const response = await api.get(`/student/materials/${materialId}/bookmarks`);
  return response.data.data;
}

export async function getAllBookmarks(
  limit = 100,
  offset = 0,
): Promise<AllBookmarksResult> {
  const response = await api.get("/student/bookmarks", {
    params: { limit, offset },
  });
  return response.data.data;
}

export async function createBookmark(
  materialId: string,
  payload: CreateBookmarkPayload,
): Promise<Bookmark> {
  const response = await api.post(
    `/student/materials/${materialId}/bookmarks`,
    payload,
  );
  return response.data.data;
}

export async function updateBookmark(
  bookmarkId: string,
  payload: UpdateBookmarkPayload,
): Promise<Bookmark> {
  const response = await api.patch(`/student/bookmarks/${bookmarkId}`, payload);
  return response.data.data;
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  await api.delete(`/student/bookmarks/${bookmarkId}`);
}
