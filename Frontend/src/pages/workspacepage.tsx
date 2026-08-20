import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ZoomIn, ZoomOut, RotateCcw, GripHorizontal } from "lucide-react";

import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
  type NoteItem,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import NotesPanel from "./NotesPanel";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import AIChatPanel from "../components/AIChat/AIChatPanel";
import FlashcardsPanel from "../components/Workspace/FlashcardsPanel";
import SummaryPanel from "../components/Workspace/SummaryPanel";
import SettingsModal, { type TabType } from "./SettingsModal";
import { getMaterials, type Material } from "../api/Materialsapi";
import { askQuestion } from "../api/aiApi";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [material, setMaterial] = useState<Material | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  // --- Panel Visibility States (Only Notes & Chat sidebars) ---
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(true);

  // --- Draggable Modal States (For Exams, Quiz, Flashcards, & Summary) ---
  const [modalPos, setModalPos] = useState({ x: 120, y: 80 });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  }>({
    startX: 0,
    startY: 0,
    posX: 120,
    posY: 80,
  });

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("profile");

  // Panel Width States (in pixels)
  const [notesWidth, setNotesWidth] = useState<number>(360);
  const [chatWidth, setChatWidth] = useState<number>(360);

  // Dragging States for Sidebars
  const [isResizingNotes, setIsResizingNotes] = useState<boolean>(false);
  const [isResizingChat, setIsResizingChat] = useState<boolean>(false);

  // --- PDF Viewer Shared States ---
  const [scale, setScale] = useState<number>(1.0);
  const [pdfMeta, setPdfMeta] = useState<{
    fileName: string;
    courseName: string;
  } | null>(null);
  const [readPercent, setReadPercent] = useState<number>(0);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.5));
  const handleZoomReset = () => setScale(1.0);

  const handleMetaLoaded = useCallback(
    (meta: { fileName: string; courseName: string }) => {
      setPdfMeta(meta);
    },
    [],
  );

  const handleProgressChange = useCallback((percent: number) => {
    setReadPercent(percent);
  }, []);


  const [askAIQuestion, setAskAIQuestion] = useState<string | null>(null);

  const handleAskAIFromSelection = useCallback((selectedText: string) => {
    const trimmed = selectedText.trim().slice(0, 2000);
    setAskAIQuestion(`Explain this: "${trimmed}"`);
  }, []);

  // Load material details
  useEffect(() => {
    if (!id) return;

    getMaterials()
      .then((materials) => {
        const found = materials.find((m) => m.id === id);
        if (found) {
          setMaterial(found);
        }
      })
      .catch((err) => {
        console.error("Failed to load material:", err);
      });
  }, [id]);

  const handleOpenSettings = (tab?: string) => {
    setSettingsTab((tab as TabType) || "profile");
    setIsSettingsOpen(true);
  };

  // Sidebar Tab Click Handler
  const handleTabSelect = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (tab === "notes") {
      setShowNotes(true);
    } else if (tab === "chat") {
      setShowChat(true);
    }
  };

  // Sidebar Sub-item Selection Handlers
  const handleNoteSelect = (note: NoteItem) => {
    setSelectedNote(note);
    setShowNotes(true);
  };

  const handleMaterialSelect = (selectedMat: Material) => {
    setMaterial(selectedMat);
  };

  // --- Modal Dragging Logic ---
  const handleModalMouseDown = (e: React.MouseEvent) => {
    setIsDraggingModal(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: modalPos.x,
      posY: modalPos.y,
    };
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingModal) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setModalPos({
          x: Math.max(20, dragRef.current.posX + dx),
          y: Math.max(20, dragRef.current.posY + dy),
        });
      }
      if (isResizingNotes) {
        const chatPanelOffset = showChat ? chatWidth : 0;
        const notesRightEdge = window.innerWidth - chatPanelOffset;
        const newNotesWidth = notesRightEdge - e.clientX;
        if (newNotesWidth >= 240 && newNotesWidth <= 600) {
          setNotesWidth(newNotesWidth);
        }
      }
      if (isResizingChat) {
        const newChatWidth = window.innerWidth - e.clientX;
        if (newChatWidth >= 260 && newChatWidth <= 550) {
          setChatWidth(newChatWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingModal(false);
      setIsResizingNotes(false);
      setIsResizingChat(false);
      document.body.style.userSelect = "";
    };

    if (isDraggingModal || isResizingNotes || isResizingChat) {
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingModal, isResizingNotes, isResizingChat, chatWidth, showChat]);

  const handleAIChatSend = async (message: string): Promise<string> => {
    if (!material) {
      return "Please open a PDF first to chat about it.";
    }

    try {
      const result = await askQuestion(
        material.curriculumCourseId,
        material.id,
        message,
      );
      return result.answer;
    } catch (error: unknown) {
      console.error("AI chat error:", error);
      throw error;
    }
  };

  // Check if any modal tab is selected
  const isModalViewActive =
    activeTab === "exams" ||
    activeTab === "quiz" ||
    activeTab === "flashcards" ||
    activeTab === "summary";

  return (
    <div className="relative flex flex-col h-screen bg-[#FDFBF7] overflow-hidden select-none">
      {/* Topbar */}
      <WorkspaceTopbar
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenShare={() => alert("Share link copied to clipboard!")}
        onOpenUpgrade={() => handleOpenSettings("plan")}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Sidebar Navigation */}
        <WorkspaceSidebar
          activeTab={activeTab}
          selectedNoteId={selectedNote?.id}
          selectedMaterialId={material?.id}
          onSelectTab={handleTabSelect}
          onSelectNote={handleNoteSelect}
          onSelectMaterial={handleMaterialSelect}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {/* SECTION 1: PDF Viewer Panel */}
          <div className="flex flex-col flex-1 min-w-[280px] bg-[#FFFDF7]">
            {/* Top Toolbar */}
            <div className="flex flex-col border-b border-[#DCD2B4]/60 bg-[#FFFDF7]">
              <div className="grid grid-cols-3 items-center px-4 py-2">
                {/* Left Column: Zoom Controls */}
                <div className="flex items-center gap-1.5 justify-start">
                  <div className="flex items-center bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-md transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="text-xs font-mono px-2 text-[#5B6156]">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-md transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomReset}
                      className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-md transition-colors border-l border-[#DCD2B4] cursor-pointer"
                      title="Reset Zoom"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* Center Column: Material & Course Title */}
                <div className="text-center min-w-0">
                  {pdfMeta ? (
                    <>
                      <p className="text-sm font-medium text-[#253D31] truncate">
                        {pdfMeta.fileName}
                      </p>
                      <p className="text-xs text-[#5B6156] truncate">
                        {pdfMeta.courseName}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-[#5B6156]">
                      Workspace Material
                    </p>
                  )}
                </div>

                {/* Right Column: Progress & Close Button */}
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-xs font-mono text-[#5B6156]">
                    {readPercent}% read
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/workspace")}
                    className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors cursor-pointer"
                    title="Close Material"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-[#DCD2B4]/40 w-full overflow-hidden">
                <div
                  className="h-full bg-[#253D31] transition-all duration-300"
                  style={{ width: `${readPercent}%` }}
                />
              </div>
            </div>

            {/* Document Content Container */}
            <div className="flex-1 overflow-hidden p-4">
              {id ? (
                <PdfViewerPage
                  scale={scale}
                  onMetaLoaded={handleMetaLoaded}
                  onProgressChange={handleProgressChange}
                  onAskAI={handleAskAIFromSelection}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#5B6156]">
                  No material selected
                </div>
              )}
            </div>
          </div>

          {/* DRAGGABLE MODAL: Summary, Exams, Quiz, & Flashcards */}
          {isModalViewActive && (
            <div
              style={{
                transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
              }}
              className="absolute z-40 w-[460px] max-h-[80vh] flex flex-col bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Draggable Header */}
              <div
                onMouseDown={handleModalMouseDown}
                className="flex items-center justify-between px-4 py-3 bg-[#F3EFE0]/70 border-b border-[#DCD2B4]/60 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <GripHorizontal size={16} className="text-[#5B6156]" />
                  <span className="text-sm font-semibold text-[#253D31] capitalize">
                    {activeTab === "summary" && "Document Summary"}
                    {activeTab === "exams" && "Previous Exams Viewer"}
                    {activeTab === "quiz" && "Quiz Generator & Practice"}
                    {activeTab === "flashcards" && "Flashcards Panel"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="p-1 text-[#5B6156] hover:text-[#253D31] hover:bg-[#DCD2B4]/40 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#FFFDF7]">
                {activeTab === "summary" && (
                  <SummaryPanel
                    materialId={id || ""}
                    materialName={material?.fileName}
                  />
                )}
                {activeTab === "exams" && (
                  <div className="text-sm text-[#253D31]">
                    Previous Exams Viewer Content
                  </div>
                )}
                {activeTab === "quiz" && (
                  <div className="text-sm text-[#253D31]">
                    Quiz Generator & Practice Content
                  </div>
                )}
                {activeTab === "flashcards" && material && (
                  <FlashcardsPanel
                    materialId={material.id}
                    materialName={material.fileName}
                  />
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: Notes Side Panel Drawer */}
          {showNotes && (
            <>
              <div
                onMouseDown={() => setIsResizingNotes(true)}
                className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${isResizingNotes ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
                  }`}
                title="Drag to resize Notes panel"
              >
                <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
              </div>

              <div
                style={{ width: `${notesWidth}px` }}
                className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 shrink-0 overflow-hidden"
              >
                <NotesPanel
                  materialId={id}
                  onClose={() => setShowNotes(false)}
                />
              </div>
            </>
          )}

          {/* SECTION 3: AI Chat Sidebar Drawer */}
          {showChat && (
            <>
              <div
                onMouseDown={() => setIsResizingChat(true)}
                className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${isResizingChat ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
                  }`}
                title="Drag to resize AI Chat panel"
              >
                <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
              </div>

              <div
                style={{ width: `${chatWidth}px` }}
                className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 shrink-0 overflow-hidden"
              >
                <AIChatPanel
                  isEmbedded
                  courseName={material?.courseName}
                  activePdfName={material?.fileName}
                  onSendMessage={handleAIChatSend}
                  onClose={() => setShowChat(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating AI Chat Overlay */}
      <FloatingAIChat
        courseName={material?.courseName}
        activePdfName={material?.fileName}
        materialId={material?.id}
        onSendMessage={handleAIChatSend}
        initialQuestion={askAIQuestion ?? undefined}
        onQuestionSent={() => setAskAIQuestion(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}