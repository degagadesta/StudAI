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

export async function updateProfileAcademic(): Promise<AcademicProfile> {
  const res = await api.put<{ success: boolean; data: AcademicProfile }>(
    "/academic-profile/academic",
  );
  return res.data.data;
}
export async function updateProfileBasic(): Promise<AcademicProfile> {
  const res = await api.put<{ success: boolean; data: AcademicProfile }>(
    "/academic-profile/basic",
  );
  return res.data.data;
}
/**
 * Get student's selected courses for current year/semester
 * @param searchQuery - Optional search term to filter courses by name or PDF title
 */
export async function getCourses(searchQuery?: string): Promise<Course[]> {
  const params = searchQuery ? { search: searchQuery } : {};
  const res = await api.get<{ success: boolean; data: Course[] }>(
    "/student/courses",
    { params }
  );
  return res.data.data;
}



export async function getAvailableCourses(): Promise<Course[]> {
  // Fetches available department courses from the database
  const res = await api.get<{ success: boolean; data: Course[] }>("/courses");
  return res.data.data;
}

/**
 * Add a course to student's schedule
 * @param curriculumCourseId - The curriculum course ID to add
 */
export async function addCourseSelection(curriculumCourseId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    id: string;
    courseName: string;
    courseCode: string;
  };
}> {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: {
      id: string;
      courseName: string;
      courseCode: string;
    };
  }>("/student/courses/select", { curriculumCourseId });
  return res.data;
}

/**
 * Drop a course from student's schedule
 * Warning: This will permanently delete all PDFs uploaded for this course
 * @param curriculumCourseId - The curriculum course ID to drop
 */
export async function dropCourseSelection(curriculumCourseId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    courseCode: string;
    courseName: string;
    deletedPDFs: number;
  };
  warning?: string;
}> {
  const res = await api.delete<{
    success: boolean;
    message: string;
    data: {
      courseCode: string;
      courseName: string;
      deletedPDFs: number;
    };
    warning?: string;
  }>(`/student/courses/select/${curriculumCourseId}`);
  return res.data;
}

// Legacy methods - deprecated but kept for backward compatibility
export async function deleteCourse(courseId: string): Promise<void> {
  console.warn("deleteCourse is deprecated, use dropCourseSelection instead");
  await api.delete(`/courses/${courseId}`);
}

export async function createCourse(courseId: string): Promise<void> {
  console.warn("createCourse is deprecated, use addCourseSelection instead");
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
