import { X, Pencil, Trash2 } from "lucide-react";
import { getRemainingTimeLabel } from "../../utils/dateHelpers";
import type { ScheduleEvent } from "../../api/Scheduleapi";

interface EventDetailPanelProps {
  event: ScheduleEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: ScheduleEvent) => void;
}

export default function EventDetailPanel({
  event,
  onClose,
  onDelete,
  onEdit,
}: EventDetailPanelProps) {
  return (
    <div className="bg-accent text-inverse rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        <p className="font-serif text-xl leading-tight pr-3">{event.title}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-page/10 shrink-0 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-sm text-accent-light mb-1">
        {new Date(event.eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-sm text-accent-light mb-1">
        {new Date(event.eventDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
      <p className="text-xs font-mono text-accent mb-6">
        {getRemainingTimeLabel(event.eventDate)}
      </p>

      <div className="flex-1">
        <p className="text-sm text-inverse/80 leading-relaxed">
          {event.description || "No description added."}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-inverse/10">
        <button
          type="button"
          onClick={() => onDelete(event.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-inverse/20 text-xs font-semibold rounded-lg hover:bg-page/5 transition-colors"
        >
          <Trash2 size={13} /> Delete
        </button>
        <button
          type="button"
          onClick={() => onEdit(event)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent-secondary text-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Pencil size={13} /> Edit
        </button>
      </div>
    </div>
  );
}
