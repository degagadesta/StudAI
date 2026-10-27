import { prisma } from "../../lib/prisma.js";
import { PLAN_LIMITS } from "../../config/planLimits.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Get the start of the current billing period (first day of month)
 */
function billingPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Check if a student's subscription has expired
 */
function isSubscriptionExpired(student) {
  if (!student.subscriptionExpiresAt) {
    return false; // No expiry date means no expiration (or lifetime)
  }
  return new Date() > new Date(student.subscriptionExpiresAt);
}

/**
 * Get effective plan considering expiration
 */
export function getEffectivePlan(student) {
  // If subscription expired, downgrade to FREE
  if (isSubscriptionExpired(student)) {
    return 'FREE';
  }
  
  // Map legacy STANDARD to STUDENT
  if (student.subscriptionPlan === 'STANDARD') {
    return 'STUDENT';
  }
  
  return student.subscriptionPlan;
}

/**
 * Assert that student is within usage limit for a feature
 * Throws AppError if limit exceeded
 * @param {string} studentId - Student ID
 * @param {string} plan - Subscription plan
 * @param {string} feature - Feature being used (e.g., 'SUMMARY', 'CHAT_MESSAGE')
 * @throws {AppError} When limit is exceeded
 */
export async function assertWithinLimit(studentId, plan, feature) {
  // Get student to check expiration
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Get effective plan (handle expiration)
  const effectivePlan = getEffectivePlan(student);
  const limits = PLAN_LIMITS[effectivePlan];

  if (!limits) {
    throw new AppError(`Invalid subscription plan: ${effectivePlan}`, 500);
  }

  // Get the limit for this feature
  const limit = limits[feature];

  // null means unlimited
  if (limit === null || limit === undefined) {
    return;
  }

  // Count usage in current billing period
  const periodStart = billingPeriodStart();
  const usageCount = await prisma.usageLog.count({
    where: {
      studentId,
      feature,
      createdAt: { gte: periodStart },
    },
  });

  // Check if limit exceeded
  if (usageCount >= limit) {
    throw new AppError(
      `You've reached your ${feature} limit (${limit}/${limit}). Upgrade your plan for more access.`,
      429, // Too Many Requests
      "LIMIT_EXCEEDED",
      {
        feature,
        used: usageCount,
        limit,
        plan: effectivePlan,
        resetDate: new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1),
      }
    );
  }
}

/**
 * Record feature usage in the database
 */
export async function recordUsage(studentId, feature, details = {}) {
  await prisma.usageLog.create({
    data: {
      studentId,
      feature,
      materialId: details.materialId ?? null,
      model: details.model ?? null,
      inputTokens: details.inputTokens ?? null,
      outputTokens: details.outputTokens ?? null,
      totalTokens: details.totalTokens ?? null,
    },
  });
}

/**
 * Get comprehensive usage summary for a student
 */
export async function getUsageSummary(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const effectivePlan = getEffectivePlan(student);
  const limits = PLAN_LIMITS[effectivePlan];
  const periodStart = billingPeriodStart();

  // Count usage for all features
  const [summary, flashcards, chatMessages, notesGeneration, quizGeneration, pdfUploads] = await Promise.all([
    prisma.usageLog.count({
      where: { studentId, feature: "SUMMARY", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "FLASHCARDS", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "CHAT_MESSAGES", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "NOTES_GENERATION", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "QUIZ_GENERATION", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "PDF_UPLOADS", createdAt: { gte: periodStart } },
    }),
  ]);

  // Count active courses
  const activeCourses = await prisma.studentCourseSelection.count({
    where: {
      studentProfile: {
        studentId,
      },
    },
  });

  return {
    plan: effectivePlan,
    originalPlan: student.subscriptionPlan,
    isExpired: isSubscriptionExpired(student),
    expiresAt: student.subscriptionExpiresAt,
    billingPeriodStart: periodStart,
    billingPeriodEnd: new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1),
    usage: {
      summary: { used: summary, limit: limits.SUMMARY },
      flashcards: { used: flashcards, limit: limits.FLASHCARDS },
      chatMessages: { used: chatMessages, limit: limits.CHAT_MESSAGES },
      notesGeneration: { used: notesGeneration, limit: limits.NOTES_GENERATION },
      quizGeneration: { used: quizGeneration, limit: limits.QUIZ_GENERATION },
      pdfUploads: { used: pdfUploads, limit: limits.PDF_UPLOADS },
      activeCourses: { used: activeCourses, limit: limits.MAX_COURSES },
    },
  };
}

/**
 * Check if student can perform action without recording
 * Returns boolean instead of throwing
 */
export async function canUseFeature(studentId, plan, feature) {
  try {
    await assertWithinLimit(studentId, plan, feature);
    return true;
  } catch (error) {
    if (error.code === "LIMIT_EXCEEDED") {
      return false;
    }
    throw error;
  }
}