import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { getUpcomingEvents, type ScheduleEvent } from "../api/Scheduleapi";
import { getApiErrorMessage } from "../api/authApi";

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUpcomingEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load your schedule."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">Schedule</h1>
      <p className="text-sm text-[#5B6156] mb-8">
        Upcoming quizzes and exams. The Dashboard's countdown pulls from here.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#EFE8D4] animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-[#5B6156]">Nothing scheduled yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EFE8D4] flex items-center justify-center shrink-0">
                <Calendar size={17} className="text-[#2F4A3D]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#253D31] truncate">
                  {event.title}
                </p>
                <p className="text-xs text-[#A9A18A]">{event.courseName}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#8A6B34] bg-[#EFE8D4] px-2.5 py-1 rounded-full shrink-0">
                <Clock size={12} />
                {daysUntil(event.date)}d left
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
