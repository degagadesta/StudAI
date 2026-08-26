import { prisma } from "../../lib/prisma.js";

export async function getAnalytics(studentId) {
  try {
    // ── enrolled courses ──────────────────────────────────────────────────────
    let enrolledCourses = 0;
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { studentId },
        select: {
          curriculumId: true,
          currentYear: true,
          currentSemester: true,
        },
      });

      if (profile) {
        enrolledCourses = await prisma.curriculumCourse.count({
          where: {
            curriculumId: profile.curriculumId,
            year: profile.currentYear,
            semester: profile.currentSemester,
          },
        });
      }
    } catch (err) {
      console.error("Error counting enrolled courses:", err.message);
    }

    const totalPdfsUploaded = await prisma.courseMaterial.count({
      where: { uploadedBy: studentId }, // all uploads including deleted
    });

    // ── total events saved ────────────────────────────────────────────────────
    let totalEvents = 0;
    try {
      if (prisma.upcomingEvent) {
        totalEvents = await prisma.upcomingEvent.count({
          where: { studentId },
        });
      }
    } catch (err) {
      console.error("Error counting events:", err.message);
    }

    let courseProgress = [];
    try {
      courseProgress = await getCourseMaterialProgress(studentId);
    } catch (err) {
      console.error("Error getting course material progress:", err.message);
    }

    // ── activity tracking ─────────────────────────────────────────────────────
    const now = new Date();

    // Daily: hours for past 7 days (including today)
    const dailyActivity = await getDailyActivity(studentId, now);

    // Weekly: days for past 4 weeks
    const weeklyActivity = await getWeeklyActivity(studentId, now);

    // Monthly: days for past 12 months
    const monthlyActivity = await getMonthlyActivity(studentId, now);

    return {
      enrolledCourses,
      totalPdfsUploaded,
      totalEvents,
      courseProgress,
      activity: {
        daily: dailyActivity, // Array of 7 days with hours
        weekly: weeklyActivity, // Array of 4 weeks with days
        monthly: monthlyActivity, // Array of 12 months with days
      },
    };
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    // Return default values if everything fails
    return {
      enrolledCourses: 0,
      totalPdfsUploaded: 0,
      totalEvents: 0,
      courseProgress: [],
      activity: {
        daily: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split("T")[0],
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            hours: 0,
          };
        }),
        weekly: Array.from({ length: 4 }, (_, i) => ({
          weekStart: "",
          weekEnd: "",
          weekLabel: `Week ${i + 1}`,
          days: 0,
        })),
        monthly: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          return {
            month: date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            year: date.getFullYear(),
            monthNumber: date.getMonth() + 1,
            days: 0,
          };
        }),
      },
    };
  }
}

// ── Helper: Get daily activity (hours per day for last 7 days) ───────────────
async function getDailyActivity(studentId, now) {
  // All date arithmetic done in UTC so keys match session.startedAt.toISOString()
  const endDate = new Date(now);
  endDate.setUTCHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setUTCDate(now.getUTCDate() - 6);
  startDate.setUTCHours(0, 0, 0, 0);

  // Reusable UTC day-name formatter
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

  // Build 7-day map using UTC date strings as keys
  function buildDailyMap() {
    const map = new Map();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setUTCDate(now.getUTCDate() - i);
      const dateKey = date.toISOString().split("T")[0]; // pure UTC date
      map.set(dateKey, {
        date: dateKey,
        day: dayFormatter.format(date),
        hours: 0,
      });
    }
    return map;
  }

  try {
    // Include ALL sessions with recorded duration (both closed and stale/unclosed ones).
    // Sessions closed by browser tab closure have endedAt=null but valid duration from heartbeats.
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: { gte: startDate, lte: endDate },
        duration: { gt: 0 },
        // Exclude currently active session — it's handled separately below
        NOT: {
          endedAt: null,
          lastActiveAt: { gte: new Date(now.getTime() - 30 * 60 * 1000) },
        },
      },
      select: { startedAt: true, duration: true },
    });

    const dailyMap = buildDailyMap();

    // Sum closed session durations — startedAt.toISOString() is UTC, matches map keys
    sessions.forEach((session) => {
      const dateKey = session.startedAt.toISOString().split("T")[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.get(dateKey).hours += session.duration / 3600;
      }
    });

    // Add active session's running duration to today (UTC date)
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
    const activeSession = await prisma.activitySession.findFirst({
      where: {
        studentId,
        endedAt: null,
        lastActiveAt: { gte: new Date(now.getTime() - SESSION_TIMEOUT_MS) },
      },
      select: { startedAt: true, duration: true },
    });

    if (activeSession) {
      const todayKey = now.toISOString().split("T")[0]; // UTC date — matches map key
      if (dailyMap.has(todayKey)) {
        dailyMap.get(todayKey).hours += activeSession.duration / 3600;
      }
    }

    return Array.from(dailyMap.values()).map((day) => ({
      ...day,
      hours: parseFloat(day.hours.toFixed(2)),
    }));
  } catch (err) {
    console.error("Error calculating daily activity:", err.message);
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setUTCDate(now.getUTCDate() - i);
      daily.push({
        date: date.toISOString().split("T")[0],
        day: dayFormatter.format(date),
        hours: 0,
      });
    }
    return daily;
  }
}

// ── Helper: Get weekly activity (days per week for last 4 weeks) ─────────────
async function getWeeklyActivity(studentId, now) {
  // Calculate date range for last 4 weeks (28 days)
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 27); // 4 weeks = 28 days, so -27 for inclusive
  startDate.setHours(0, 0, 0, 0);

  try {
    // ActivitySession: one session per login — count distinct days per week
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: { gte: startDate, lte: endDate },
      },
      select: { startedAt: true },
    });

    const weeklyDays = [];
    for (let i = 3; i >= 0; i--) {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - i * 7);
      endOfWeek.setHours(23, 59, 59, 999);

      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      weeklyDays.push({
        startOfWeek,
        endOfWeek,
        weekStart: startOfWeek.toISOString().split("T")[0],
        weekEnd: endOfWeek.toISOString().split("T")[0],
        weekLabel: `Week ${4 - i}`,
        uniqueDays: new Set(),
      });
    }

    // Each unique date a session started = one active day in that week
    sessions.forEach((session) => {
      const sessionTime = session.startedAt.getTime();
      const dateKey = session.startedAt.toISOString().split("T")[0];
      for (const week of weeklyDays) {
        if (sessionTime >= week.startOfWeek.getTime() && sessionTime <= week.endOfWeek.getTime()) {
          week.uniqueDays.add(dateKey);
          break;
        }
      }
    });

    return weeklyDays.map((week) => ({
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekLabel: week.weekLabel,
      days: week.uniqueDays.size,
    }));
  } catch (err) {
    console.error("Error getting weekly activity:", err.message);
    // Return empty weeks
    const weekly = [];
    for (let i = 3; i >= 0; i--) {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() - i * 7);
      endOfWeek.setHours(23, 59, 59, 999);

      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      weekly.push({
        weekStart: startOfWeek.toISOString().split("T")[0],
        weekEnd: endOfWeek.toISOString().split("T")[0],
        weekLabel: `Week ${4 - i}`,
        days: 0,
      });
    }
    return weekly;
  }
}

// ── Helper: Get monthly activity (days per month for last 12 months) ─────────
async function getMonthlyActivity(studentId, now) {
  // Calculate date range for last 12 months
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  startDate.setHours(0, 0, 0, 0);

  try {
    // ActivitySession: one session per login — count distinct days per month
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: { gte: startDate, lte: endDate },
      },
      select: { startedAt: true },
    });

    const monthlyBuckets = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      monthlyBuckets.push({
        startOfMonth,
        endOfMonth,
        month: startOfMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        year: startOfMonth.getFullYear(),
        monthNumber: startOfMonth.getMonth() + 1,
        uniqueDays: new Set(),
      });
    }

    // Each unique date a session started = one active day in that month
    sessions.forEach((session) => {
      const sessionTime = session.startedAt.getTime();
      const dateKey = session.startedAt.toISOString().split("T")[0];
      for (const bucket of monthlyBuckets) {
        if (sessionTime >= bucket.startOfMonth.getTime() && sessionTime <= bucket.endOfMonth.getTime()) {
          bucket.uniqueDays.add(dateKey);
          break;
        }
      }
    });

    return monthlyBuckets.map((bucket) => ({
      month: bucket.month,
      year: bucket.year,
      monthNumber: bucket.monthNumber,
      days: bucket.uniqueDays.size,
    }));
  } catch (err) {
    console.error("Error getting monthly activity:", err.message);
    // Return empty months
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      monthly.push({
        month: startOfMonth.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        year: startOfMonth.getFullYear(),
        monthNumber: startOfMonth.getMonth() + 1,
        days: 0,
      });
    }
    return monthly;
  }
}

// ── Helper: Get course material progress list ────────────────────────────────
async function getCourseMaterialProgress(studentId) {
  const materials = await prisma.courseMaterial.findMany({
    where: {
      uploadedBy: studentId,
      status: "READY",
    },
    select: {
      id: true,
      title: true,
      progress: true,
      createdAt: true,
      curriculumCourse: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return materials.map((m) => ({
    id: m.id,
    fileName: m.title,
    uploadDate: m.createdAt,
    progress: m.progress,
    courseName: m.curriculumCourse?.course?.title ?? "Unknown course",
    courseId: m.curriculumCourse?.course?.id ?? null,
    workspaceUrl: `/workspace/${m.id}`,
  }));
}
