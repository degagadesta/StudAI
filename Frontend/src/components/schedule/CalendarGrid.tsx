import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, isSameDay } from "../../utils/dateHelpers";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface CalendarGridProps {
  viewDate: Date;
  onViewDateChange: (d: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  eventDates: Date[];
}

export default function CalendarGrid({
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
  eventDates,
}: CalendarGridProps) {
  const grid = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const today = new Date();

  function goToMonth(offset: number) {
    onViewDateChange(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  }

  return (
    <div className="bg-surface border border-default rounded-2xl p-6">
      <p className="text-xs font-mono text-muted uppercase tracking-wide mb-1">
        Calendar
      </p>

      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-hover text-secondary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-serif text-xl text-primary">
          {viewDate.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-hover text-secondary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-xs text-muted font-medium pb-1">
            {d}
          </div>
        ))}

        {grid.map((date, i) => {
          const inCurrentMonth = date.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate
            ? isSameDay(date, selectedDate)
            : false;
          const hasEvent = eventDates.some((ed) => isSameDay(ed, date));

          let cellClasses =
            "relative w-9 h-9 mx-auto rounded-full text-sm flex items-center justify-center transition-colors ";

          if (isSelected) {
            cellClasses += "bg-accent text-inverse cursor-pointer";
          } else if (hasEvent) {
            // dark green marking for dates that have user-created events
            cellClasses +=
              "text-primary font-semibold bg-accent-light hover:bg-elevated cursor-pointer";
          } else if (isToday) {
            cellClasses += "text-accent font-semibold cursor-not-allowed";
          } else if (inCurrentMonth) {
            cellClasses += "text-primary cursor-not-allowed opacity-70";
          } else {
            cellClasses += "text-[#DCD2B4] cursor-not-allowed";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={!hasEvent}
              onClick={hasEvent ? () => onSelectDate(date) : undefined}
              className={cellClasses}
            >
              {date.getDate()}
              {hasEvent && (
                <span
                  className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-accent-secondary" : "bg-accent"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
