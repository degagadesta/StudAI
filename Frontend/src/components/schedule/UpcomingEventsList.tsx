import { daysUntil, formatEventTime } from "../../utils/dateHelpers";
import type { ScheduleEvent } from "../../api/Scheduleapi";

function badgeFor(event: ScheduleEvent, days: number): { text: string; tone: "urgent" | "soon" | "later" } {
  if (days === 0) return { text: "Today", tone: "urgent" };
  if (days === 1) return { text: "1 day left", tone: "soon" };
  return { text: `${days}d`, tone: "later" };
}

const TONE_CLASSES: Record<string, string> = {
  urgent: "bg-[#F7E8E8] text-[#8B3A3A]",
  soon: "bg-[#FBF1DE] text-[#8A6B34]",
  later: "bg-[#EFE8D4] text-[#5B6156]",
};

export default function UpcomingEventsList({
  events,
  selectedId,
  onSelect,
}: {
  events: ScheduleEvent[];
  selectedId: string | null;
  onSelect: (event: ScheduleEvent) => void;
}) {
  return (
    <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
      <p className="font-serif text-lg text-[#253D31] mb-4">Upcoming</p>

      {events.length === 0 ? (
        <p className="text-sm text-[#5B6156]">Nothing scheduled yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {events.map((event) => {
            const days = daysUntil(event.eventDate);
            const badge = badgeFor(event, days);
            const isSelected = event.id === selectedId;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                  isSelected ? "bg-[#EAF3DE]" : "hover:bg-[#F4EFDD]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8CA37E] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#253D31] truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-[#A9A18A]">
                    {new Date(event.eventDate).toLocaleDateString()} ·{" "}
                    {formatEventTime(event.eventDate)}
                  </p>
                </div>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full shrink-0 ${TONE_CLASSES[badge.tone]}`}
                >
                  {badge.text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}