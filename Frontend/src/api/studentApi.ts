import { api } from "./client";

// ── Types ────────────────────────────────────────────────────────────────

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string; // ISO date string
}

export interface EventsOverview {
  dueToday: ScheduleEvent[];
  oneDayLeft: ScheduleEvent[];
  upcoming: ScheduleEvent[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventDate: string; // ISO date string
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  eventDate?: string;
}

// ── Requests ─────────────────────────────────────────────────────────────

export async function getEventsOverview(): Promise<EventsOverview> {
  const res = await api.get<EventsOverview>("/events");
  return res.data;
}

export async function createEvent(
  payload: CreateEventPayload,
): Promise<ScheduleEvent> {
  const res = await api.post<ScheduleEvent>("/events", payload);
  return res.data;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
): Promise<ScheduleEvent> {
  const res = await api.put<ScheduleEvent>(`/events/${id}`, payload);
  return res.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}