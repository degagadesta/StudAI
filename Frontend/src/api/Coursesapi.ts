import { api } from "./client";

export interface AcademicProfile {
  fullName: string;
  university: string;
  department: string;
  year: number;
  semester: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}
export type CreateCoursePayload = Omit<Course, "id">;

export async function getAcademicProfile(): Promise<AcademicProfile> {
  const res = await api.get<AcademicProfile>("/academic-profile");
  return res.data;
}

export async function getCourses(): Promise<Course[]> {
  // Backend infers year/semester from the authenticated user — no
  // query params needed here, it reads the same record the profile
  // endpoint above returns.
  const res = await api.get<Course[]>("/courses");
  return res.data;
}

export async function createCourse(data: CreateCoursePayload): Promise<Course> {
  const res = await api.post<Course>("/courses", data);
  return res.data;
}
