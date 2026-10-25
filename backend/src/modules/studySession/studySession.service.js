import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { redis } from "../../lib/redis.js";

const ACTIVE_SESSION_PREFIX = "study-session:active:";
const SESSION_CACHE_TTL = 3600; // 1 hour

// ────────────────────────────────────────────────────────────────────
// START STUDY SESSION
// ────────────────────────────────────────────────────────────────────
export async function startStudySession(studentId, { courseId, materialId, type = "REGULAR" }) {
    // Check for existing active session
    const activeSession = await getActiveSession(studentId);

    if (activeSession) {
        throw new AppError("You already have an active study session. Please end it before starting a new one.", 400);
    }

    // Create new session
    const session = await prisma.studySession.create({
        data: {
            studentId,
            courseId,
            materialId,
            type,
            status: "ACTIVE",
            startTime: new Date(),
        },
        select: {
            id: true,
            startTime: true,
            type: true,
            courseId: true,
            materialId: true,
            pomodoroCount: true,
            status: true,
        },
    });

    // Cache active session for fast retrieval
    await cacheActiveSession(studentId, session);

    return session;
}

// ────────────────────────────────────────────────────────────────────
// END STUDY SESSION
// ────────────────────────────────────────────────────────────────────
export async function endStudySession(studentId, sessionId, customDuration) {
    const session = await prisma.studySession.findFirst({
        where: {
            id: sessionId,
            studentId,
            status: "ACTIVE",
        },
    });

    if (!session) {
        throw new AppError("Active study session not found", 404);
    }

    const endTime = new Date();
    const duration = customDuration || Math.floor((endTime - session.startTime) / 1000 / 60); // minutes

    // Update session
    const updatedSession = await prisma.studySession.update({
        where: { id: sessionId },
        data: {
            endTime,
            duration,
            status: "COMPLETED",
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            duration: true,
            type: true,
            pomodoroCount: true,
            courseId: true,
            materialId: true,
        },
    });

    // Update streak asynchronously (non-blocking)
    updateStudyStreakAsync(studentId, duration);

    // Clear cached active session
    await clearActiveSession(studentId);

    return updatedSession;
}

// ────────────────────────────────────────────────────────────────────
// GET ACTIVE SESSION
// ────────────────────────────────────────────────────────────────────
export async function getActiveSession(studentId) {
    // Try cache first
    const cacheKey = `${ACTIVE_SESSION_PREFIX}${studentId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    // Fallback to database
    const session = await prisma.studySession.findFirst({
        where: {
            studentId,
            status: "ACTIVE",
        },
        select: {
            id: true,
            startTime: true,
            type: true,
            courseId: true,
            materialId: true,
            pomodoroCount: true,
            status: true,
        },
        orderBy: {
            startTime: "desc",
        },
    });

    if (session) {
        await cacheActiveSession(studentId, session);
    }

    return session;
}

// ────────────────────────────────────────────────────────────────────
// INCREMENT POMODORO COUNT
// ────────────────────────────────────────────────────────────────────
export async function incrementPomodoro(studentId, sessionId) {
    const session = await prisma.studySession.findFirst({
        where: {
            id: sessionId,
            studentId,
            status: "ACTIVE",
            type: "POMODORO",
        },
    });

    if (!session) {
        throw new AppError("Active pomodoro session not found", 404);
    }

    const updated = await prisma.studySession.update({
        where: { id: sessionId },
        data: {
            pomodoroCount: { increment: 1 },
        },
        select: {
            id: true,
            pomodoroCount: true,
        },
    });

    // Update cache
    const activeSession = await getActiveSession(studentId);
    if (activeSession) {
        activeSession.pomodoroCount = updated.pomodoroCount;
        await cacheActiveSession(studentId, activeSession);
    }

    return updated;
}

// ────────────────────────────────────────────────────────────────────
// GET STUDY HISTORY
// ────────────────────────────────────────────────────────────────────
export async function getStudyHistory(studentId, { limit = 50, offset = 0, courseId, startDate, endDate }) {
    const where = {
        studentId,
        status: "COMPLETED",
    };

    if (courseId) {
        where.courseId = courseId;
    }

    if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
    }

    const [sessions, total] = await Promise.all([
        prisma.studySession.findMany({
            where,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                duration: true,
                type: true,
                pomodoroCount: true,
                courseId: true,
                materialId: true,
            },
            orderBy: { startTime: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.studySession.count({ where }),
    ]);

    return {
        sessions,
        total,
        limit,
        offset,
    };
}

// ────────────────────────────────────────────────────────────────────
// GET STUDY STATISTICS
// ────────────────────────────────────────────────────────────────────
export async function getStudyStatistics(studentId) {
    const streak = await getStudyStreak(studentId);

    // Get today's study time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaySessions, weekSessions, thisMonthSessions] = await Promise.all([
        // Today
        prisma.studySession.aggregate({
            where: {
                studentId,
                status: "COMPLETED",
                startTime: { gte: todayStart },
            },
            _sum: { duration: true },
            _count: true,
        }),
        // Last 7 days
        prisma.studySession.aggregate({
            where: {
                studentId,
                status: "COMPLETED",
                startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            _sum: { duration: true },
            _count: true,
        }),
        // This month
        prisma.studySession.aggregate({
            where: {
                studentId,
                status: "COMPLETED",
                startTime: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
            _sum: { duration: true },
            _count: true,
        }),
    ]);

    return {
        streak: {
            current: streak.currentStreak,
            longest: streak.longestStreak,
            lastStudyDate: streak.lastStudyDate,
        },
        totalMinutes: streak.totalMinutes,
        totalSessions: streak.totalSessions,
        today: {
            minutes: todaySessions._sum.duration || 0,
            sessions: todaySessions._count,
        },
        thisWeek: {
            minutes: weekSessions._sum.duration || 0,
            sessions: weekSessions._count,
            average: Math.round((weekSessions._sum.duration || 0) / 7),
        },
        thisMonth: {
            minutes: thisMonthSessions._sum.duration || 0,
            sessions: thisMonthSessions._count,
        },
    };
}

// ────────────────────────────────────────────────────────────────────
// GET STUDY CALENDAR DATA (for visualization)
// ────────────────────────────────────────────────────────────────────
export async function getStudyCalendar(studentId, startDate, endDate) {
    const sessions = await prisma.studySession.groupBy({
        by: ["startTime"],
        where: {
            studentId,
            status: "COMPLETED",
            startTime: {
                gte: startDate,
                lte: endDate,
            },
        },
        _sum: {
            duration: true,
        },
        _count: true,
    });

    // Group by date
    const calendar = {};
    sessions.forEach((session) => {
        const date = session.startTime.toISOString().split("T")[0];
        if (!calendar[date]) {
            calendar[date] = {
                date,
                minutes: 0,
                sessions: 0,
            };
        }
        calendar[date].minutes += session._sum.duration || 0;
        calendar[date].sessions += session._count;
    });

    return Object.values(calendar);
}

// ────────────────────────────────────────────────────────────────────
// HELPER: UPDATE STUDY STREAK (async, non-blocking)
// ────────────────────────────────────────────────────────────────────
async function updateStudyStreakAsync(studentId, sessionDuration) {
    try {
        const streak = await getStudyStreak(studentId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastStudy = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
        let newStreak = streak.currentStreak;

        // Calculate streak
        if (!lastStudy) {
            // First study session ever
            newStreak = 1;
        } else {
            const lastStudyDate = new Date(lastStudy);
            lastStudyDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day, maintain streak
                newStreak = streak.currentStreak;
            } else if (daysDiff === 1) {
                // Consecutive day, increment
                newStreak = streak.currentStreak + 1;
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
            }
        }

        // Update streak
        await prisma.studyStreak.upsert({
            where: { studentId },
            update: {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, streak.longestStreak),
                lastStudyDate: new Date(),
                totalMinutes: { increment: sessionDuration },
                totalSessions: { increment: 1 },
                updatedAt: new Date(),
            },
            create: {
                studentId,
                currentStreak: 1,
                longestStreak: 1,
                lastStudyDate: new Date(),
                totalMinutes: sessionDuration,
                totalSessions: 1,
            },
        });

        // Invalidate cache
        await redis.del(`study-streak:${studentId}`);
    } catch (error) {
        console.error("[StudySession] Failed to update streak:", error.message);
    }
}

// ────────────────────────────────────────────────────────────────────
// GET STUDY STREAK
// ────────────────────────────────────────────────────────────────────
export async function getStudyStreak(studentId) {
    // Try cache first
    const cacheKey = `study-streak:${studentId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    let streak = await prisma.studyStreak.findUnique({
        where: { studentId },
    });

    if (!streak) {
        // Initialize streak
        streak = {
            studentId,
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null,
            totalMinutes: 0,
            totalSessions: 0,
        };
    }

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(streak));

    return streak;
}

// ────────────────────────────────────────────────────────────────────
// CACHE HELPERS
// ────────────────────────────────────────────────────────────────────
async function cacheActiveSession(studentId, session) {
    const cacheKey = `${ACTIVE_SESSION_PREFIX}${studentId}`;
    await redis.setex(cacheKey, SESSION_CACHE_TTL, JSON.stringify(session));
}

async function clearActiveSession(studentId) {
    const cacheKey = `${ACTIVE_SESSION_PREFIX}${studentId}`;
    await redis.del(cacheKey);
}
