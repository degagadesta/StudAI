import { useState } from "react";
import { Bookmark as BookmarkIcon, Check, Pencil, Trash2, X } from "lucide-react";
import type { Bookmark } from "../../api/BookmarkApi";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onNavigate: (bookmark: Bookmark) => void;
  onUpdate: (id: string, payload: { name: string; note: string }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  showMaterial?: boolean;
}

const colorStyles: Record<Bookmark["color"], string> = {
  yellow: "border-l-yellow-400",
  green: "border-l-green-500",
  blue: "border-l-blue-500",
  red: "border-l-red-500",
  purple: "border-l-purple-500",
  orange: "border-l-orange-500",
};

export default function BookmarkList({
  bookmarks,
  onNavigate,
  onUpdate,
  onDelete,
  showMaterial = false,
}: BookmarkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Safety check: ensure bookmarks is an array
  if (!Array.isArray(bookmarks)) {
    console.error('BookmarkList received non-array bookmarks:', bookmarks);
    return (
      <p className="py-8 text-center text-sm text-error">
        Invalid bookmark data received. Please refresh the page.
      </p>
    );
  }

  const startEditing = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setName(bookmark.name);
    setNote(bookmark.note ?? "");
  };

  const save = async (bookmark: Bookmark) => {
    if (!name.trim()) return;
    setSavingId(bookmark.id);
    setActionError(null);
    try {
      await onUpdate(bookmark.id, { name: name.trim(), note });
      setEditingId(null);
    } catch {
      setActionError("Could not update bookmark.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (bookmark: Bookmark) => {
    setActionError(null);
    try {
      await onDelete(bookmark.id);
    } catch {
      setActionError("Could not delete bookmark.");
    }
  };

  if (bookmarks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No bookmarks yet. Save a page to find it here.
      </p>
    );
  }

  return (
    <>
      {actionError && <p role="alert" className="mb-2 text-xs text-error">{actionError}</p>}
      <ul className="space-y-2">
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className={`rounded-lg border border-default border-l-4 ${colorStyles[bookmark.color] ?? colorStyles.yellow} bg-surface px-3 py-2.5`}
          >
            {editingId === bookmark.id ? (
              <div className="space-y-2">
                <input
                  aria-label="Bookmark name"
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-default bg-page px-2 py-1.5 text-sm text-primary"
                />
                <textarea
                  aria-label="Bookmark note"
                  maxLength={1000}
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full resize-y rounded-md border border-default bg-page px-2 py-1.5 text-xs text-primary"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel editing"
                    className="rounded-md p-1.5 text-muted hover:bg-elevated"
                  >
                    <X size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void save(bookmark)}
                    disabled={!name.trim() || savingId === bookmark.id}
                    aria-label="Save bookmark"
                    className="rounded-md p-1.5 text-accent hover:bg-elevated disabled:opacity-50"
                  >
                    <Check size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(bookmark)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    <BookmarkIcon size={14} className="shrink-0 text-accent" />
                    <span className="truncate">{bookmark.name}</span>
                  </span>
                  <span className="mt-1 block text-xs text-secondary">
                    Page {bookmark.pageNumber}
                    {showMaterial && bookmark.material?.title
                      ? ` · ${bookmark.material.title}`
                      : ""}
                  </span>
                  {bookmark.note && (
                    <span className="mt-1 block whitespace-pre-wrap break-words text-xs text-muted">
                      {bookmark.note}
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => startEditing(bookmark)}
                    aria-label={`Edit ${bookmark.name}`}
                    className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-primary"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(bookmark)}
                    aria-label={`Delete ${bookmark.name}`}
                    className="rounded-md p-1.5 text-muted hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
