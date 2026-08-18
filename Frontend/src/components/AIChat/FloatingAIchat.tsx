import React, { useState, useRef, useCallback } from "react";
import { Sparkles, X, GripVertical } from "lucide-react";
import AIChatPanel from "./AIChatPanel";


export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

interface FloatingAIChatProps {
  courseName?: string;
  activePdfName?: string;
  onSendMessage?: (message: string) => Promise<string> | Promise<void>;
  initialQuestion?: string;
  onQuestionSent?: () => void;
}

const DEFAULT_PROMPTS = [
  "Summarize key points from this material",
  "Explain difficult concepts step-by-step",
  "Generate 5 quiz questions for revision",
];

// Initial mock chat history for demonstration
const INITIAL_HISTORY: ChatSession[] = [
  {
    id: "session-1",
    title: "Key concepts in Chapter 2",
    timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "Can you explain key concepts in Chapter 2?",
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: "m2",
        sender: "ai",
        text: "Chapter 2 covers core system architecture principles, including separation of concerns, modularity, and layered design patterns.",
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
    ],
  },
];

export default function FloatingAIChat({
  courseName,
  activePdfName,
  onSendMessage,
  initialQuestion,
  onQuestionSent,
}: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Position state for the button container (bottom-right origin)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 24,
    y: 24,
  });

  // Dragging refs and state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only trigger on primary click/touch

    setIsDragging(true);
    hasDragged.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { ...position };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };


  // Handle initial question from text selection (Ask AI feature)
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      // Open the chat window
      setIsOpen(true);
      setActiveView("chat");
      // Send the question automatically
      handleSend(initialQuestion);
      // Notify parent that question was sent
      if (onQuestionSent) {
        onQuestionSent();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  // --- DRAG HANDLERS ---
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaX = dragStartPos.current.x - e.clientX;
      const deltaY = dragStartPos.current.y - e.clientY;

      // Distinguish drag from tap/click
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasDragged.current = true;
      }

      // Keep button within screen bounds
      const newX = Math.max(
        16,
        Math.min(window.innerWidth - 180, elementStartPos.current.x + deltaX),
      );
      const newY = Math.max(
        16,
        Math.min(window.innerHeight - 60, elementStartPos.current.y + deltaY),
      );

      setPosition({ x: newX, y: newY });
    },
    [isDragging],
  );

  // Handle Drag End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Handle Click / Toggle
  const handleButtonClick = () => {
    if (!hasDragged.current) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
      className="fixed z-50 flex flex-col items-end select-none"
    >
      {/* Popover Chat Panel */}
      {isOpen && (
        <div className="mb-3 w-[380px] h-[520px] bg-[#FFFDF7] rounded-2xl shadow-2xl border border-[#DCD2B4] overflow-hidden flex flex-col">
          <AIChatPanel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* DRAGGABLE BUTTON */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleButtonClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-full bg-[#253D31] text-white shadow-lg hover:opacity-90 transition-opacity cursor-grab active:cursor-grabbing ${
          isDragging ? "scale-105 ring-4 ring-[#253D31]/30" : ""
        }`}
      >
        <GripVertical size={14} className="opacity-60" />
        {isOpen ? <X size={18} /> : <Sparkles size={18} />}
        <span className="text-xs font-semibold">
          {isOpen ? "Close Chat" : "Ask StudAI"}
        </span>
      </button>
    </div>
  );
}
