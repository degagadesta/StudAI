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
  const daily = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Count activity logs (1 log = 1 hour of usage)
    let hours = 0;
    try {
      if (prisma.activityLog) {
        hours = await prisma.activityLog.count({
          where: {
            studentId,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });
      }
    } catch (err) {
      console.error("Error counting activity logs:", err.message);
    }

    daily.push({
      date: startOfDay.toISOString().split("T")[0], // YYYY-MM-DD
      day: startOfDay.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue, etc.
      hours,
    });
  }

  return daily;
}

// ── Helper: Get weekly activity (days per week for last 4 weeks) ─────────────
async function getWeeklyActivity(studentId, now) {
  const weekly = [];

  for (let i = 3; i >= 0; i--) {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - i * 7);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(endOfWeek);
    startOfWeek.setDate(endOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all activity logs for this week
    let uniqueDays = 0;
    try {
      if (prisma.activityLog) {
        const logs = await prisma.activityLog.findMany({
          where: {
            studentId,
            createdAt: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
          select: { createdAt: true },
        });

        // Count unique days (how many days user was active)
        uniqueDays = new Set(
          logs.map((log) => log.createdAt.toISOString().split("T")[0]),
        ).size;
      }
    } catch (err) {
      console.error("Error getting weekly activity:", err.message);
    }

    weekly.push({
      weekStart: startOfWeek.toISOString().split("T")[0],
      weekEnd: endOfWeek.toISOString().split("T")[0],
      weekLabel: `Week ${4 - i}`,
      days: uniqueDays,
    });
  }

  return weekly;
}

// ── Helper: Get monthly activity (days per month for last 12 months) ─────────
async function getMonthlyActivity(studentId, now) {
  const monthly = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get all activity logs for this month
    let uniqueDays = 0;
    try {
      if (prisma.activityLog) {
        const logs = await prisma.activityLog.findMany({
          where: {
            studentId,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: { createdAt: true },
        });

        // Count unique days
        uniqueDays = new Set(
          logs.map((log) => log.createdAt.toISOString().split("T")[0]),
        ).size;
      }
    } catch (err) {
      console.error("Error getting monthly activity:", err.message);
    }

    monthly.push({
      month: startOfMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }), // Jan 2024
      year: startOfMonth.getFullYear(),
      monthNumber: startOfMonth.getMonth() + 1,
      days: uniqueDays,
    });
  }

  return monthly;
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
