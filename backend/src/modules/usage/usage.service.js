import { prisma } from "../../lib/prisma.js";
import { PLAN_LIMITS } from "../../config/planLimits.js";

function billingPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// No plan limits are enforced right now — every plan is effectively
// unlimited. This is intentionally a no-op so call sites don't need to
// change when limits come back; flip it on per-feature later without
// touching ai.service.js.
export async function assertWithinLimit(_studentId, _plan, _feature) {
  return;
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
      where: { studentId, feature: "FLASHCARDS", createdAt: { gte: periodStart } },
    }),
    prisma.usageLog.count({
      where: { studentId, feature: "CHAT_MESSAGE", createdAt: { gte: periodStart } },
    }),
  ]);

  const limits = PLAN_LIMITS[plan];
  return {
    plan,
    summary: { used: summary, limit: limits?.SUMMARY ?? null },
    flashcards: { used: flashcards, limit: limits?.FLASHCARDS ?? null },
    chatMessages: { used: chat, limit: limits?.CHAT_MESSAGES ?? null },
  };
}