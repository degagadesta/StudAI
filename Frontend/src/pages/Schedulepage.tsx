import { useState, useEffect, useMemo } from "react";
import {
  getEventsOverview,
  createEvent,
  updateEvent,
  deleteEvent,
  type ScheduleEvent,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "../api/Scheduleapi";
import { getApiErrorMessage } from "../api/authApi";
import { isSameDay } from "../utils/dateHelpers";
import CalendarGrid from "../components/schedule/CalenderGrid";
import UpcomingEventsList from "../components/schedule/UpcomingEventsList";
import EventDetailPanel from "../components/schedule/EventDetailPanel";
import CreateEventForm from "../components/schedule/CreateEventForm";

export default function SchedulePage() {
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      const overview = await getEventsOverview();
      const flat = [...overview.dueToday, ...overview.oneDayLeft, ...overview.upcoming].sort(
        (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      );
      setAllEvents(flat);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load your schedule."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const eventDates = useMemo(() => allEvents.map((e) => new Date(e.eventDate)), [allEvents]);

  const eventsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((e) => isSameDay(new Date(e.eventDate), selectedDate));
  }, [allEvents, selectedDate]);

  async function handleCreate(payload: CreateEventPayload) {
    await createEvent(payload);
    await loadEvents();
  }

  async function handleUpdate(id: string, payload: UpdateEventPayload) {
    const updated = await updateEvent(id, payload);
    setSelectedEvent(updated);
    await loadEvents();
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    setSelectedEvent(null);
    await loadEvents();
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="h-96 rounded-2xl bg-[#EFE8D4] animate-pulse" />
        <div className="h-96 rounded-2xl bg-[#EFE8D4] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-serif text-2xl text-[#253D31]">Schedule</p>
        <CreateEventForm onCreate={handleCreate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <CalendarGrid
            viewDate={viewDate}
            onViewDateChange={setViewDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            eventDates={eventDates}
          />

          {selectedDate && eventsOnSelectedDate.length > 0 && (
            <UpcomingEventsList
              events={eventsOnSelectedDate}
              selectedId={selectedEvent?.id ?? null}
              onSelect={setSelectedEvent}
            />
          )}

          <UpcomingEventsList
            events={allEvents}
            selectedId={selectedEvent?.id ?? null}
            onSelect={setSelectedEvent}
          />
        </div>

        <div className="lg:sticky lg:top-4">
          {selectedEvent ? (
            <EventDetailPanel
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="bg-[#FFFDF7] border border-dashed border-[#DCD2B4] rounded-2xl p-6 h-64 flex items-center justify-center">
              <p className="text-sm text-[#A9A18A]">Select an event to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}