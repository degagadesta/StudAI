import { useState } from "react";
import { Trash2, Check, Sparkles } from "lucide-react";
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
  onDelete,
  onAskAI,
  onClose,
}: Props) {
  const [note, setNote] = useState(initialNote);
  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <div
      className="fixed z-50 bg-white border border-[#DCD2B4] rounded-xl shadow-lg p-2 flex flex-col gap-2"
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

        <div className="w-px h-4 bg-[#DCD2B4] mx-1" />

        <button
          type="button"
          onClick={() => setShowNoteInput((s) => !s)}
          className="text-xs text-secondary hover:text-primary px-1"
        >
          Note
        </button>

        {mode === "create" && onAskAI && selectedText && (
          <button
            type="button"
            onClick={() => {
              onAskAI(selectedText);
              onClose();
            }}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-secondary px-1.5 py-0.5 rounded hover:bg-accent/10 transition-colors"
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
            className="text-error hover:opacity-70 px-1"
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
            className="flex-1 text-xs border border-[#DCD2B4] rounded-md px-2 py-1 outline-none"
            maxLength={1000}
          />
          <button
            type="button"
            onClick={() => {
              onSaveNote?.(note);
              setShowNoteInput(false);
              onClose();
            }}
            className="text-accent-secondary"
          >
            <Check size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
