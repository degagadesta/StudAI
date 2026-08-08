import type { ReactNode } from "react";
import {
  formatEventTime,
  getRemainingTimeLabel,
  urgencyTier,
} from "../../utils/dateHelpers";
import type { ScheduleEvent } from "../../api/Scheduleapi";

const TONE_CLASSES: Record<"urgent" | "soon" | "later", string> = {
  urgent: "bg-[#F7E8E8] text-[#8B3A3A]",
  soon: "bg-[#FBF1DE] text-[#8A6B34]",
  later: "bg-[#EFE8D4] text-[#5B6156]",
};

interface UpcomingEventsListProps {
  events: ScheduleEvent[];
  selectedId: string | null;
  onSelect: (event: ScheduleEvent) => void;
  title: string;
  headerAction?: ReactNode;
}

export default function UpcomingEventsList({
  events,
  selectedId,
  onSelect,
  title,
  headerAction,
}: UpcomingEventsListProps) {
  return (
    <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif text-lg text-[#253D31]">{title}</p>
        {headerAction}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#5B6156]">Nothing scheduled yet.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {events.map((event) => {
            const tone = urgencyTier(event.eventDate);
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#253D31] shrink-0" />
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
                  className={`text-xs font-mono px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${TONE_CLASSES[tone]}`}
                >
                  {getRemainingTimeLabel(event.eventDate)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
