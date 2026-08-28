import { useState, useEffect, ChangeEvent } from "react";
import { Search, Bell, Settings } from "lucide-react";
import { stripControlChars, capLength } from "../../utils/security/sanitize";
import { getAcademicProfile } from "../../api/Coursesapi";
import { getUpcomingEventNotifications } from "../../api/NotificationApi";
import SettingsModal from "../../pages/SettingsModal";
import NotificationsModal from "../../pages/NotificationsModal";

const SEARCH_MAX_LEN = 100;

interface TopbarProps {
  onSearch?: (query: string) => void;
  unreadCount?: number;
}

export default function Topbar({
  onSearch,
  unreadCount: externalUnreadCount,
}: TopbarProps) {
  const [query, setQuery] = useState("");
  const [firstName, setFirstName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Fetch Academic Profile
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

  // Fetch Notification Count
  const fetchNotificationCount = async () => {
    try {
      const notifications = await getUpcomingEventNotifications();
      // Counts all unread notifications (or total items if read field is omitted)
      const count = notifications.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch (err) {
      // Silently fail if endpoint is temporarily unreachable
    }
  };

  useEffect(() => {
    if (externalUnreadCount !== undefined) {
      setUnreadCount(externalUnreadCount);
    } else {
      fetchNotificationCount();
    }
  }, [externalUnreadCount, isNotificationsOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = capLength(
      stripControlChars(e.target.value),
      SEARCH_MAX_LEN,
    );
    setQuery(cleaned);
    onSearch?.(cleaned.trim());
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    fetchNotificationCount(); // Sync count when closing the modal
  };

  return (
    <>
      <header className="flex items-center justify-between gap-6 px-8 pt-8 pb-6">
        <div>
          <h1 className="font-serif text-2xl text-primary leading-tight">
            Hello, {firstName ?? "Student"}!
          </h1>
          <p className="text-sm text-secondary mt-0.5">
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
              className="w-64 pl-4 pr-11 py-2.5 text-sm bg-surface border border-default rounded-full outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Search size={14} className="text-inverse" />
            </span>
          </div>

          {/* Trigger Notifications Modal with Dynamic Badge Count */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Notifications"
            className="relative w-11 h-11 rounded-full bg-surface border border-default flex items-center justify-center text-secondary hover:bg-elevated transition-colors cursor-pointer"
          >
            <Bell size={17} strokeWidth={1.9} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-[#D85A30] text-[#FFFDF7] text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#FFFDF7] leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Trigger Settings Modal */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            className="w-11 h-11 rounded-full bg-surface border border-default flex items-center justify-center text-secondary hover:bg-elevated transition-colors cursor-pointer"
          >
            <Settings size={17} strokeWidth={1.9} />
          </button>
        </div>
      </header>

      {/* Notifications Modal Render */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
      />

      {/* Settings Modal Render */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
