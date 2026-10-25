import { useState } from "react";
import { BookmarkPlus, Loader2, X } from "lucide-react";
import type { Bookmark, CreateBookmarkPayload } from "../../api/BookmarkApi";
import BookmarkList from "./BookmarkList";

interface BookmarkPanelProps {
  materialName?: string;
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  requestedPage?: number;
  onClose?: () => void;
  onNavigate: (pageNumber: number) => void;
  onCreate: (payload: CreateBookmarkPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: { name: string; note: string }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export default function BookmarkPanel({
  materialName,
  bookmarks,
  isLoading,
  error,
  requestedPage = 1,
  onClose,
  onNavigate,
  onCreate,
  onUpdate,
  onDelete,
}: BookmarkPanelProps) {
  const [pageNumber, setPageNumber] = useState(requestedPage);
  const [name, setName] = useState(() => `Page ${requestedPage}`);
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setFormError("Enter a bookmark name.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      await onCreate({
        name: name.trim(),
        pageNumber,
        note: note.trim() || undefined,
      });
      setName("");
      setNote("");
    } catch {
      setFormError(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-default px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-primary">Bookmarks</h2>
          {materialName && (
            <p className="truncate text-xs text-muted">{materialName}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bookmarks"
            className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-primary"
          >
            <X size={16} />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <form onSubmit={(event) => void handleCreate(event)} className="mb-4 space-y-2 rounded-lg border border-default bg-page p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <BookmarkPlus size={14} />
            Save a page
          </h3>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="bookmark-page">Page number</label>
            <input
              id="bookmark-page"
              type="number"
              min={1}
              value={pageNumber}
              onChange={(event) => setPageNumber(Math.max(1, Number(event.target.value)))}
              className="w-20 rounded-md border border-default bg-surface px-2 py-1.5 text-sm text-primary"
            />
            <label className="sr-only" htmlFor="bookmark-name">Bookmark name</label>
            <input
              id="bookmark-name"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              placeholder="Bookmark name"
              className="min-w-0 flex-1 rounded-md border border-default bg-surface px-2 py-1.5 text-sm text-primary"
            />
          </div>
          <label className="sr-only" htmlFor="bookmark-note">Bookmark note</label>
          <textarea
            id="bookmark-note"
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note (optional)"
            className="w-full resize-y rounded-md border border-default bg-surface px-2 py-1.5 text-xs text-primary"
          />
          {(formError || error) && (
            <p role="alert" className="text-xs text-error">{formError ?? error}</p>
          )}
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-medium text-inverse disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
            Add bookmark
          </button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-8" aria-label="Loading bookmarks">
            <Loader2 size={18} className="animate-spin text-accent" />
          </div>
        ) : (
          <BookmarkList
            bookmarks={bookmarks}
            onNavigate={(bookmark) => onNavigate(bookmark.pageNumber)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}
      </div>
    </section>
  );
}
