import { api } from "./client";

export interface UsageLimit {
  used: number;
  limit: number | null;
}

export interface UsageSummary {
  plan: string;
  originalPlan: string;
  isExpired: boolean;
  expiresAt: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  usage: {
    summary: UsageLimit;
    flashcards: UsageLimit;
    chatMessages: UsageLimit;
    notesGeneration: UsageLimit;
    quizGeneration: UsageLimit;
    pdfUploads: UsageLimit;
    activeCourses: UsageLimit;
  };
}

export interface FeatureAccessResponse {
  feature: string;
  canUse: boolean;
}

/**
 * Get current usage summary
 */
export async function getUsageSummary(): Promise<UsageSummary> {
  const response = await api.get("/student/usage/summary");
  return response.data.data;
}

/**
 * Check if can use a specific feature
 */
export async function checkFeatureAccess(
  feature: string
): Promise<FeatureAccessResponse> {
  const response = await api.get(`/student/usage/check/${feature}`);
  return response.data.data;
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(usageLimit: UsageLimit): number {
  if (usageLimit.limit === null) return 0; // Unlimited
  if (usageLimit.limit === 0) return 100; // No limit means full
  return Math.min(100, Math.round((usageLimit.used / usageLimit.limit) * 100));
}

/**
 * Check if usage is near limit (>80%)
 */
export function isNearLimit(usageLimit: UsageLimit): boolean {
  if (usageLimit.limit === null) return false;
  return getUsagePercentage(usageLimit) >= 80;
}

/**
 * Check if usage limit is exceeded
 */
export function isLimitExceeded(usageLimit: UsageLimit): boolean {
  if (usageLimit.limit === null) return false;
  return usageLimit.used >= usageLimit.limit;
}
