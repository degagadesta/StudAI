import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import NotesPanel from "./NotesPanel";
import SettingsModal, { type TabType } from "./SettingsModal";
import FloatingAIChat from "../components/AIChat/FloatingAIchat"; // Fallback/Modal if needed

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("profile");

  // Panel Width States (in pixels)
  const [notesWidth, setNotesWidth] = useState<number>(360);
  const [chatWidth, setChatWidth] = useState<number>(360);

  // Dragging States
  const [isResizingNotes, setIsResizingNotes] = useState<boolean>(false);
  const [isResizingChat, setIsResizingChat] = useState<boolean>(false);

  const handleOpenSettings = (tab?: string) => {
    setSettingsTab((tab as TabType) || "profile");
    setIsSettingsOpen(true);
  };

  // 1. Resize Handler for Notes Panel (Middle Divider)
  const resizeNotes = useCallback(
    (e: MouseEvent) => {
      if (isResizingNotes) {
        // Calculate remaining width from cursor to screen edge minus Chat width
        const availableSpaceRight = window.innerWidth - e.clientX;
        const newNotesWidth = availableSpaceRight - chatWidth;

        // Keep Notes panel between 240px and 600px
        if (newNotesWidth >= 240 && newNotesWidth <= 600) {
          setNotesWidth(newNotesWidth);
        }
      }
    },
    [isResizingNotes, chatWidth],
  );

  // 2. Resize Handler for Chat Panel (Rightmost Divider)
  const resizeChat = useCallback(
    (e: MouseEvent) => {
      if (isResizingChat) {
        const newChatWidth = window.innerWidth - e.clientX;

        // Keep Chat panel between 260px and 550px
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

  return (
    <div className="relative flex flex-col h-screen bg-[#FDFBF7] overflow-hidden select-none">
      {/* 1. Topbar */}
      <WorkspaceTopbar
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenShare={() => alert("Share link copied to clipboard!")}
        onOpenUpgrade={() => handleOpenSettings("plan")}
      />

      {/* 2. Main 3-Section Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Sidebar Navigation */}
        <WorkspaceSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="flex-1 flex overflow-hidden">
          {/* SECTION 1: PDF Viewer Panel (Fills all remaining space) */}
          <div className="flex-1 overflow-y-auto p-4 min-w-[280px]">
            {id ? (
              <PdfViewerPage />
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                No material selected
              </div>
            )}
          </div>

          {/* SPLITTER 1: Between PDF and Notes */}
          <div
            onMouseDown={() => setIsResizingNotes(true)}
            className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
              isResizingNotes ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
            }`}
            title="Drag to resize Notes panel"
          >
            <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
          </div>

          {/* SECTION 2: Notes Panel */}
          <div
            style={{ width: `${notesWidth}px` }}
            className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 overflow-y-auto p-4 shrink-0"
          >
            <NotesPanel
              materialId={id}
              onAskAI={(prompt) => {
                // Pre-fill prompt logic into AI Chat if needed
                console.log("Send to AI:", prompt);
              }}
            />
          </div>

          {/* SPLITTER 2: Between Notes and AI Chat */}
          <div
            onMouseDown={() => setIsResizingChat(true)}
            className={`w-1.5 hover:w-2 hover:bg-[#253D31]/30 cursor-col-resize transition-all shrink-0 flex items-center justify-center group ${
              isResizingChat ? "bg-[#253D31]/40 w-2" : "bg-[#DCD2B4]/40"
            }`}
            title="Drag to resize AI Chat panel"
          >
            <div className="w-0.5 h-8 bg-[#5B6156]/30 group-hover:bg-[#253D31] rounded-full transition-colors" />
          </div>

          {/* SECTION 3: AI Chat Panel */}
          <div
            style={{ width: `${chatWidth}px` }}
            className="flex flex-col bg-[#FFFDF7] border-l border-[#DCD2B4]/60 overflow-y-auto p-4 shrink-0"
          >
            {/* Insert your inline AI Chat component here */}
            <div className="flex flex-col h-full">
              <div className="pb-3 mb-3 border-b border-[#DCD2B4]">
                <h3 className="text-sm font-semibold text-[#253D31]">
                  AI Assistant
                </h3>
              </div>
              <div className="flex-1 text-sm text-muted">
                AI Chat interface goes here...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
