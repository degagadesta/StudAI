import { useState, useEffect, ChangeEvent } from "react";
import { Search, Bell, Settings } from "lucide-react";
import { stripControlChars, capLength } from "../../utils/security/sanitize";
import { getAcademicProfile } from "../../api/Coursesapi";

const SEARCH_MAX_LEN = 100;

interface TopbarProps {
  onSearch?: (query: string) => void;
  hasUnreadNotifications?: boolean;
}

export default function Topbar({
  onSearch,
  hasUnreadNotifications = true,
}: TopbarProps) {
  const [query, setQuery] = useState("");
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAcademicProfile()
      .then((profile) => {
        if (!cancelled) setFirstName(profile.fullName.split(" ")[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = capLength(
      stripControlChars(e.target.value),
      SEARCH_MAX_LEN,
    );
    setQuery(cleaned);
    onSearch?.(cleaned.trim());
  };

  const initial = (firstName ?? "S").charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-6 px-8 pt-8 pb-6">
      <div>
        <h1 className="font-serif text-2xl text-[#253D31] leading-tight">
          Hello, {firstName ?? "Student"}!
        </h1>
        <p className="text-sm text-[#5B6156] mt-0.5">
          Explore your courses and study activity
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            maxLength={SEARCH_MAX_LEN}
            placeholder="Search..."
            className="w-64 pl-4 pr-11 py-2.5 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-full outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
          />
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#253D31] flex items-center justify-center">
            <Search size={14} className="text-[#F6F1E3]" />
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative w-11 h-11 rounded-full bg-[#FFFDF7] border border-[#DCD2B4] flex items-center justify-center text-[#5B6156] hover:bg-[#EFE8D4] transition-colors"
        >
          <Bell size={17} strokeWidth={1.9} />
          {hasUnreadNotifications && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D85A30] ring-2 ring-[#FFFDF7]" />
          )}
        </button>

        <button
          type="button"
          aria-label="Settings"
          className="w-11 h-11 rounded-full bg-[#FFFDF7] border border-[#DCD2B4] flex items-center justify-center text-[#5B6156] hover:bg-[#EFE8D4] transition-colors"
        >
          <Settings size={17} strokeWidth={1.9} />
        </button>
      </div>
    </header>
  );
}
