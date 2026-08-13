import { useState } from "react";
import { useParams } from "react-router-dom";
import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import SettingsModal, { type TabType } from "./SettingsModal";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("profile");

  const handleOpenSettings = (tab?: string) => {
    setSettingsTab((tab as TabType) || "profile");
    setIsSettingsOpen(true);
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#FDFBF7] overflow-hidden">
      {/* 1. Topbar */}
      <WorkspaceTopbar
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenShare={() => alert("Share link copied to clipboard!")}
        onOpenUpgrade={() => handleOpenSettings("plan")}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon-only Sidebar */}
        <WorkspaceSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Document Viewer & Selected Tool */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 border-r border-[#DCD2B4] overflow-y-auto p-6">
            {id ? <PdfViewerPage /> : <div>No material selected</div>}
          </div>

          <div className="w-96 flex flex-col bg-[#FFFDF7] overflow-y-auto p-6">
            {activeTab === "upload" && <div>Upload Content</div>}
            {activeTab === "chat" && <div>AI Chat Interface</div>}
            {activeTab === "exams" && <div>Previous Exams Viewer</div>}
            {activeTab === "quiz" && <div>Quiz Generator & Practice</div>}
            {activeTab === "flashcards" && <div>Flash Cards Deck</div>}
          </div>
        </div>
      </div>

      {/* 3. Floating AI Chat Overlay */}
      <FloatingAIChat />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
