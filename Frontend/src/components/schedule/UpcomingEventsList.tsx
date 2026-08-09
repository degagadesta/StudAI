import type { ReactNode } from "react";
import {
  formatEventTime,
  getRemainingTimeLabel,
  urgencyTier,
} from "../../utils/dateHelpers";
import type { ScheduleEvent } from "../../api/Scheduleapi";

const TONE_CLASSES: Record<"urgent" | "soon" | "later", string> = {
  urgent: "bg-error text-error",
  soon: "bg-[#FBF1DE] text-[#8A6B34]",
  later: "bg-elevated text-secondary",
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
    <div className="bg-surface border border-default rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif text-lg text-primary">{title}</p>
        {headerAction}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-secondary">Nothing scheduled yet.</p>
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
                  isSelected ? "bg-accent-light" : "hover:bg-surface-hover"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted">
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
