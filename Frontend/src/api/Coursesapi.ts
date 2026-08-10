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
  description: string | null;
  creditHours?: number | null;
  year?: number;
  semester?: number;
  pdfs?: CoursePdf[];
  pdfCount: number;
  isEnrolled?: boolean; // only present on catalog results
}

export async function getAcademicProfile(): Promise<AcademicProfile> {
  const res = await api.get<{ success: boolean; data: AcademicProfile }>(
    "/academic-profile",
  );
  return res.data.data;
}

export async function getCourses(searchQuery?: string): Promise<Course[]> {
  const params = searchQuery ? { search: searchQuery } : {};
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/student/courses",
    { params }
  );
  // Ensure pdfs array exists and pdfCount is set
  return res.data.data.map(course => ({
    ...course,
    pdfs: course.pdfs || [],
    pdfCount: course.pdfCount || (course.pdfs || []).length
  }));
}
export async function getAllCourses(searchQuery?: string): Promise<Course[]> {
  const params = searchQuery ? { search: searchQuery } : {};
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/getAllNotes/student/courses",
    { params }
  );
  return res.data.data;
}

export async function getAvailableCourses(
  searchQuery?: string,
): Promise<Course[]> {
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/student/courses/catalog",
    { params: searchQuery?.trim() ? { search: searchQuery.trim() } : {} },
  );
  return res.data.data;
}

export async function addCourseSelection(curriculumCourseId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    selectionId: string;
    course: {
      courseCode: string;
      title: string;
      year: number;
      semester: number;
      creditHours: number | null;
    };
    currentSelections: number;
    selectedAt: string;
  };
}> {
  const res = await api.post("/student/courses/select", { curriculumCourseId });
  return res.data;
}

export async function dropCourseSelection(curriculumCourseId: string): Promise<{
  success: boolean;
  message: string;
  warning?: string;
  data: {
    droppedCourse: {
      courseCode: string;
      title: string;
    };
    deletedPDFs: number;
    remainingSelections: number;
  };
}> {
  const res = await api.delete(`/student/courses/select/${curriculumCourseId}`);
  return res.data;
}

// Legacy aliases for backward compatibility
export async function deleteCourse(curriculumCourseId: string): Promise<void> {
  await dropCourseSelection(curriculumCourseId);
}

export async function createCourse(curriculumCourseId: string): Promise<void> {
  await addCourseSelection(curriculumCourseId);
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
