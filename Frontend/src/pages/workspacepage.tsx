import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import WorkspaceSidebar, {
  type WorkspaceTab,
} from "../components/Workspace/Workspacesidebar";
import PdfViewerPage from "./PdfViewerPage";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import SummaryPanel from "../components/Workspace/SummaryPanel";
import FlashcardsPanel from "../components/Workspace/FlashcardsPanel";
import SettingsModal, { type TabType } from "./SettingsModal";
import { getMaterials, type Material } from "../api/Materialsapi";
import { askQuestion } from "../api/aiApi";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [material, setMaterial] = useState<Material | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("profile");

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
        </div>
      </div>

      {/* 3. Floating AI Chat Overlay */}
      <FloatingAIChat
        courseName={material?.courseName}
        activePdfName={material?.fileName}
        onSendMessage={handleAIChatSend}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
