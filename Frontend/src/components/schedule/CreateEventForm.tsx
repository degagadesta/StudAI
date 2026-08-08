import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { CreateEventPayload } from "../../api/Scheduleapi";

export default function CreateEventForm({
  onCreate,
}: {
  onCreate: (payload: CreateEventPayload) => Promise<void> | void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
    setError(null);
  }

  async function handleSubmit() {
    if (!title.trim() || !date) {
      setError("Title and date are required.");
      return;
    }
    const eventDate = new Date(`${date}T${time || "09:00"}`).toISOString();
    await onCreate({ title: title.trim(), description: description.trim(), eventDate });
    reset();
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 rounded-full bg-[#253D31] text-[#F6F1E3] flex items-center justify-center hover:bg-[#2F4A3D] transition-colors"
      >
        <Plus size={16} />
      </button>
    );
  }

  return (
    <div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif text-lg text-[#253D31]">New event</p>
        <button type="button" onClick={() => setIsOpen(false)} className="text-[#5B6156]">
          <X size={16} />
        </button>
      </div>

      {error && <p className="text-xs text-[#8B3A3A] mb-3">{error}</p>}

      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="py-2 bg-[#2F4A3D] hover:bg-[#253D31] text-[#F6F1E3] text-xs font-semibold rounded-lg transition-colors"
        >
          Add event
        </button>
      </div>
    </div>
  );
}