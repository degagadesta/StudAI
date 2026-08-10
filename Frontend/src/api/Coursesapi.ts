import { api } from "./client";

export interface AcademicProfile {
  fullName: string;
  university: string;
  department: string;
  subscriptionPlan: "FREE" | "STANDARD" | "PRO";
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
    "/academic-profile",
  );
  return res.data.data;
}

export async function getCourses(): Promise<Course[]> {
  // Backend infers year/semester from the authenticated user's profile —
  // no query params needed here.
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/student/courses",
  );
  return res.data.data;
}

export async function getAvailableCourses(): Promise<Course[]> {
  // Fetches available department courses from the database
  const res = await api.get<{ success: boolean; data: Course[] }>("/courses");
  return res.data.data;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await api.delete(`/courses/${courseId}`);
}

export async function createCourse(courseId: string): Promise<void> {
  await api.post(`/courses`, { courseId });
}

export async function uploadCoursePdf(
  courseId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await api.post(`/courses/${courseId}/pdfs`, formData);
}

export async function updateAcademicProfile(
  profileData: Partial<AcademicProfile>,
): Promise<AcademicProfile> {
  const res = await api.put<{ success: boolean; data: AcademicProfile }>(
    "/edit-profile",
    profileData,
  );
  return res.data.data;
}
