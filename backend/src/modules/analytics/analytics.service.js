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
      where: { uploadedBy: studentId, status: "READY" },
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
  // Calculate date range for last 7 days
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  try {
    // Single query to get all sessions for the past 7 days
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startedAt: true,
        duration: true,
      },
    });

    // Group sessions by day and calculate hours
    const dailyMap = new Map();

    // Initialize all 7 days with 0 hours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split("T")[0];
      dailyMap.set(dateKey, {
        date: dateKey,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        hours: 0,
      });
    }

    // Aggregate durations by day
    sessions.forEach((session) => {
      const dateKey = session.startedAt.toISOString().split("T")[0];
      if (dailyMap.has(dateKey)) {
        const current = dailyMap.get(dateKey);
        current.hours += session.duration / 3600; // Convert seconds to hours
      }
    });

    // Convert map to array and format hours
    const daily = Array.from(dailyMap.values()).map((day) => ({
      ...day,
      hours: parseFloat(day.hours.toFixed(2)),
    }));

    return daily;
  } catch (err) {
    console.error("Error calculating daily activity:", err.message);
    // Return empty array with 0 hours for all days
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      daily.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
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
    // Single query to get all sessions for the past 4 weeks
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startedAt: true,
      },
    });

    // Create weekly buckets
    const weekly = [];
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

    // Distribute sessions into weekly buckets
    sessions.forEach((session) => {
      const sessionTime = session.startedAt.getTime();
      const dateKey = session.startedAt.toISOString().split("T")[0];

      for (const week of weeklyDays) {
        if (
          sessionTime >= week.startOfWeek.getTime() &&
          sessionTime <= week.endOfWeek.getTime()
        ) {
          week.uniqueDays.add(dateKey);
          break;
        }
      }
    });

    // Convert to final format
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
    // Single query to get all sessions for the past 12 months
    const sessions = await prisma.activitySession.findMany({
      where: {
        studentId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        startedAt: true,
      },
    });

    // Create monthly buckets
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
        month: startOfMonth.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        year: startOfMonth.getFullYear(),
        monthNumber: startOfMonth.getMonth() + 1,
        uniqueDays: new Set(),
      });
    }

    // Distribute sessions into monthly buckets
    sessions.forEach((session) => {
      const sessionTime = session.startedAt.getTime();
      const dateKey = session.startedAt.toISOString().split("T")[0];

      for (const bucket of monthlyBuckets) {
        if (
          sessionTime >= bucket.startOfMonth.getTime() &&
          sessionTime <= bucket.endOfMonth.getTime()
        ) {
          bucket.uniqueDays.add(dateKey);
          break;
        }
      }
    });

    // Convert to final format
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
    progress: m.progress, // 0-100, drives the progress bar on the frontend
    courseName: m.curriculumCourse?.course?.title ?? "Unknown course",
    courseId: m.curriculumCourse?.course?.id ?? null,
    // Workspace feature isn't built yet — frontend can disable/hide
    // the "View" button while this is null.
    workspaceUrl: null,
  }));
}
