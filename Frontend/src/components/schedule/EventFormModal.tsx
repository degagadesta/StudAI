import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import type {
  ScheduleEvent,
  CreateEventPayload,
  UpdateEventPayload,
} from "../../api/Scheduleapi";

type FormMode = "create" | "edit";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: FormMode;
  initialEvent?: ScheduleEvent | null;
  onSubmitCreate: (payload: CreateEventPayload) => Promise<void>;
  onSubmitEdit: (id: string, payload: UpdateEventPayload) => Promise<void>;
}

function splitDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export default function EventFormModal({
  isOpen,
  onClose,
  mode,
  initialEvent,
  onSubmitCreate,
  onSubmitEdit,
}: EventFormModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialEvent) {
      const { date: d, time: t } = splitDateTime(initialEvent.eventDate);
      setTitle(initialEvent.title);
      setDate(d);
      setTime(t);
      setDescription(initialEvent.description ?? "");
    } else {
      setTitle("");
      setDate("");
      setTime("");
      setDescription("");
    }
    setError(null);
  }, [isOpen, mode, initialEvent]);

  async function handleSubmit() {
    if (!title.trim() || !date || !time) {
      setError("Title, deadline date, and deadline time are required.");
      return;
    }

    const eventDate = new Date(`${date}T${time}`).toISOString();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await onSubmitCreate({
          title: title.trim(),
          description: description.trim(),
          eventDate,
        });
      } else if (initialEvent) {
        await onSubmitEdit(initialEvent.id, {
          title: title.trim(),
          description: description.trim(),
          eventDate,
        });
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "New event" : "Edit event"}
    >
      {error && <p className="text-xs text-[#8B3A3A] mb-3">{error}</p>}

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-[#5B6156] mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-[#5B6156] mb-1 block">
              Deadline date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-[#5B6156] mb-1 block">
              Deadline time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#5B6156] mb-1 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-[#DCD2B4] bg-white focus:outline-none focus:ring-1 focus:ring-[#8CA37E]"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="py-2 bg-[#2F4A3D] hover:bg-[#253D31] disabled:opacity-60 text-[#F6F1E3] text-xs font-semibold rounded-lg transition-colors"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Add event"
              : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}
