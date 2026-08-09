import React, { useState, useEffect } from "react";
import { X, Bell, Calendar, Loader2, Check, Trash2 } from "lucide-react";
import {
  getUpcomingEventNotifications,
  markNotificationAsRead,
  deleteNotification,
  type UpcomingEventNotification,
} from "../api/NotificationApi";
import { getApiErrorMessage } from "../api/authApi";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsUpdated?: () => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  onNotificationsUpdated,
}: NotificationsModalProps) {
  const [events, setEvents] = useState<UpcomingEventNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getUpcomingEventNotifications()
      .then((data) => {
        if (!cancelled) setEvents(data || []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            getApiErrorMessage(
              err,
              "Could not load upcoming event notifications.",
            ),
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Mark as Read on right side button click
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setEvents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      onNotificationsUpdated?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not mark notification as read."));
    }
  };

  // Handle Delete/Dismiss
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      onNotificationsUpdated?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove notification."));
    }
  };

  const formatDaysLeft = (daysLeft: number) => {
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "1 day left";
    return `${daysLeft} days left`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-surface border border-default rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-default/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-primary">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-primary leading-none">
                Upcoming Events
              </h3>
              <p className="text-xs text-secondary mt-1">
                Deadlines and upcoming schedules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-primary hover:bg-elevated rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-error border border-error text-error text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Notification Event List */}
        <div className="p-4 overflow-y-auto space-y-2.5 min-h-[200px] max-h-[380px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-secondary gap-2">
              <Loader2 size={22} className="animate-spin text-accent" />
              <span className="text-xs">Fetching upcoming events…</span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <Calendar size={28} className="mb-2 stroke-1 opacity-60" />
              <p className="text-xs">No upcoming events scheduled.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3.5 border rounded-xl flex items-center justify-between transition-all group relative ${
                  event.read
                    ? "bg-surface border-default/60 opacity-70"
                    : "bg-[#FAF7EE] border-default hover:border-accent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                    <Calendar size={17} className="text-accent" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-primary truncate">
                        {event.title}
                      </p>
                      {!event.read && (
                        <span className="w-2 h-2 rounded-full bg-[#D85A30] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-secondary mt-0.5 font-mono">
                      {event.eventDate}
                    </p>
                  </div>
                </div>

                {/* Right Side Controls: Badge & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      event.daysLeft <= 2
                        ? "bg-error text-error border border-error"
                        : "bg-elevated text-[#1E5652]"
                    }`}
                  >
                    {formatDaysLeft(event.daysLeft)}
                  </span>

                  {/* Mark as Read Button */}
                  {!event.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(event.id)}
                      title="Mark as read"
                      className="p-1.5 text-secondary hover:text-[#1E5652] hover:bg-elevated rounded-md transition-all cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  {/* Dismiss/Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    title="Dismiss notification"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-error hover:bg-error rounded-md transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
