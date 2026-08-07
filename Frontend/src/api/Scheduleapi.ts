import { api } from "./client";

export interface ScheduleEvent {
  id: string;
  title: string;
  courseName: string;
  date: string; // ISO date string
}

export async function getUpcomingEvents(): Promise<ScheduleEvent[]> {
  const res = await api.get<ScheduleEvent[]>("/schedule");
  return res.data;
}
