import { prisma } from "../../lib/prisma.js";

export async function getAnalytics(studentId) {
  // ── enrolled courses ──────────────────────────────────────────────────────
  const profile = await prisma.studentProfile.findUnique({
    where: { studentId },
    select: { curriculumId: true, currentYear: true, currentSemester: true },
  });

  const enrolledCourses = profile
    ? await prisma.curriculumCourse.count({
      where: {
        curriculumId: profile.curriculumId,
        year: profile.currentYear,
        semester: profile.currentSemester,
      },
    })
    : 0;

  // ── total PDFs uploaded ───────────────────────────────────────────────────
  const totalPdfsUploaded = await prisma.courseMaterial.count({
    where: { uploadedBy: studentId, status: "READY" },
  });

  // ── total events saved ────────────────────────────────────────────────────
  const totalEvents = await prisma.upcomingEvent.count({
    where: { studentId },
  });

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
    activity: {
      daily: dailyActivity,   // Array of 7 days with hours
      weekly: weeklyActivity, // Array of 4 weeks with days
      monthly: monthlyActivity, // Array of 12 months with days

    },
  };
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
    const hours = await prisma.activityLog.count({
      where: {
        studentId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    daily.push({
      date: startOfDay.toISOString().split('T')[0], // YYYY-MM-DD
      day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue, etc.
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
    endOfWeek.setDate(now.getDate() - (i * 7));
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(endOfWeek);
    startOfWeek.setDate(endOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all activity logs for this week
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
    const uniqueDays = new Set(
      logs.map(log => log.createdAt.toISOString().split('T')[0])
    ).size;

    weekly.push({
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
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
    const uniqueDays = new Set(
      logs.map(log => log.createdAt.toISOString().split('T')[0])
    ).size;

    monthly.push({
      month: startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), // Jan 2024
      year: startOfMonth.getFullYear(),
      monthNumber: startOfMonth.getMonth() + 1,
      days: uniqueDays,
    });
  }

  return monthly;
}
