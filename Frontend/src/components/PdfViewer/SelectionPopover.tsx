import { useState } from "react";
import { Trash2, Check, Sparkles, Bookmark } from "lucide-react";
import type { HighlightColor } from "../../api/HighlightApi";

const COLORS: HighlightColor[] = ["yellow", "green", "blue", "pink", "orange"];
const SWATCH: Record<HighlightColor, string> = {
  yellow: "#FBC02D",
  green: "#4CAF50",
  blue: "#2196F3",
  pink: "#E91E63",
  orange: "#FF9800",
};

interface Props {
  x: number;
  y: number;
  mode: "create" | "edit";
  selectedText?: string;
  initialNote?: string;
  onPickColor: (color: HighlightColor) => void;
  onSaveNote?: (note: string) => void;
  onSaveBookmark?: (name: string, selectedText: string) => void;
  onDelete?: () => void;
  onAskAI?: (text: string) => void;
  onClose: () => void;
}

export default function SelectionPopover({
  x,
  y,
  mode,
  selectedText,
  initialNote = "",
  onPickColor,
  onSaveNote,
  onSaveBookmark,
  onDelete,
  onAskAI,
  onClose,
}: Props) {
  const [note, setNote] = useState(initialNote);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showBookmarkInput, setShowBookmarkInput] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");

  return (
    <div
      className="fixed z-50 bg-surface border border-default rounded-xl shadow-xl p-2 flex flex-col gap-2"
      style={{ top: y, left: x, transform: "translate(-50%, -110%)" }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPickColor(c)}
            className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
            style={{ backgroundColor: SWATCH[c] }}
            aria-label={`Highlight ${c}`}
          />
        ))}

        <div className="w-px h-4 bg-default mx-1" />

        <button
          type="button"
          onClick={() => setShowNoteInput((s) => !s)}
          className="text-xs text-secondary hover:text-primary px-1 font-medium transition-colors"
        >
          Note
        </button>

        {mode === "create" && onSaveBookmark && selectedText && (
          <button
            type="button"
            onClick={() => {
              setShowBookmarkInput((s) => !s);
              setShowNoteInput(false);
            }}
            className="flex items-center gap-1 text-xs text-secondary hover:text-primary px-1 font-medium transition-colors"
          >
            <Bookmark size={12} />
            Bookmark
          </button>
        )}

        {mode === "create" && onAskAI && selectedText && (
          <button
            type="button"
            onClick={() => {
              onAskAI(selectedText);
              onClose();
            }}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-secondary px-1.5 py-0.5 rounded-lg bg-accent-light hover:bg-elevated transition-colors font-medium"
            title="Ask AI about this text"
          >
            <Sparkles size={12} />
            Ask AI
          </button>
        )}

        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-error hover:opacity-70 px-1 transition-opacity"
            aria-label="Delete highlight"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {showNoteInput && (
        <div className="flex items-center gap-1.5 w-56">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 text-xs bg-elevated text-primary border border-default rounded-md px-2 py-1 outline-none placeholder:text-muted focus:border-accent"
            maxLength={1000}
          />
          <button
            type="button"
            onClick={() => {
              onSaveNote?.(note);
              setShowNoteInput(false);
              onClose();
            }}
            className="text-accent hover:opacity-80 transition-opacity"
          >
            <Check size={16} />
          </button>
        </div>
      )}

      {showBookmarkInput && (
        <div className="flex items-center gap-1.5 w-56">
          <input
            autoFocus
            value={bookmarkName}
            onChange={(e) => setBookmarkName(e.target.value)}
            placeholder="Name this bookmark..."
            className="flex-1 text-xs bg-elevated text-primary border border-default rounded-md px-2 py-1 outline-none placeholder:text-muted focus:border-accent"
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && bookmarkName.trim() && selectedText) {
                onSaveBookmark?.(bookmarkName.trim(), selectedText);
                setShowBookmarkInput(false);
                setBookmarkName("");
                onClose();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (bookmarkName.trim() && selectedText) {
                onSaveBookmark?.(bookmarkName.trim(), selectedText);
                setShowBookmarkInput(false);
                setBookmarkName("");
                onClose();
              }
            }}
            className="text-accent hover:opacity-80 transition-opacity disabled:opacity-40"
            disabled={!bookmarkName.trim()}
          >
            <Check size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
