import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Share2, Sparkles, Settings, BookOpen } from "lucide-react";
import StudyTimer from "./workspacetimer";

interface WorkspaceTopbarProps {
  onOpenSettings?: (tab?: string) => void;
  onOpenShare?: () => void;
  onOpenUpgrade?: () => void;
}

const SEARCH_MAX_LEN = 100;

export default function WorkspaceTopbar({
  onOpenSettings,
  onOpenShare,
  onOpenUpgrade,
}: WorkspaceTopbarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleUpgradeClick = () => {
    if (onOpenUpgrade) {
      onOpenUpgrade();
    } else if (onOpenSettings) {
      onOpenSettings("plan");
    }
  };

  return (
    <header className="h-14 w-full bg-[#FFFDF7] border-b border-[#DCD2B4] px-4 flex items-center justify-between shrink-0 select-none gap-4">
      {/* 1. Logo */}
      <Link to="/app/analytics" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#253D31] text-[#FFFDF7] rounded-lg flex items-center justify-center font-bold shadow-sm">
          <BookOpen size={18} className="text-[#C7D3B9]" />
        </div>
        <span className="font-serif font-semibold text-[#253D31] text-lg tracking-tight hidden sm:inline">
          StudAI
        </span>
      </Link>

      {/* 2. Search Bar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            maxLength={SEARCH_MAX_LEN}
            placeholder="Search..."
            className="w-90 pl-4 pr-11 py-2 text-sm bg-surface border border-default rounded-full outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <Search size={14} className="text-inverse" />
          </span>
        </div>
      </div>

      {/* 3. Timer, Share, Upgrade & Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Extracted Study Timer */}
        <StudyTimer />

        <div className="h-4 w-px bg-[#DCD2B4] hidden sm:block" />

        {/* Share Button */}
        <button
          type="button"
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors"
          title="Share Workspace"
        >
          <Share2 size={15} />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Upgrade Button */}
        <button
          type="button"
          onClick={handleUpgradeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#253D31] text-[#FFFDF7] hover:bg-[#1C2E25] rounded-lg transition-colors shadow-sm"
        >
          <Sparkles size={14} className="text-[#C7D3B9]" />
          <span>Upgrade</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => onOpenSettings?.()}
          className="p-2 text-[#5B6156] hover:text-[#253D31] hover:bg-[#F3EFE0] rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
