import { useEffect, useState } from "react";
import { Bookmark as BookmarkIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllBookmarks,
  updateBookmark,
  deleteBookmark,
  type Bookmark,
} from "../api/BookmarkApi";
import { getApiErrorMessage } from "../api/authApi";
import { useCache } from "../contexts/CacheContext";
import BookmarkList from "../components/Bookmarks/BookmarkList";

const BOOKMARKS_CACHE_KEY = "bookmarks";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const cache = useCache();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Try to get cached data first
    const cachedData = cache.get<Bookmark[]>(BOOKMARKS_CACHE_KEY);
    if (cachedData && Array.isArray(cachedData)) {
      setBookmarks(cachedData);
      setIsLoading(false);
      return;
    }

    void Promise.resolve().then(async () => {
      try {
        const result = await getAllBookmarks();
        if (!cancelled) {
          // Ensure result is an array
          if (Array.isArray(result)) {
            setBookmarks(result);
            cache.set(BOOKMARKS_CACHE_KEY, result);
          } else {
            console.error('getAllBookmarks returned non-array:', result);
            setBookmarks([]);
            setError("Received invalid bookmark data from server.");
          }
        }
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
  }, [cache]);

  const handleUpdate = async (
    id: string,
    payload: { name: string; note: string },
  ) => {
    try {
      await updateBookmark(id, payload);
      const updatedBookmarks = bookmarks.map((bm) =>
        bm.id === id ? { ...bm, ...payload } : bm,
      );
      setBookmarks(updatedBookmarks);
      cache.set(BOOKMARKS_CACHE_KEY, updatedBookmarks);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update bookmark."));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this bookmark?")) return;
    try {
      await deleteBookmark(id);
      const updatedBookmarks = bookmarks.filter((bm) => bm.id !== id);
      setBookmarks(updatedBookmarks);
      cache.set(BOOKMARKS_CACHE_KEY, updatedBookmarks);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete bookmark."));
    }
  };

  return (
    <main className="mx-auto min-h-full w-full max-w-4xl px-5 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <BookmarkIcon size={21} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-primary">Bookmarks</h1>
          <p className="text-sm text-secondary">
            Saved PDF pages ({bookmarks.length})
          </p>
        </div>
      </header>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-error px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-accent" />
        </div>
      ) : (
        <BookmarkList
          bookmarks={bookmarks}
          showMaterial
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onNavigate={(bookmark) => {
            if (!bookmark.materialId) return;
            navigate(`/workspace/${bookmark.materialId}?page=${bookmark.pageNumber}`);
          }}
        />
      )}
    </main>
  );
}
