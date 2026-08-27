import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

// ─── date helpers ────────────────────────────────────────────────────────────

function buildDateBoundaries() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  return { startOfToday, endOfToday, startOfTomorrow, endOfTomorrow };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createEvent(studentId, { title, description, eventDate }) {
  if (!title?.trim()) throw new AppError("Please enter an event title", 400);

  const date = new Date(eventDate);
  if (isNaN(date.getTime())) throw new AppError("Please enter a valid date", 400);
  if (date < new Date()) throw new AppError("Event date must be in the future", 400);

  try {
    if (!prisma.upcomingEvent) {
      throw new AppError("Event service is temporarily unavailable", 503);
    }
    
    return await prisma.upcomingEvent.create({
      data: {
        studentId,
        title: title.trim(),
        description: description?.trim() ?? null,
        eventDate: date,
      },
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Error creating event:', err);
    throw new AppError("Failed to create event", 500);
  }
}

/**
 * Returns all events split into three buckets:
 *
 *  dueToday   – eventDate is today  → frontend shows full notification
 *  oneDayLeft – eventDate is tomorrow → frontend shows "1 day left" reminder
 *  upcoming   – eventDate is further in the future
 *
 * Events that are strictly in the past (before today) are silently deleted
 * so the DB stays clean, but today's events are kept so the frontend can
 * show them all day long.
 */
export async function getEvents(studentId) {
  try {
    if (!prisma.upcomingEvent) {
      // Return empty events if Prisma client is broken
      return {
        dueToday: [],
        oneDayLeft: [],
        upcoming: [],
      };
    }

    const { startOfToday, endOfToday, startOfTomorrow, endOfTomorrow } =
      buildDateBoundaries();

    // Clean up events that have already fully passed (before today)
    try {
      await prisma.upcomingEvent.deleteMany({
        where: { studentId, eventDate: { lt: startOfToday } },
      });
    } catch (err) {
      console.error('Error cleaning up past events:', err.message);
    }

    const allEvents = await prisma.upcomingEvent.findMany({
      where: { studentId },
      orderBy: { eventDate: "asc" },
    });

    return {
      dueToday: allEvents.filter(
        (e) => e.eventDate >= startOfToday && e.eventDate <= endOfToday
      ),
      oneDayLeft: allEvents.filter(
        (e) => e.eventDate >= startOfTomorrow && e.eventDate <= endOfTomorrow
      ),
      upcoming: allEvents.filter((e) => e.eventDate > endOfTomorrow),
    };
  } catch (err) {
    console.error('Error getting events:', err);
    return {
      dueToday: [],
      oneDayLeft: [],
      upcoming: [],
    };
  }
}

/**
 * Lightweight preview used by the dashboard — no side effects.
 */
export async function getUpcomingEventsPreview(studentId) {
  try {
    if (!prisma.upcomingEvent) {
      return { total: 0, events: [] };
    }

    const { endOfToday } = buildDateBoundaries();

    const events = await prisma.upcomingEvent.findMany({
      where: { studentId, eventDate: { gt: endOfToday } },
      orderBy: { eventDate: "asc" },
      take: 5,
    });

    const total = await prisma.upcomingEvent.count({
      where: { studentId, eventDate: { gt: endOfToday } },
    });

    return { total, events };
  } catch (err) {
    console.error('Error getting events preview:', err);
    return { total: 0, events: [] };
  }
}

export async function updateEvent(studentId, eventId, { title, description, eventDate }) {
  try {
    if (!prisma.upcomingEvent) {
      throw new AppError("Event service is temporarily unavailable", 503);
    }

    const event = await prisma.upcomingEvent.findFirst({
      where: { id: eventId, studentId },
    });
    if (!event) throw new AppError("Event not found", 404);

    const updates = {};
    if (title !== undefined) {
      if (!title.trim()) throw new AppError("Event title cannot be empty", 400);
      updates.title = title.trim();
    }
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (eventDate !== undefined) {
      const date = new Date(eventDate);
      if (isNaN(date.getTime())) throw new AppError("Please enter a valid date", 400);
      updates.eventDate = date;
    }

    return await prisma.upcomingEvent.update({ where: { id: eventId }, data: updates });
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Error updating event:', err);
    throw new AppError("Failed to update event", 500);
  }
}

export async function deleteEvent(studentId, eventId) {
  try {
    if (!prisma.upcomingEvent) {
      throw new AppError("Event service is temporarily unavailable", 503);
    }

    const event = await prisma.upcomingEvent.findFirst({
      where: { id: eventId, studentId },
    });
    if (!event) throw new AppError("Event not found", 404);

    await prisma.upcomingEvent.delete({ where: { id: eventId } });
    return { message: "Event deleted successfully" };
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Error deleting event:', err);
    throw new AppError("Failed to delete event", 500);
  }
}
