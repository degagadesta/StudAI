import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, isSameDay } from "../../utils/dateHelpers";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CalendarGrid({
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
  eventDates,
}: {
  viewDate: Date;
  onViewDateChange: (d: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  eventDates: Date[]; // dates that have at least one event
}) {
  const grid = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const today = new Date();

  function goToMonth(offset: number) {
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  }

  return (
    <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono text-[#A9A18A] uppercase tracking-wide">
          Calendar
        </p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F4EFDD] text-[#5B6156] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-serif text-xl text-[#253D31]">
          {viewDate.toLocaleDateString("en-US", { month: "long" })}
        </p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F4EFDD] text-[#5B6156] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-xs text-[#A9A18A] font-medium pb-1">
            {d}
          </div>
        ))}

        {grid.map((date, i) => {
          const inCurrentMonth = date.getMonth() === viewDate.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasEvent = eventDates.some((ed) => isSameDay(ed, date));

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`relative w-9 h-9 mx-auto rounded-full text-sm flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-[#253D31] text-[#F6F1E3]"
                  : isToday
                  ? "text-[#2F4A3D] font-semibold"
                  : inCurrentMonth
                  ? "text-[#253D31] hover:bg-[#F4EFDD]"
                  : "text-[#DCD2B4]"
              }`}
            >
              {date.getDate()}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#8CA37E]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}