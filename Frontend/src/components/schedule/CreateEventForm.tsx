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
        className="w-9 h-9 rounded-full bg-accent text-inverse flex items-center justify-center hover:bg-accent transition-colors"
      >
        <Plus size={16} />
      </button>
    );
  }

  return (
    <div className="bg-surface border border-default rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-serif text-lg text-primary">New event</p>
        <button type="button" onClick={() => setIsOpen(false)} className="text-secondary">
          <X size={16} />
        </button>
      </div>

      {error && <p className="text-xs text-error mb-3">{error}</p>}

      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="text-sm px-3 py-2 rounded-lg border border-default bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-default bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-default bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="text-sm px-3 py-2 rounded-lg border border-default bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="py-2 bg-accent hover:bg-accent text-inverse text-xs font-semibold rounded-lg transition-colors"
        >
          Add event
        </button>
      </div>
    </div>
  );
}