import { api } from "./client";

export interface AcademicProfile {
  fullName: string;
  university: string;
  department: string;
  year: number;
  semester: number;
}

export interface CoursePdf {
  id: string;
  title: string;
  progress: number;
  uploadedAt: string;
}

export interface Course {
  id: string; // curriculumCourseId — this is what must be sent as curriculumCourseId on upload
  courseId: string; // generic Course id, for reference only
  code: string;
  name: string;
  description: string;
  pdfs: CoursePdf[];
  pdfCount: number;
}

export async function getAcademicProfile(): Promise<AcademicProfile> {
  const res = await api.get<{ success: boolean; data: AcademicProfile }>(
    "/academic-profile"
  );

  return res.data.data;
}

export async function getCourses(): Promise<Course[]> {
  // Backend infers year/semester from the authenticated user's profile —
  // no query params needed here.
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/student/courses"
  );
  return res.data.data;
}