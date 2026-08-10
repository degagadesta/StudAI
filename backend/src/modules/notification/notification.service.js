import { prisma } from "../../lib/prisma.js";

/**
 * Get upcoming event notifications for a student
 * Returns events that are today or in the near future as notifications
 */
export async function getUpcomingEventNotifications(studentId) {
  try {
    if (!prisma.upcomingEvent) {
      return [];
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Get all future events (from today onwards)
    const events = await prisma.upcomingEvent.findMany({
      where: {
        studentId,
        eventDate: {
          gte: startOfToday,
        },
      },
      orderBy: {
        eventDate: "asc",
      },
    });

    // Transform to notification format with daysLeft calculation
    return events.map((event) => {
      const eventDate = new Date(event.eventDate);
      const diffTime = eventDate - now;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        daysLeft: Math.max(0, daysLeft), // Never negative
        eventDate: event.eventDate.toISOString(),
        read: false, // For now, all notifications are unread (can extend later)
      };
    });
  } catch (err) {
    console.error("Error getting event notifications:", err);
    return [];
  }
}

/**
 * Mark a notification as read (placeholder for future implementation)
 * For now, this doesn't do anything as we don't have a read status in DB
 */
export async function markNotificationAsRead(studentId, notificationId) {
  // This is a placeholder - would need to add a 'read' field to UpcomingEvent table
  // or create a separate NotificationRead table
  return { success: true, message: "Notification marked as read" };
}

/**
 * Delete a notification (deletes the underlying event)
 */
export async function deleteNotification(studentId, notificationId) {
  try {
    if (!prisma.upcomingEvent) {
      throw new Error("Event service is temporarily unavailable");
    }

    // Verify ownership before deleting
    const event = await prisma.upcomingEvent.findFirst({
      where: {
        id: notificationId,
        studentId,
      },
    });

    if (!event) {
      throw new Error("Notification not found");
    }

    await prisma.upcomingEvent.delete({
      where: { id: notificationId },
    });

    return { success: true, message: "Notification deleted successfully" };
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw err;
  }
}
