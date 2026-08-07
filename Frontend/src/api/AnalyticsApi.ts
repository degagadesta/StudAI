import { api } from "./client";

// ── Types ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  enrolledCourses: number;
  totalPdfsUploaded: number;
  // savedEvents removed — sourced from /events instead, see Scheduleapi.ts
}

export interface ActivityBucket {
  label: string;
  value: number; // hours for "daily", days-active for "weekly"/"monthly"
}

export interface ActivityBreakdown {
  daily: ActivityBucket[]; // 6 buckets — hours spent, last 6 days
  weekly: ActivityBucket[]; // 4 buckets — days active, past 4 weeks
  monthly: ActivityBucket[]; // 12 buckets — days active, past 12 months
}

export interface MaterialProgressRow {
  id: string;
  fileName: string;
  courseName?: string;
  uploadedAt: string;
  progress: number;
  workspacePath: string;
}

export interface MaterialsPage {
  rows: MaterialProgressRow[];
  total: number;
  page: number;
  limit: number;
}

// ── Requests ─────────────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await api.get<AnalyticsSummary>("/analytics");
  return res.data;
}

export async function getActivityBreakdown(): Promise<ActivityBreakdown> {
  const res = await api.get<ActivityBreakdown>("/analytics/activity");
  return res.data;
}

export async function getMaterialsProgress(
  page = 1,
  limit = 8,
): Promise<MaterialsPage> {
  const res = await api.get<MaterialsPage>("/analytics/materials", {
    params: { page, limit },
  });
  return res.data;
}
