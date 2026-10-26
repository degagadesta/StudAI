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
import BookmarkList from "../components/Bookmarks/BookmarkList";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      try {
        const result = await getAllBookmarks();
        if (!cancelled) {
          // Ensure result is an array
          if (Array.isArray(result)) {
            setBookmarks(result);
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
  }, []);

  const handleUpdate = async (
    id: string,
    payload: { name: string; note: string },
  ) => {
    try {
      const updated = await updateBookmark(id, payload);
      setBookmarks((current) =>
        current.map((bookmark) =>
          bookmark.id === id ? { ...bookmark, ...updated } : bookmark,
        ),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update bookmark."));
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete bookmark."));
      throw err;
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
