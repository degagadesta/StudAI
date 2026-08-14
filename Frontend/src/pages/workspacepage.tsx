import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceSidebar, {
  type WorkspaceTab,
} from "../components/Workspace/Workspacesidebar";
import WorkspaceTopbar from "../components/Workspace/Workspacetopbar";
import FloatingAIChat from "../components/AIChat/FloatingAIchat";
import PdfViewerPage from "./PdfViewerPage";
import SettingsModal from "./SettingsModal";
import { getMaterials, type Material } from "../api/Materialsapi";
import { askQuestion } from "../api/aiApi";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");
  const [material, setMaterial] = useState<Material | null>(null);
  const [aiInitialQuestion, setAiInitialQuestion] = useState<string>("");

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "plan" | "course" | "theme">("profile");

  const handleOpenSettings = (tab?: string) => {
    if (tab === "profile" || tab === "plan" || tab === "course" || tab === "theme") {
      setSettingsTab(tab);
    }
    setIsSettingsOpen(true);
  };

  // Fetch material to get context for AI chat
  useEffect(() => {
    if (id) {
      getMaterials()
        .then((materials) => {
          const found = materials.find((m) => m.id === id);
          if (found) setMaterial(found);
        })
        .catch(() => {});
    }
  }, [id]);

  // Handle Ask AI from text selection
  const handleAskAI = (selectedText: string) => {
    setAiInitialQuestion(selectedText);
  };

  // Clear initial question after it's been sent
  const handleQuestionSent = () => {
    setAiInitialQuestion("");
  };

  // AI Chat Handler
  const handleAIChatSend = async (message: string): Promise<string> => {
    if (!material?.id || !material?.curriculumCourseId) {
      console.error("Missing material context:", { materialId: material?.id, curriculumCourseId: material?.curriculumCourseId });
      return "Sorry, I need material context to answer your questions.";
    }

    try {
      console.log("Sending AI chat request:", {
        curriculumCourseId: material.curriculumCourseId,
        materialId: material.id,
        question: message.substring(0, 50) + "...",
      });

      const response = await askQuestion(
        material.curriculumCourseId,
        material.id,
        message,
      );

      console.log("AI chat response received:", {
        sessionId: response.sessionId,
        answerLength: response.answer?.length,
      });

      return response.answer || "I couldn't generate a response.";
    } catch (error: any) {
      console.error("AI chat error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      // Provide more specific error messages
      if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
        return "The AI is taking longer than expected. The material might still be processing. Please try again in a moment.";
      }
      if (error?.response?.status === 500) {
        return "The AI service encountered an error. Please try again or contact support if this persists.";
      }
      if (error?.response?.status === 404) {
        return "This material was not found. Please refresh the page and try again.";
      }
      if (error?.response?.status === 400) {
        return error?.response?.data?.message || "Invalid request. Please try rephrasing your question.";
      }

      return "Sorry, I encountered an error. Please try again.";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFBF7] overflow-hidden">
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
            {id ? <PdfViewerPage onAskAI={handleAskAI} /> : <div>No material selected</div>}
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

      {/* 3. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 4. Floating AI Chat */}
      <FloatingAIChat
        courseName={material?.courseName}
        activePdfName={material?.fileName}
        onSendMessage={handleAIChatSend}
        initialQuestion={aiInitialQuestion}
        onQuestionSent={handleQuestionSent}
      />
    </div>
  );
}
