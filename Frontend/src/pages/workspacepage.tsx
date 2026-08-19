import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
  type NoteItem,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import NotesPanel from "./NotesPanel";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import AIChatPanel from "../components/AIChat/AIChatPanel";
import SummaryPanel from "../components/Workspace/SummaryPanel";
import FlashcardsPanel from "../components/Workspace/FlashcardsPanel";
import SettingsModal, { type TabType } from "./SettingsModal";
import { getMaterials, type Material } from "../api/Materialsapi";
import { askQuestion } from "../api/aiApi";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [material, setMaterial] = useState<Material | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  // --- Panel Visibility States ---
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(true);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("profile");

  // Panel Width States (in pixels)
  const [notesWidth, setNotesWidth] = useState<number>(360);
  const [chatWidth, setChatWidth] = useState<number>(360);

  // Dragging States
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
      setShowNotes((prev) => !prev);
    } else if (tab === "chat") {
      setShowChat((prev) => !prev);
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

  // 1. Resize Handler for Notes Panel
  const resizeNotes = useCallback(
    (e: MouseEvent) => {
      if (isResizingNotes) {
        const chatPanelOffset = showChat ? chatWidth : 0;
        const notesRightEdge = window.innerWidth - chatPanelOffset;
        const newNotesWidth = notesRightEdge - e.clientX;

        if (newNotesWidth >= 240 && newNotesWidth <= 600) {
          setNotesWidth(newNotesWidth);
        }
      }
    },
    [isResizingNotes, chatWidth, showChat],
  );

  // 2. Resize Handler for Chat Panel
  const resizeChat = useCallback(
    (e: MouseEvent) => {
      if (isResizingChat) {
        const newChatWidth = window.innerWidth - e.clientX;
        if (newChatWidth >= 260 && newChatWidth <= 550) {
          setChatWidth(newChatWidth);
        }
      }
    },
    [isResizingChat],
  );

  // Global mousemove/mouseup listeners
  useEffect(() => {
    const handleMouseUp = () => {
      setIsResizingNotes(false);
      setIsResizingChat(false);
      document.body.style.userSelect = "";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingNotes) resizeNotes(e);
      if (isResizingChat) resizeChat(e);
    };

    if (isResizingNotes || isResizingChat) {
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingNotes, isResizingChat, resizeNotes, resizeChat]);

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

  return (
    <div className="relative flex flex-col h-screen bg-page overflow-hidden select-none">
      {/* Topbar */}
      <WorkspaceTopbar
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenShare={() => alert("Share link copied to clipboard!")}
        onOpenUpgrade={() => handleOpenSettings("plan")}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Sidebar Navigation */}
        <WorkspaceSidebar
          activeTab={activeTab}
          selectedNoteId={selectedNote?.id}
          selectedMaterialId={material?.id}
          onSelectTab={handleTabSelect}
          onSelectNote={handleNoteSelect}
          onSelectMaterial={handleMaterialSelect}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* SECTION 1: PDF Viewer Panel */}
          <div className="flex flex-col flex-1 min-w-[280px] bg-surface">
            {/* Top Toolbar */}
            <div className="flex flex-col border-b border-default bg-surface">
              <div className="grid grid-cols-3 items-center px-4 py-2">
                {/* Left Column: Zoom Controls */}
                <div className="flex items-center gap-1.5 justify-start">
                  <div className="flex items-center bg-elevated border border-default rounded-lg p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="text-xs font-mono px-2 text-secondary">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomReset}
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-md transition-colors border-l border-default cursor-pointer"
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
                      <p className="text-sm font-medium text-primary truncate">
                        {pdfMeta.fileName}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        {pdfMeta.courseName}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-secondary">
                      Workspace Material
                    </p>
                  )}
                </div>

                {/* Right Column: Progress & Close Button */}
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-xs font-mono text-secondary">
                    {Math.min(100, Math.max(0, readPercent))}% read
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate("/workspace")}
                    className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                    title="Close Material"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-elevated w-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, readPercent))}%` }}
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
                />
              ) : (
                <div className="flex items-center justify-center h-full text-secondary">
                  No material selected
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Active Tab Main Panel Views */}
          {activeTab !== "chat" && activeTab !== "notes" && (
            <div className="w-96 flex flex-col bg-surface border-l border-default overflow-y-auto">
              {activeTab === "upload" && (
                <div className="p-6 text-primary font-serif text-lg">Upload Content</div>
              )}
              {activeTab === "exams" && (
                <div className="p-6 text-primary font-serif text-lg">Previous Exams Viewer</div>
              )}
              {activeTab === "quiz" && (
                <div className="p-6 text-primary font-serif text-lg">
                  Quiz Generator & Practice
                </div>
              )}
              {activeTab === "flashcards" && material && (
                <FlashcardsPanel
                  materialId={material.id}
                  materialName={material.fileName}
                />
              )}
            </div>
          )}

          {/* SECTION 3: Notes Side Panel Drawer */}
          {showNotes && (
            <>
              <div
                onMouseDown={() => setIsResizingNotes(true)}
                className={`w-1.5 hover:w-2 hover:bg-accent/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
                  isResizingNotes ? "bg-accent/40 w-2" : "bg-default"
                }`}
                title="Drag to resize Notes panel"
              >
                <div className="w-0.5 h-8 bg-muted group-hover:bg-accent rounded-full transition-colors" />
              </div>

              <div
                style={{ width: `${notesWidth}px` }}
                className="flex flex-col bg-surface border-l border-default shrink-0 overflow-hidden"
              >
                <NotesPanel
                  materialId={id}
                  onClose={() => setShowNotes(false)}
                />
              </div>
            </>
          )}

          {/* SECTION 4: AI Chat Sidebar Drawer */}
          {showChat && (
            <>
              <div
                onMouseDown={() => setIsResizingChat(true)}
                className={`w-1.5 hover:w-2 hover:bg-accent/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
                  isResizingChat ? "bg-accent/40 w-2" : "bg-default"
                }`}
                title="Drag to resize AI Chat panel"
              >
                <div className="w-0.5 h-8 bg-muted group-hover:bg-accent rounded-full transition-colors" />
              </div>

              <div
                style={{ width: `${chatWidth}px` }}
                className="flex flex-col bg-surface border-l border-default shrink-0 overflow-hidden"
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
        onSendMessage={handleAIChatSend}
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
