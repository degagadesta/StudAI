import { prisma } from "../lib/prisma.js";

/**
 * Records that a student used the app.
 * Throttled to at most one DB write per hour per student, so each row
 * in ActivityLog represents one distinct hour of usage.
 * Runs after the response is sent — never delays the request.
 */
export function activityLogger(req, res, next) {
  res.on("finish", () => {
    // req.studentId is set by authenticate; only log authenticated success
    if (req.studentId && res.statusCode < 400) {
      logIfNewHour(req.studentId).catch((err) =>
        console.error("ActivityLog write failed:", err.message)
      );
    }
  });
  next();
}

async function logIfNewHour(studentId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Skip if there is already a log entry within the last hour
  const recent = await prisma.activityLog.findFirst({
    where: { studentId, createdAt: { gte: oneHourAgo } },
    select: { id: true },
  });

  if (!recent) {
    await prisma.activityLog.create({ data: { studentId } });
  }
}
