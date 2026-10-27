import { useCallback, useEffect, useState } from "react";
import {
  createBookmark as createBookmarkRequest,
  deleteBookmark as deleteBookmarkRequest,
  getBookmarks,
  updateBookmark as updateBookmarkRequest,
  type Bookmark,
  type CreateBookmarkPayload,
  type UpdateBookmarkPayload,
} from "../api/BookmarkApi";
import { getApiErrorMessage } from "../api/authApi";

export function useBookmarks(materialId?: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(materialId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!materialId) {
      setBookmarks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setBookmarks(await getBookmarks(materialId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load bookmarks."));
    } finally {
      setIsLoading(false);
    }
  }, [materialId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      if (!materialId) {
        if (!cancelled) {
          setBookmarks([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getBookmarks(materialId);
        if (!cancelled) setBookmarks(data);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load bookmarks."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [materialId]);

  const create = useCallback(
    async (payload: CreateBookmarkPayload) => {
      if (!materialId) return;
      setError(null);
      try {
        const created = await createBookmarkRequest(materialId, payload);
        setBookmarks((current) =>
          [...current, created].sort((a, b) => a.pageNumber - b.pageNumber),
        );
        return created;
      } catch (err) {
        const message = getApiErrorMessage(err, "Could not create bookmark.");
        setError(message);
        throw err;
      }
    },
    [materialId],
  );

  const update = useCallback(
    async (bookmarkId: string, payload: UpdateBookmarkPayload) => {
      setError(null);
      try {
        const updated = await updateBookmarkRequest(bookmarkId, payload);
        setBookmarks((current) =>
          current.map((bookmark) =>
            bookmark.id === bookmarkId ? { ...bookmark, ...updated } : bookmark,
          ),
        );
        return updated;
      } catch (err) {
        const message = getApiErrorMessage(err, "Could not update bookmark.");
        setError(message);
        throw err;
      }
    },
    [],
  );

  const remove = useCallback(async (bookmarkId: string) => {
    setError(null);
    try {
      await deleteBookmarkRequest(bookmarkId);
      setBookmarks((current) =>
        current.filter((bookmark) => bookmark.id !== bookmarkId),
      );
    } catch (err) {
      const message = getApiErrorMessage(err, "Could not delete bookmark.");
      setError(message);
      throw err;
    }
  }, []);

  return { bookmarks, isLoading, error, setError, refresh, create, update, remove };
}
