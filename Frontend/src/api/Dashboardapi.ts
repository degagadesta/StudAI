import { api } from "./client";

export interface DashboardSummary {
  activeCourses: number; // courses for the student's current year/semester
  pastExamsCompleted: number;
  averageCourseProgress: number; // 0–100
  daysUntilNextQuiz: number | null; // null if nothing scheduled — sourced from the Schedule tab
}

export interface ActivityRow {
  rollNumber: string;
  pdfName: string;
  uploadedAt: string; // ISO date string
  progress: number; // 0–100
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<DashboardSummary>("/dashboard/summary");
  return res.data;
}

export async function getRecentActivity(): Promise<ActivityRow[]> {
  const res = await api.get<ActivityRow[]>("/dashboard/activity");
  return res.data;
}
