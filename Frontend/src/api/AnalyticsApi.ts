import { api } from "./client";

// ── Raw shapes returned by the backend ─────────────────────────────────────

interface DailyActivityRaw {
  date: string;
  day: string; // "Mon", "Tue", ...
  hours: number;
}

interface WeeklyActivityRaw {
  weekStart: string;
  weekEnd: string;
  weekLabel: string; // "Week 1".."Week 4"
  days: number;
}

interface MonthlyActivityRaw {
  month: string; // "Jan 2026"
  year: number;
  monthNumber: number;
  days: number;
}

interface AnalyticsResponseRaw {
  enrolledCourses: number;
  totalPdfsUploaded: number;
  totalEvents: number;
  activity: {
    daily: DailyActivityRaw[];
    weekly: WeeklyActivityRaw[];
    monthly: MonthlyActivityRaw[];
  };
}

// ── Normalized shapes the frontend actually uses ────────────────────────────

export interface AnalyticsSummary {
  enrolledCourses: number;
  totalPdfsUploaded: number;
  totalEvents: number;
}

export interface ActivityBucket {
  label: string;
  value: number;
}

export interface ActivityBreakdown {
  daily: ActivityBucket[]; // 7 buckets, hours per day
  weekly: ActivityBucket[]; // 4 buckets, days active per week
  monthly: ActivityBucket[]; // 12 buckets, days active per month
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

// ── Normalization ────────────────────────────────────────────────────────

function normalizeActivity(
  raw: AnalyticsResponseRaw["activity"],
): ActivityBreakdown {
  return {
    daily: raw.daily.map((d) => ({ label: d.day, value: d.hours })),
    weekly: raw.weekly.map((w) => ({ label: w.weekLabel, value: w.days })),
    monthly: raw.monthly.map((m) => ({ label: m.month, value: m.days })),
  };
}

// ── Requests ─────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<{
  summary: AnalyticsSummary;
  activity: ActivityBreakdown;
}> {
  const res = await api.get<{ success: boolean; data: AnalyticsResponseRaw }>(
    "/student/analytics"
  );
  const { enrolledCourses, totalPdfsUploaded, totalEvents, activity } =
    res.data.data;

  return {
    summary: { enrolledCourses, totalPdfsUploaded, totalEvents },
    activity: normalizeActivity(activity),
  };
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
