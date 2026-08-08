import { api } from "./client";

export interface UpcomingEventNotification {
  id: string;
  title: string;
  daysLeft: number;
  eventDate: string; // ISO date string e.g. "2026-08-15"
  read: boolean;
}

export async function getUpcomingEventNotifications(): Promise<
  UpcomingEventNotification[]
> {
  const res = await api.get<{
    success: boolean;
    data: UpcomingEventNotification[];
  }>("/notifications/upcoming-events");

  // Automatically filter out events whose deadline has passed (daysLeft < 0)
  const activeNotifications = (res.data.data || []).filter(
    (event) => event.daysLeft >= 0,
  );

  return activeNotifications;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
