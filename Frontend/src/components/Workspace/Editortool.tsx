import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  History,
  Printer,
  Maximize2,
  Minimize2,
  ChevronDown,
  Plus,
  Baseline,
  Highlighter,
  Check,
  RotateCcw,
  Minus,
  Quote,
  Code,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  onPrint: () => void;
}

// Configuration Constants
const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Georgia",
  "Courier New",
  "Comic Sans MS",
];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];

const PRESET_COLORS = [
  { name: "Dark Green", hex: "#253D31" },
  { name: "Black", hex: "#000000" },
  { name: "Gray", hex: "#4B5563" },
  { name: "Red", hex: "#DC2626" },
  { name: "Amber", hex: "#D97706" },
  { name: "Emerald", hex: "#059669" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Purple", hex: "#7C3AED" },
];

const PRESET_HIGHLIGHTS = [
  { name: "Yellow", hex: "#FEF08A" },
  { name: "Green", hex: "#BBF7D0" },
  { name: "Blue", hex: "#BFDBFE" },
  { name: "Pink", hex: "#FBCFE8" },
  { name: "Orange", hex: "#FED7AA" },
  { name: "Purple", hex: "#E9D5FF" },
];

// Helper Portal Component for Floating Menus
interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}

function PortalPopover({
  isOpen,
  onClose,
  triggerRef,
  children,
}: PopoverProps) {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);
      return () => {
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
      };
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      className="fixed z-50 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-100"
    >
      {children}
    </div>,
    document.body,
  );
}

export default function EditorToolbar({
  editor,
  isFullScreen,
  setIsFullScreen,
  onPrint,
}: EditorToolbarProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedSize, setSelectedSize] = useState("16px");

  // Force component re-render on editor transactions/selection updates
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setTick((prev) => prev + 1);
    };

    // Subscribe to editor transactions & selection updates
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  // Refs for Portal Placement
  const fontRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLButtonElement>(null);
  const textColorRef = useRef<HTMLButtonElement>(null);
  const highlightRef = useRef<HTMLButtonElement>(null);
  const insertRef = useRef<HTMLButtonElement>(null);

  if (!editor) return null;

  const togglePopover = (name: string) => {
    setActivePopover((prev) => (prev === name ? null : name));
  };

  const closePopover = () => setActivePopover(null);

  return (
    <div className="flex items-center gap-1 bg-[#F9F8F3] border border-[#DCD2B4] rounded-xl p-1 overflow-x-auto no-scrollbar shrink-0 shadow-sm">
      {/* 1. Font Family Popover */}
      <button
        ref={fontRef}
        type="button"
        onClick={() => togglePopover("font")}
        className="flex items-center gap-1 bg-transparent text-xs font-medium text-[#253D31] py-1 px-2 hover:bg-[#EFEAD8] rounded-md transition-colors"
      >
        <span>{selectedFont}</span>
        <ChevronDown size={12} className="text-[#5B6156]" />
      </button>

      <PortalPopover
        isOpen={activePopover === "font"}
        onClose={closePopover}
        triggerRef={fontRef}
      >
        <div className="flex flex-col min-w-[130px]">
          {FONT_FAMILIES.map((font) => (
            <button
              key={font}
              type="button"
              onClick={() => {
                setSelectedFont(font);
                editor.chain().focus().setFontFamily(font).run();
                closePopover();
              }}
              style={{ fontFamily: font }}
              className={`flex items-center justify-between text-left px-2.5 py-1.5 text-xs rounded-md transition-colors hover:bg-[#F3EFE0] ${
                selectedFont === font
                  ? "font-bold text-[#253D31] bg-[#EAE4D0]"
                  : "text-[#5B6156]"
              }`}
            >
              <span>{font}</span>
              {selectedFont === font && <Check size={12} />}
            </button>
          ))}
        </div>
      </PortalPopover>

      {/* 2. Font Size Popover */}
      <button
        ref={sizeRef}
        type="button"
        onClick={() => togglePopover("size")}
        className="flex items-center gap-1 bg-transparent text-xs font-medium text-[#253D31] py-1 px-2 hover:bg-[#EFEAD8] rounded-md transition-colors"
      >
        <span>{parseInt(selectedSize)}</span>
        <ChevronDown size={12} className="text-[#5B6156]" />
      </button>

      <PortalPopover
        isOpen={activePopover === "size"}
        onClose={closePopover}
        triggerRef={sizeRef}
      >
        <div className="flex flex-col min-w-[70px]">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setSelectedSize(size);
                editor
                  .chain()
                  .focus()
                  .setMark("textStyle", { fontSize: size })
                  .run();
                closePopover();
              }}
              className={`flex items-center justify-between px-2.5 py-1 text-xs rounded-md transition-colors hover:bg-[#F3EFE0] ${
                selectedSize === size
                  ? "font-bold text-[#253D31] bg-[#EAE4D0]"
                  : "text-[#5B6156]"
              }`}
            >
              <span>{parseInt(size)}</span>
              {selectedSize === size && <Check size={12} />}
            </button>
          ))}
        </div>
      </PortalPopover>

      <Divider />

      {/* Basic Text Styles */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("bold")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Bold"
      >
        <Bold size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("italic")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Italic"
      >
        <Italic size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("underline")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Underline"
      >
        <UnderlineIcon size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("strike")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </button>

      {/* 3. Text Color Custom Swatch Popover */}
      <button
        ref={textColorRef}
        type="button"
        onClick={() => togglePopover("textColor")}
        className="flex items-center gap-1 p-1.5 rounded-md hover:bg-[#EFEAD8] text-[#5B6156] transition-colors"
        title="Text Color"
      >
        <Baseline size={15} />
        <ChevronDown size={12} />
      </button>

      <PortalPopover
        isOpen={activePopover === "textColor"}
        onClose={closePopover}
        triggerRef={textColorRef}
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-[#5B6156] uppercase px-1">
            Text Color
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_COLORS.map((item) => (
              <button
                key={item.hex}
                type="button"
                onClick={() => {
                  editor.chain().focus().setColor(item.hex).run();
                  closePopover();
                }}
                className="w-6 h-6 rounded-md border border-black/10 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: item.hex }}
                title={item.name}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              closePopover();
            }}
            className="flex items-center gap-1.5 text-[11px] text-[#5B6156] hover:bg-[#F3EFE0] p-1 rounded-md transition-colors mt-1"
          >
            <RotateCcw size={12} />
            <span>Reset color</span>
          </button>
        </div>
      </PortalPopover>

      {/* 4. Highlight Color Custom Swatch Popover */}
      <button
        ref={highlightRef}
        type="button"
        onClick={() => togglePopover("highlight")}
        className="flex items-center gap-1 p-1.5 rounded-md hover:bg-[#EFEAD8] text-[#5B6156] transition-colors"
        title="Highlight"
      >
        <Highlighter size={15} />
        <ChevronDown size={12} />
      </button>

      <PortalPopover
        isOpen={activePopover === "highlight"}
        onClose={closePopover}
        triggerRef={highlightRef}
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-[#5B6156] uppercase px-1">
            Highlight Color
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_HIGHLIGHTS.map((item) => (
              <button
                key={item.hex}
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setHighlight({ color: item.hex })
                    .run();
                  closePopover();
                }}
                className="w-6 h-6 rounded-md border border-black/10 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: item.hex }}
                title={item.name}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetHighlight().run();
              closePopover();
            }}
            className="flex items-center gap-1.5 text-[11px] text-[#5B6156] hover:bg-[#F3EFE0] p-1 rounded-md transition-colors mt-1"
          >
            <RotateCcw size={12} />
            <span>Clear highlight</span>
          </button>
        </div>
      </PortalPopover>

      <Divider />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive({ textAlign: "left" })
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Align Left"
      >
        <AlignLeft size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive({ textAlign: "center" })
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Align Center"
      >
        <AlignCenter size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive({ textAlign: "right" })
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Align Right"
      >
        <AlignRight size={15} />
      </button>

      <Divider />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("orderedList")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Numbered List"
      >
        <ListOrdered size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md hover:bg-[#EFEAD8] transition-colors ${
          editor.isActive("bulletList")
            ? "bg-[#EAE4D0] text-[#253D31]"
            : "text-[#5B6156]"
        }`}
        title="Bullet List"
      >
        <List size={15} />
      </button>

      <Divider />

      {/* History Actions (Undo & Redo) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-md text-[#5B6156] hover:bg-[#EFEAD8] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        title="Undo"
      >
        <Undo size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-md text-[#5B6156] hover:bg-[#EFEAD8] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        title="Redo"
      >
        <Redo size={15} />
      </button>

      <Divider />

      {/* 5. Insert Block Popover */}
      <button
        ref={insertRef}
        type="button"
        onClick={() => togglePopover("insert")}
        className="flex items-center gap-1 bg-transparent text-xs font-medium text-[#253D31] py-1 px-2 hover:bg-[#EFEAD8] rounded-md transition-colors"
      >
        <Plus size={14} />
        <span>Insert</span>
        <ChevronDown size={12} className="text-[#5B6156]" />
      </button>

      <PortalPopover
        isOpen={activePopover === "insert"}
        onClose={closePopover}
        triggerRef={insertRef}
      >
        <div className="flex flex-col min-w-[140px]">
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              closePopover();
            }}
            className="flex items-center gap-2 text-left px-2.5 py-1.5 text-xs text-[#5B6156] hover:bg-[#F3EFE0] hover:text-[#253D31] rounded-md transition-colors"
          >
            <Minus size={14} />
            <span>Divider</span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleBlockquote().run();
              closePopover();
            }}
            className="flex items-center gap-2 text-left px-2.5 py-1.5 text-xs text-[#5B6156] hover:bg-[#F3EFE0] hover:text-[#253D31] rounded-md transition-colors"
          >
            <Quote size={14} />
            <span>Blockquote</span>
          </button>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              closePopover();
            }}
            className="flex items-center gap-2 text-left px-2.5 py-1.5 text-xs text-[#5B6156] hover:bg-[#F3EFE0] hover:text-[#253D31] rounded-md transition-colors"
          >
            <Code size={14} />
            <span>Code Block</span>
          </button>
        </div>
      </PortalPopover>

      <Divider />

      {/* Utility Actions */}
      <button
        type="button"
        onClick={() => alert("Version history: Loading previous revisions...")}
        className="p-1.5 rounded-md text-[#5B6156] hover:bg-[#EFEAD8] transition-colors"
        title="Version History"
      >
        <History size={15} />
      </button>

      <button
        type="button"
        onClick={onPrint}
        className="p-1.5 rounded-md text-[#5B6156] hover:bg-[#EFEAD8] transition-colors"
        title="Print Notes"
      >
        <Printer size={15} />
      </button>

      <button
        type="button"
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="p-1.5 rounded-md text-[#5B6156] hover:bg-[#EFEAD8] transition-colors"
        title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-[1px] bg-[#DCD2B4] mx-0.5 shrink-0" />;
}
