import { api } from "./client";

export interface University {
  id: string;
  name: string;
  city?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  description?: string;
  creditHours?: number;
  year: number;
  semester: number;
}

export interface OnboardingPayload {
  universityId: string;
  departmentId: string;
  currentYear: number;
  currentSemester: number;
  selectedCourseIds: string[];
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: string;
      studentId: string;
      curriculumId: string;
      currentYear: number;
      currentSemester: number;
    };
    courses: Course[];
  };
}

/**
 * Fetch all available universities
 */
export async function getUniversities(): Promise<University[]> {
  const res = await api.get<{ success: boolean; data: University[] }>("/universities");
  return res.data.data;
}

/**
 * Fetch departments by university ID
 */
export async function getDepartments(universityId: string): Promise<Department[]> {
  const res = await api.get<{ success: boolean; data: Department[] }>(
    `/api/departments/universities/${universityId}/departments`
  );
  return res.data.data;
}

/**
 * Fetch available courses for a specific university, department, year, and semester
 */
export async function getAvailableCourses(
  universityId: string,
  departmentId: string,
  year: number,
  semester: number
): Promise<Course[]> {
  const res = await api.get<{ success: boolean; data: Course[] }>(
    `/api/student/onboarding/courses`,
    {
      params: { universityId, departmentId, year, semester },
    }
  );
  return res.data.data;
}

/**
 * Saves the student's academic onboarding selections including selected courses
 */
export async function submitOnboarding(
  payload: OnboardingPayload
): Promise<OnboardingResponse> {
  const res = await api.post<OnboardingResponse>("/api/student/onboarding", payload);
  return res.data;
}
