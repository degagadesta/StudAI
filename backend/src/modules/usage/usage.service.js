import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { PLAN_LIMITS } from "../../config/planLimits.js";

function billingPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const LIMIT_KEY_MAP = {
  SUMMARY: "SUMMARY",
  FLASHCARDS: "FLASHCARDS",
  CHAT_MESSAGE: "CHAT_MESSAGES",
};

export async function assertWithinLimit(studentId, plan, feature) {
  const limitKey = LIMIT_KEY_MAP[feature];
  const limit = PLAN_LIMITS[plan]?.[limitKey];
  if (limit == null) return;

  const used = await prisma.usageLog.count({
    where: { studentId, feature, createdAt: { gte: billingPeriodStart() } },
  });

  if (used >= limit) {
    const label =
      feature === "CHAT_MESSAGE" ? "chat messages" : feature.toLowerCase();
    throw new AppError(
      `You've used all ${limit} ${label} on your ${plan.toLowerCase()} plan this month. Upgrade to get more.`,
      403,
    );
  }
}

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

export async function getUsageSummary(studentId, plan) {
  const periodStart = billingPeriodStart();
  const [summary, flashcards, chat] = await Promise.all([
    prisma.usageLog.count({
      where: { studentId, feature: "SUMMARY", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: {
        studentId,
        feature: "FLASHCARDS",
        createdAt: { gte: periodStart },
      },
    }),
    prisma.usageLog.count({
      where: {
        studentId,
        feature: "CHAT_MESSAGE",
        createdAt: { gte: periodStart },
      },
    }),
  ]);

  const limits = PLAN_LIMITS[plan];
  return {
    plan,
    summary: { used: summary, limit: limits.SUMMARY },
    flashcards: { used: flashcards, limit: limits.FLASHCARDS },
    chatMessages: { used: chat, limit: limits.CHAT_MESSAGES },
  };
}
