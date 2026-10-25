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

const PAGE_SIZE = 100;

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await getAllBookmarks(PAGE_SIZE, bookmarks.length);
      setBookmarks((current) => [...current, ...result.bookmarks]);
      setTotal(result.total);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load more bookmarks."));
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      try {
        const result = await getAllBookmarks(PAGE_SIZE, 0);
        if (!cancelled) {
          setBookmarks(result.bookmarks);
          setTotal(result.total);
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
      setTotal((current) => Math.max(0, current - 1));
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
            Saved PDF pages ({total})
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
      {!isLoading && total > bookmarks.length && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={isLoadingMore}
          className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-default px-4 py-2 text-sm text-secondary hover:bg-elevated disabled:opacity-50"
        >
          {isLoadingMore && <Loader2 size={15} className="animate-spin" />}
          Load more ({bookmarks.length} of {total})
        </button>
      )}
    </main>
  );
}
