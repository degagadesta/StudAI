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
    <header className="h-14 w-full bg-surface border-b border-default px-4 flex items-center justify-between shrink-0 select-none gap-4">
      {/* 1. Logo */}
      <Link to="/app/analytics" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent text-inverse rounded-lg flex items-center justify-center font-bold shadow-sm">
          <BookOpen size={18} />
        </div>
        <span className="font-serif font-semibold text-primary text-lg tracking-tight hidden sm:inline">
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
            className="w-90 pl-4 pr-11 py-2 text-sm bg-page text-primary border border-default rounded-full outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
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

        <div className="h-4 w-px bg-default hidden sm:block" />

        {/* Share Button */}
        <button
          type="button"
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
          title="Share Workspace"
        >
          <Share2 size={15} />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Upgrade Button */}
        <button
          type="button"
          onClick={handleUpgradeClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-inverse hover:bg-accent-hover rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Sparkles size={14} className="text-inverse" />
          <span>Upgrade</span>
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => onOpenSettings?.()}
          className="p-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
