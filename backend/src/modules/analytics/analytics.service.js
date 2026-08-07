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

  // ── date boundaries ───────────────────────────────────────────────────────
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Last 7 days including today
  const startOf7Days = new Date(now);
  startOf7Days.setDate(now.getDate() - 6);
  startOf7Days.setHours(0, 0, 0, 0);

  // Last 30 days including today
  const startOf30Days = new Date(now);
  startOf30Days.setDate(now.getDate() - 29);
  startOf30Days.setHours(0, 0, 0, 0);

  // ── total PDFs ever uploaded (including deleted) ─────────────────────────
  const totalPdfsUploaded = await prisma.courseMaterial.count({
    where: { uploadedBy: studentId },
  });

  // ── hours today ───────────────────────────────────────────────────────────
  // activityLogger writes at most one row per hour, so row count = hours used
  const hoursToday = await prisma.activityLog.count({
    where: { studentId, createdAt: { gte: startOfToday } },
  });

  // ── days this week ────────────────────────────────────────────────────────
  const weekLogs = await prisma.activityLog.findMany({
    where: { studentId, createdAt: { gte: startOf7Days } },
    select: { createdAt: true },
  });
  const daysThisWeek = new Set(weekLogs.map((l) => l.createdAt.toDateString()))
    .size;

  // ── days this month ───────────────────────────────────────────────────────
  const monthLogs = await prisma.activityLog.findMany({
    where: { studentId, createdAt: { gte: startOf30Days } },
    select: { createdAt: true },
  });
  const daysThisMonth = new Set(
    monthLogs.map((l) => l.createdAt.toDateString()),
  ).size;

  return {
    enrolledCourses,
    totalPdfsUploaded,
    activity: {
      hoursToday, // number of hours used today
      daysThisWeek, // number of days used in last 7 days
      daysThisMonth, // number of days used in last 30 days
    },
  };
}
