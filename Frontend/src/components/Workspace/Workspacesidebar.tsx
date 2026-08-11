import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  Notebook,
} from "lucide-react";

export type WorkspaceTab =
  | "Notes"
  | "chat"
  | "exams"
  | "quiz"
  | "flashcards"
  | "upload";

interface WorkspaceSidebarProps {
  activeTab?: WorkspaceTab;
  onSelectTab?: (tab: WorkspaceTab) => void;
  onBack?: () => void;
}

const navItems: { id: WorkspaceTab; label: string; icon: React.ElementType }[] =
  [
    { id: "chat", label: "AI Chat", icon: Sparkles },
    { id: "Notes", label: "Notes", icon: Notebook },
    { id: "exams", label: "Previous Exams", icon: FileText },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
    { id: "flashcards", label: "Flash Cards", icon: Layers },
    { id: "upload", label: "Upload", icon: Upload },
  ];

export default function WorkspaceSidebar({
  activeTab: controlledActiveTab,
  onSelectTab,
  onBack,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const [internalTab, setInternalTab] = useState<WorkspaceTab>("chat");

  const currentTab = controlledActiveTab ?? internalTab;

  const handleTabClick = (tab: WorkspaceTab) => {
    setInternalTab(tab);
    onSelectTab?.(tab);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <aside className="w-16 h-full bg-[#FFFDF7] border-r border-[#DCD2B4] flex flex-col items-center py-4 px-2 shrink-0 select-none">
      {/* Back Button on top of AI Chat */}
      <div className="relative group w-full flex justify-center mb-3 pb-3 border-b border-[#DCD2B4]/60">
        <button
          type="button"
          onClick={handleBackClick}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[#5B6156] hover:bg-[#F3EFE0] hover:text-[#253D31] transition-all cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Hover Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium text-[#FFFDF7] bg-[#253D31] rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Back
        </div>
      </div>

      <nav className="flex-1 space-y-2 w-full flex flex-col items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <div
              key={item.id}
              className="relative group w-full flex justify-center"
            >
              <button
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#253D31] text-[#FFFDF7] shadow-sm"
                    : "text-[#5B6156] hover:bg-[#F3EFE0] hover:text-[#253D31]"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-[#C7D3B9]" : "text-[#5B6156]"}
                />
              </button>

              {/* Single-line hover tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium text-[#FFFDF7] bg-[#253D31] rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {item.label}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
