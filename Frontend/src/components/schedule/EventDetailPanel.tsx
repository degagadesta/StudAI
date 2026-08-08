import { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import type { ScheduleEvent, UpdateEventPayload } from "../../api/Scheduleapi";

export default function EventDetailPanel({
  event,
  onClose,
  onDelete,
  onUpdate,
}: {
  event: ScheduleEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: UpdateEventPayload) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");

  function handleSave() {
    onUpdate(event.id, { title, description });
    setIsEditing(false);
  }

  return (
    <div className="bg-[#253D31] text-[#F6F1E3] rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-6">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-xl bg-transparent border-b border-[#F6F1E3]/30 focus:outline-none focus:border-[#8CA37E] flex-1 mr-3"
          />
        ) : (
          <p className="font-serif text-xl leading-tight pr-3">{event.title}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F6F1E3]/10 shrink-0 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-sm text-[#C7D3B9] mb-1">
        {new Date(event.eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-sm text-[#C7D3B9] mb-6">
        {new Date(event.eventDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      <div className="flex-1">
        {isEditing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#2C4739] rounded-lg p-3 text-sm text-[#F6F1E3] focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
            placeholder="Add a description..."
          />
        ) : (
          <p className="text-sm text-[#F6F1E3]/80 leading-relaxed">
            {event.description || "No description added."}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F6F1E3]/10">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 bg-[#8CA37E] text-[#253D31] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 border border-[#F6F1E3]/20 text-xs font-semibold rounded-lg hover:bg-[#F6F1E3]/5 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#F6F1E3]/20 text-xs font-semibold rounded-lg hover:bg-[#F6F1E3]/5 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#8CA37E] text-[#253D31] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <Pencil size={13} /> Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}