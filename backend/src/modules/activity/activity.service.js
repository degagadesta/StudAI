import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

// Configuration constants
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Start a new activity session or resume an existing one
 */
export async function startOrResumeSession(studentId) {
    const now = new Date();

    // Check for existing active session (not ended and recently active)
    const activeSession = await prisma.activitySession.findFirst({
        where: {
            studentId,
            endedAt: null,
            lastActiveAt: {
                gte: new Date(now.getTime() - SESSION_TIMEOUT_MS),
            },
        },
        orderBy: {
            lastActiveAt: "desc",
        },
    });

    if (activeSession) {
        // Resume existing session - update lastActiveAt
        const updated = await prisma.activitySession.update({
            where: { id: activeSession.id },
            data: {
                lastActiveAt: now,
            },
        });

        return {
            sessionId: updated.id,
            isNew: false,
            startedAt: updated.startedAt,
        };
    }

    // Create new session
    const newSession = await prisma.activitySession.create({
        data: {
            studentId,
            startedAt: now,
            lastActiveAt: now,
        },
    });

    return {
        sessionId: newSession.id,
        isNew: true,
        startedAt: newSession.startedAt,
    };
}

/**
 * Update session activity (heartbeat)
 */
export async function updateSessionActivity(sessionId) {
    const now = new Date();

    const session = await prisma.activitySession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    if (session.endedAt) {
        throw new AppError("Session already ended", 400);
    }

    // Check if session is stale (inactive too long)
    const timeSinceLastActive = now.getTime() - session.lastActiveAt.getTime();
    if (timeSinceLastActive > SESSION_TIMEOUT_MS) {
        // Auto-close stale session
        await closeSession(sessionId);
        throw new AppError("Session expired due to inactivity", 410);
    }

    // Update lastActiveAt
    const updated = await prisma.activitySession.update({
        where: { id: sessionId },
        data: {
            lastActiveAt: now,
        },
    });

    return {
        sessionId: updated.id,
        lastActiveAt: updated.lastActiveAt,
    };
}

/**
 * Close an activity session and calculate duration
 */
export async function closeSession(sessionId) {
    const now = new Date();

    const session = await prisma.activitySession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    if (session.endedAt) {
        // Already closed
        return {
            sessionId: session.id,
            duration: session.duration,
            alreadyClosed: true,
        };
    }

    // Calculate duration (excluding idle time)
    const duration = calculateSessionDuration(
        session.startedAt,
        session.lastActiveAt,
        now
    );

    const updated = await prisma.activitySession.update({
        where: { id: sessionId },
        data: {
            endedAt: now,
            duration,
        },
    });

    return {
        sessionId: updated.id,
        duration: updated.duration,
        alreadyClosed: false,
    };
}

/**
 * Calculate session duration in seconds
 * Uses lastActiveAt to exclude idle time at the end
 */
function calculateSessionDuration(startedAt, lastActiveAt, endedAt) {
    // Use lastActiveAt instead of endedAt to exclude final idle time
    const effectiveEnd = lastActiveAt;
    const durationMs = effectiveEnd.getTime() - startedAt.getTime();
    const durationSeconds = Math.max(0, Math.floor(durationMs / 1000));

    // Cap at reasonable maximum (24 hours)
    const maxDuration = 24 * 60 * 60; // 24 hours in seconds
    return Math.min(durationSeconds, maxDuration);
}

/**
 * Get current active session for student
 */
export async function getActiveSession(studentId) {
    const session = await prisma.activitySession.findFirst({
        where: {
            studentId,
            endedAt: null,
        },
        orderBy: {
            lastActiveAt: "desc",
        },
    });

    if (!session) {
        return null;
    }

    // Check if stale
    const now = new Date();
    const timeSinceLastActive = now.getTime() - session.lastActiveAt.getTime();
    if (timeSinceLastActive > SESSION_TIMEOUT_MS) {
        // Auto-close stale session
        await closeSession(session.id);
        return null;
    }

    return {
        sessionId: session.id,
        startedAt: session.startedAt,
        lastActiveAt: session.lastActiveAt,
        currentDuration: calculateSessionDuration(
            session.startedAt,
            session.lastActiveAt,
            now
        ),
    };
}

/**
 * Close all stale sessions (for cleanup job)
 */
export async function closeStaleSessions() {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - SESSION_TIMEOUT_MS);

    const staleSessions = await prisma.activitySession.findMany({
        where: {
            endedAt: null,
            lastActiveAt: {
                lt: staleThreshold,
            },
        },
    });

    let closedCount = 0;
    for (const session of staleSessions) {
        try {
            await closeSession(session.id);
            closedCount++;
        } catch (err) {
            console.error(`Failed to close stale session ${session.id}:`, err.message);
        }
    }

    return {
        closedCount,
        totalStale: staleSessions.length,
    };
}

/**
 * Get session statistics for a student
 */
export async function getSessionStats(studentId, startDate, endDate) {
    const sessions = await prisma.activitySession.findMany({
        where: {
            studentId,
            startedAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            id: true,
            startedAt: true,
            endedAt: true,
            duration: true,
        },
    });

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = totalDuration / 3600;

    return {
        sessionCount: sessions.length,
        totalDuration, // seconds
        totalHours: parseFloat(totalHours.toFixed(2)),
        averageDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
    };
}
