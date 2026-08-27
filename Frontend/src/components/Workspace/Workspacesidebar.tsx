import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  Notebook,
  PanelLeft,
  PanelLeftClose,
  ChevronDown,
  ChevronRight,
  File,
  Loader2,
} from "lucide-react";
import { getMaterials, type Material } from "../../api/Materialsapi";

export type WorkspaceTab =
  | "notes"
  | "chat"
  | "summary"
  | "exams"
  | "quiz"
  | "flashcards"
  | "upload";

export interface NoteItem {
  id: string;
  title: string;
}

interface WorkspaceSidebarProps {
  activeTab?: WorkspaceTab;
  selectedNoteId?: string | null;
  selectedMaterialId?: string | null;
  onSelectTab?: (tab: WorkspaceTab) => void;
  onBack?: () => void;
  materials?: Material[];
  notes?: NoteItem[];
  onSelectMaterial?: (material: Material) => void;
  onSelectNote?: (note: NoteItem) => void;
}

export default function WorkspaceSidebar({
  activeTab: controlledActiveTab,
  selectedNoteId,
  selectedMaterialId,
  onSelectTab,
  onBack,
  materials: initialMaterials,
  notes = [],
  onSelectMaterial,
  onSelectNote,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const [internalTab, setInternalTab] = useState<WorkspaceTab>("chat");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTopButtonHovered, setIsTopButtonHovered] = useState(false);

  // Sub-menu toggle state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Materials state (auto-fetched if not passed via props)
  const [materials, setMaterials] = useState<Material[]>(
    initialMaterials || [],
  );
  const [isLoadingMaterials, setIsLoadingMaterials] =
    useState(!initialMaterials);

  const currentTab = controlledActiveTab ?? internalTab;

  useEffect(() => {
    if (initialMaterials) {
      setMaterials(initialMaterials);
      return;
    }

    let isMounted = true;
    async function fetchMaterials() {
      try {
        setIsLoadingMaterials(true);
        const data = await getMaterials();
        if (isMounted) {
          setMaterials(data);
        }
      } catch (error) {
        console.error("Failed to load materials:", error);
      } finally {
        if (isMounted) {
          setIsLoadingMaterials(false);
        }
      }
    }

    fetchMaterials();
    return () => {
      isMounted = false;
    };
  }, [initialMaterials]);

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

  const toggleNotesSubMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) setIsExpanded(true);
    setIsNotesOpen((prev) => !prev);
  };

  const toggleUploadSubMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) setIsExpanded(true);
    setIsUploadOpen((prev) => !prev);
  };

  const handleNotesTabClick = () => {
    if (currentTab === "notes") {
      setIsNotesOpen((prev) => !prev);
    } else {
      handleTabClick("notes");
      setIsNotesOpen(true);
    }
  };

  const handleUploadTabClick = () => {
    if (currentTab === "upload") {
      setIsUploadOpen((prev) => !prev);
    } else {
      handleTabClick("upload");
      setIsUploadOpen(true);
    }
  };

  const handleMaterialClick = (material: Material) => {
    handleTabClick("upload");
    onSelectMaterial?.(material);
    navigate(`/workspace/${material.id}`);
  };

  const handleNoteClick = (note: NoteItem) => {
    handleTabClick("notes");
    onSelectNote?.(note);
  };

  return (
    <aside
      className={`h-full bg-surface border-r border-default flex flex-col py-4 shrink-0 select-none transition-all duration-300 ease-in-out ${
        isExpanded ? "w-60 px-3" : "w-16 px-2 items-center"
      }`}
    >
      {/* Header Actions */}
      <div className="w-full flex flex-col mb-3 pb-3 border-b border-default">
        {!isExpanded ? (
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              onMouseEnter={() => setIsTopButtonHovered(true)}
              onMouseLeave={() => setIsTopButtonHovered(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-secondary hover:bg-surface-hover hover:text-primary transition-all cursor-pointer"
              aria-label="Expand Sidebar"
            >
              {isTopButtonHovered ? (
                <PanelLeft size={20} className="text-accent" />
              ) : (
                <ArrowLeft size={20} />
              )}
            </button>

            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium text-inverse bg-accent rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Expand Sidebar
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-secondary hover:bg-surface-hover hover:text-primary transition-all cursor-pointer"
            >
              <ArrowLeft size={18} className="shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">
                Back to Home
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-secondary hover:bg-surface-hover hover:text-primary transition-all cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 w-full flex flex-col overflow-y-auto no-scrollbar">
        {/* 1. AI CHAT */}
        <NavItem
          id="chat"
          label="AI Chat"
          icon={Sparkles}
          isActive={currentTab === "chat"}
          isExpanded={isExpanded}
          onClick={() => handleTabClick("chat")}
        />

        {/* 2. SUMMARY */}
        <NavItem
          id="summary"
          label="Summary"
          icon={FileText}
          isActive={currentTab === "summary"}
          isExpanded={isExpanded}
          onClick={() => handleTabClick("summary")}
        />

        {/* 3. NOTES */}
        <div>
          <NavItem
            id="notes"
            label="Notes"
            icon={Notebook}
            isActive={currentTab === "notes"}
            isExpanded={isExpanded}
            onClick={handleNotesTabClick}
            hasDropdown
            isOpen={isNotesOpen}
            onToggleDropdown={toggleNotesSubMenu}
          />
          {isExpanded && isNotesOpen && (
            <div className="ml-7 mt-1 space-y-1 border-l-2 border-default pl-2 py-1">
              {notes.length === 0 ? (
                <p className="px-2 py-1 text-[11px] text-muted italic">
                  No notes yet
                </p>
              ) : (
                notes.map((note) => {
                  const isNoteActive = selectedNoteId === note.id;
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => handleNoteClick(note)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all truncate flex items-center gap-2 cursor-pointer ${
                        isNoteActive
                          ? "bg-accent text-inverse font-medium"
                          : "text-secondary hover:text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <FileText
                        size={14}
                        className={`shrink-0 ${
                          isNoteActive ? "text-inverse" : "opacity-70"
                        }`}
                      />
                      <span className="truncate">{note.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 4. PREVIOUS EXAMS */}
        <NavItem
          id="exams"
          label="Previous Exams"
          icon={FileText}
          isActive={currentTab === "exams"}
          isExpanded={isExpanded}
          onClick={() => handleTabClick("exams")}
        />

        {/* 5. QUIZ */}
        <NavItem
          id="quiz"
          label="Quiz"
          icon={HelpCircle}
          isActive={currentTab === "quiz"}
          isExpanded={isExpanded}
          onClick={() => handleTabClick("quiz")}
        />

        {/* 6. FLASHCARDS */}
        <NavItem
          id="flashcards"
          label="Flash Cards"
          icon={Layers}
          isActive={currentTab === "flashcards"}
          isExpanded={isExpanded}
          onClick={() => handleTabClick("flashcards")}
        />

        {/* 7. UPLOAD */}
        <div>
          <NavItem
            id="upload"
            label="Upload"
            icon={Upload}
            isActive={currentTab === "upload"}
            isExpanded={isExpanded}
            onClick={handleUploadTabClick}
            hasDropdown
            isOpen={isUploadOpen}
            onToggleDropdown={toggleUploadSubMenu}
          />
          {isExpanded && isUploadOpen && (
            <div className="ml-7 mt-1 space-y-1 border-l-2 border-default pl-2 py-1">
              {isLoadingMaterials ? (
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Loading materials</span>
                </div>
              ) : materials.length === 0 ? (
                <p className="px-2 py-1 text-[11px] text-muted italic">
                  No materials uploaded
                </p>
              ) : (
                materials.map((mat) => {
                  const isMatActive = selectedMaterialId === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => handleMaterialClick(mat)}
                      title={mat.fileName}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-all truncate flex items-center gap-2 cursor-pointer ${
                        isMatActive
                          ? "bg-accent text-inverse font-medium"
                          : "text-secondary hover:text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <File
                        size={14}
                        className={`shrink-0 ${
                          isMatActive ? "text-inverse" : "opacity-70"
                        }`}
                      />
                      <span className="truncate">{mat.fileName}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

interface NavItemProps {
  id: WorkspaceTab;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  hasDropdown?: boolean;
  isOpen?: boolean;
  onToggleDropdown?: (e: React.MouseEvent) => void;
}

function NavItem({
  label,
  icon: Icon,
  isActive,
  isExpanded,
  onClick,
  hasDropdown,
  isOpen,
  onToggleDropdown,
}: NavItemProps) {
  return (
    <div
      className={`relative group w-full flex ${
        isExpanded ? "justify-start" : "justify-center"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`h-10 flex items-center rounded-xl transition-all cursor-pointer ${
          isExpanded
            ? "w-full px-3 gap-2.5 justify-between"
            : "w-10 justify-center"
        } ${
          isActive
            ? "bg-accent text-inverse shadow-sm"
            : "text-secondary hover:bg-surface-hover hover:text-primary"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            size={20}
            className={`shrink-0 ${
              isActive ? "text-inverse" : "text-secondary"
            }`}
          />
          {isExpanded && (
            <span
              className={`text-xs font-semibold truncate ${
                isActive ? "text-inverse" : "text-secondary"
              }`}
            >
              {label}
            </span>
          )}
        </div>

        {hasDropdown && isExpanded && (
          <span
            onClick={onToggleDropdown}
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </button>

      {!isExpanded && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium text-inverse bg-accent rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {label}
        </div>
      )}
    </div>
  );
}
