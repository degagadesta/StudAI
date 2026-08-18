import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import NotesPanel from "./NotesPanel";
import SettingsModal, { type TabType } from "./SettingsModal";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import AIChatPanel from "../components/AIChat/AIChatPanel";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
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
    if (tab === "Notes") {
      setShowNotes(true);
    } else if (tab === "chat") {
      setShowChat(true);
    }
  };

  // 1. Resize Handler for Notes Panel (Middle Divider)
  const resizeNotes = useCallback(
    (e: MouseEvent) => {
      if (isResizingNotes) {
        const availableSpaceRight = window.innerWidth - e.clientX;
        const currentChatWidth = showChat ? chatWidth : 0;
        const newNotesWidth = availableSpaceRight - currentChatWidth;

        if (newNotesWidth >= 240 && newNotesWidth <= 600) {
          setNotesWidth(newNotesWidth);
        }
      }
    },
    [isResizingNotes, chatWidth, showChat],
  );

  // 2. Resize Handler for Chat Panel (Rightmost Divider)
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
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingNotes) resizeNotes(e);
      if (isResizingChat) resizeChat(e);
    };

    if (isResizingNotes || isResizingChat) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingNotes, isResizingChat, resizeNotes, resizeChat]);
  // Handle AI Chat messages - connect to backend
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
    } catch (error: any) {
      console.error("AI chat error:", error);
      throw error;
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#FDFBF7] overflow-hidden select-none">
      {/* Topbar */}
      <WorkspaceTopbar
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenShare={() => alert("Share link copied to clipboard!")}
        onOpenUpgrade={() => handleOpenSettings("plan")}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Sidebar Navigation */}
        <WorkspaceSidebar activeTab={activeTab} onSelectTab={handleTabSelect} />

        <div className="flex-1 flex overflow-hidden">
          {/* SECTION 1: PDF Viewer Panel */}
          <div className="flex flex-col flex-1 min-w-[280px] bg-[#FFFDF7]">
            {/* Top Toolbar: Zoom Controls, Material Details, Progress & Close */}
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

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {id ? (
                <PdfViewerPage
                  scale={scale}
                  onMetaLoaded={(meta) => setPdfMeta(meta)}
                  onProgressChange={(percent) => setReadPercent(percent)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#5B6156]">
                  No material selected
                </div>
              )}
            </div>
          <div className="w-96 flex flex-col bg-[#FFFDF7] overflow-y-auto">
            {activeTab === "upload" && (
              <div className="p-6">Upload Content</div>
            )}
            {activeTab === "chat" && (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-sm text-secondary mb-2">
                    Click the floating "Ask AI" button
                  </p>
                  <p className="text-xs text-secondary">
                    to start chatting about this material
                  </p>
                </div>
              </div>
            )}
            {activeTab === "exams" && <div className="p-6">Previous Exams Viewer</div>}
            {activeTab === "quiz" && (
              <div className="p-6">Quiz Generator & Practice</div>
            )}
            {activeTab === "flashcards" && material && (
              <FlashcardsPanel
                materialId={material.id}
                materialName={material.fileName}
              />
            )}
            {activeTab === "notes" && (
              <SummaryPanel
                materialId={material?.id || ""}
                materialName={material?.fileName}
              />
            )}
          </div>

          {/* SECTION 2: Notes Panel */}
          {showNotes && (
            <>
              {/* Splitter: Between PDF and Notes */}
              <div
                onMouseDown={() => setIsResizingNotes(true)}
                className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
                  isResizingNotes ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
                }`}
                title="Drag to resize Notes panel"
              >
                <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
              </div>

              {/* Notes Sidebar Container */}
              <div
                style={{ width: `${notesWidth}px` }}
                className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 shrink-0 overflow-hidden"
              >
                {/* Header bar with title and close button */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DCD2B4]/60 bg-[#FFFDF7]">
                  <h3 className="text-sm font-medium text-[#253D31]">Notes</h3>
                  <button
                    type="button"
                    onClick={() => setShowNotes(false)}
                    className="p-1.5 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors cursor-pointer"
                    title="Close Notes Panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Notes Content */}
                <div className="flex-1 overflow-y-auto">
                  <NotesPanel
                    materialId={id}
                    onClose={() => setShowNotes(false)}
                    onAskAI={(prompt) => {
                      console.log("Send to AI:", prompt);
                      setShowChat(true);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* SECTION 3: Workspace Sidebar AI Chat */}
          {showChat && (
            <>
              {/* Splitter: Between Main Area and AI Chat */}
              <div
                onMouseDown={() => setIsResizingChat(true)}
                className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
                  isResizingChat ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
                }`}
                title="Drag to resize AI Chat panel"
              >
                <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
              </div>

              {/* AI Chat Sidebar */}
              <div
                style={{ width: `${chatWidth}px` }}
                className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 shrink-0 overflow-hidden"
              >
                <AIChatPanel
                  isEmbedded
                  onClose={() => setShowChat(false)}
                  activePdfName={id ? `Material #${id}` : undefined}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating AI Chat Button & Popover Modal */}
      <FloatingAIChat />
      {/* 3. Floating AI Chat Overlay */}
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
