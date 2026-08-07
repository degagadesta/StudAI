import { api } from "./client";

// ── add these types + function to your existing Scheduleapi.ts ───────────

export interface ScheduleEventFull {
  id: string;
  title: string;
  description: string | null;
  eventDate: string; // ISO date string
}

export interface EventsOverview {
  dueToday: ScheduleEventFull[];
  oneDayLeft: ScheduleEventFull[];
  upcoming: ScheduleEventFull[];
}

export async function getEventsOverview(): Promise<EventsOverview> {
  const res = await api.get<EventsOverview>("/events");
  return res.data;
}
