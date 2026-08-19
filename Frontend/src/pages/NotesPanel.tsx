import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";

import { Sparkles, Loader2, X, Notebook } from "lucide-react";

import EditorToolbar from "../components/Workspace/Editortool";
import { getMaterialNotes, saveMaterialNotes } from "../api/Materialsapi";

// Custom FontSize Extension to support font sizing dropdown in toolbar
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

interface NotesPanelProps {
  materialId?: string;
  onGenerateNotes?: () => Promise<string> | void;
  onClose?: () => void;
}

export default function NotesPanel({
  materialId,
  onGenerateNotes,
  onClose,
}: NotesPanelProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef<string>("");

  // Initialize TipTap Editor with automatic background saving & required extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Take your own notes here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[350px] p-4 text-primary font-sans leading-relaxed dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => {
      if (!materialId) return;
      const htmlContent = editor.getHTML();
      latestContentRef.current = htmlContent;

      // 1. Save instantly to local storage
      localStorage.setItem(`studai_note_${materialId}`, htmlContent);

      // 2. Debounce API call (saves 1s after user stops typing)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveMaterialNotes(materialId, htmlContent).catch((err) =>
          console.error("Auto-save failed:", err),
        );
      }, 1000);
    },
  });

  // Load Saved Notes on Mount or Material Switch
  useEffect(() => {
    if (!materialId || !editor) return;

    getMaterialNotes(materialId)
      .then((savedContent) => {
        if (savedContent) {
          editor.commands.setContent(savedContent);
          latestContentRef.current = savedContent;
        }
      })
      .catch(() => {
        const local = localStorage.getItem(`studai_note_${materialId}`);
        if (local && editor) {
          editor.commands.setContent(local);
          latestContentRef.current = local;
        }
      });
  }, [materialId, editor]);

  // Flush remaining unsaved notes if component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (materialId && latestContentRef.current) {
        saveMaterialNotes(materialId, latestContentRef.current).catch(() => {});
      }
    };
  }, [materialId]);

  // Handle Note Generation Trigger
  const handleGenerateClick = async () => {
    if (!editor) return;
    setIsGenerating(true);
    try {
      if (onGenerateNotes) {
        const generatedText = await onGenerateNotes();
        if (generatedText) {
          editor.commands.setContent(generatedText);
        }
      }
    } catch (error) {
      console.error("Failed to generate notes:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    if (!editor) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Study Notes</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; color: #253D31; line-height: 1.6; }
            h1, h2, h3 { color: #253D31; }
          </style>
        </head>
        <body>
          ${editor.getHTML()}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-surface ${
        isFullScreen
          ? "fixed inset-0 z-50 p-6 bg-surface overflow-y-auto"
          : "relative p-3"
      }`}
    >
      {/* Panel Top Header Bar with Close Button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-default shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
            <Notebook size={15} />
          </div>
          <h4 className="text-xs font-semibold text-primary">Study Notes</h4>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
            title="Close Notes"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 1. Rich-Text Toolbar Component */}
      <EditorToolbar
        editor={editor}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        onPrint={handlePrint}
      />

      {/* 2. Text Editor Container with Generate Button */}
      <div className="flex-1 overflow-y-auto mt-2 bg-page border border-default rounded-xl p-3 shadow-inner flex flex-col items-start gap-3">
        {/* Generate Notes Pill Button */}
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-light hover:bg-elevated text-accent border border-accent/20 rounded-full text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 size={13} className="animate-spin text-accent" />
          ) : (
            <Sparkles size={13} className="text-accent" />
          )}
          <span>{isGenerating ? "Generating..." : "Generate Notes"}</span>
        </button>

        {/* Tiptap Canvas */}
        <div className="w-full flex-1">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
