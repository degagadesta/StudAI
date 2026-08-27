// api/DashboardApi.ts
import { api } from "./client";

export interface DashboardSummary {
  student: {
    name: string;
  };
}

export interface DashboardPDF {
  id: string;
  title: string;
  progress: number;
  curriculumCourseId: string;
  courseId: string;
  courseName: string;
}

export interface DashboardPDFsResult {
  pdfs: DashboardPDF[];
  total: number;
  hasMore: boolean;
}

export interface GetDashboardPDFsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

// ── Welcome greeting / summary ──────────────────────────────────────────
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<{ success: boolean; data: DashboardSummary }>(
    "/student/dashboard",
  );
  return res.data.data;
}

// ── Paginated, searchable PDF list for the dashboard widget ────────────
export async function getDashboardPDFs(
  params: GetDashboardPDFsParams = {},
): Promise<DashboardPDFsResult> {
  const { limit = 3, offset = 0, search } = params;

  const res = await api.get<{ success: boolean } & DashboardPDFsResult>(
    "/student/dashboard/pdfs",
    {
      params: {
        limit,
        offset,
        ...(search ? { search } : {}),
      },
    },
  );

  const { pdfs, total, hasMore } = res.data;
  return { pdfs, total, hasMore };
}
