import { api } from "./client";

export interface Question {
  id: string;
  pastExamId: string;
  topic: string | null;
  question: string;
  questionType: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  marks: number | null;
  status: "EXTRACTED" | "NEEDS_REVIEW" | "VERIFIED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  year: number;
  type: "MID" | "FINAL";
  fileUrl: string;
  status: "QUEUED" | "PROCESSING" | "NEEDS_REVIEW" | "READY" | "FAILED";
  curriculumCourseId: string;
  uploadedBy: string | null;
  processingError: string | null;
  createdAt: string;
  updatedAt: string;
  chunks: Question[];
  curriculumCourse: any;
}

export interface Curriculum {
  id: string;
  label: string;
}

export interface CurriculumCourseItem {
  id: string;
  courseCode: string;
  year: number;
  semester: number;
  creditHours: number | null;
  course: {
    id: string;
    title: string;
    description: string | null;
  };
}

/**
 * Admin: Upload past exam
 */
export async function uploadPastExam(
  file: File,
  curriculumCourseId: string,
  examYear: number,
  examType: "MID" | "FINAL"
): Promise<Exam> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("curriculumCourseId", curriculumCourseId);
  formData.append("examYear", examYear.toString());
  formData.append("examType", examType);

  const res = await api.post<{
    success: boolean;
    message: string;
    data: Exam;
  }>("/student/exams/admin/exams", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
}

/**
 * Fetch curricula for a given department
 */
export async function getCurriculaByDepartment(
  departmentId: string
): Promise<Curriculum[]> {
  const res = await api.get<{ success: boolean; data: Curriculum[] }>(
    `/departments/${departmentId}/curricula`
  );
  return res.data.data;
}

/**
 * Fetch all CurriculumCourse records for a given curriculum
 */
export async function getCurriculumCourses(
  curriculumId: string
): Promise<CurriculumCourseItem[]> {
  const res = await api.get<{ success: boolean; data: CurriculumCourseItem[] }>(
    `/curricula/${curriculumId}/courses`
  );
  return res.data.data;
}

/**
 * Admin: Get exam for review
 */
export async function getExamForReview(examId: string): Promise<Exam> {
  const res = await api.get<{ success: boolean; data: Exam }>(
    `/student/exams/admin/exams/${examId}`
  );
  return res.data.data;
}

/**
 * Admin: Update question
 */
export async function updateQuestion(
  questionId: string,
  updates: Partial<Question>
): Promise<Question> {
  const res = await api.patch<{
    success: boolean;
    message: string;
    data: Question;
  }>(`/student/exams/admin/exams/questions/${questionId}`, updates);

  return res.data.data;
}

/**
 * Admin: Finalize exam (mark as READY)
 */
export async function finalizeExam(examId: string): Promise<Exam> {
  const res = await api.post<{
    success: boolean;
    message: string;
    data: Exam;
  }>(`/student/exams/admin/exams/${examId}/finalize`);

  return res.data.data;
}

/**
 * Student: Get practice questions
 */
export async function getPracticeQuestions(
  curriculumCourseId: string,
  filters?: {
    topic?: string;
    questionType?: string;
    limit?: number;
  }
): Promise<Question[]> {
  const params = new URLSearchParams({
    curriculumCourseId,
    ...(filters?.topic && { topic: filters.topic }),
    ...(filters?.questionType && { questionType: filters.questionType }),
    ...(filters?.limit && { limit: filters.limit.toString() }),
  });

  const res = await api.get<{
    success: boolean;
    data: Question[];
  }>(`/student/exams/student/exams/questions?${params.toString()}`);

  return res.data.data;
}

/**
 * Student: Evaluate answer
 */
export async function evaluateAnswer(
  questionId: string,
  answer: string
): Promise<{
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
  marks: number;
  maxMarks: number;
}> {
  const res = await api.post<{
    success: boolean;
    data: {
      isCorrect: boolean;
      correctAnswer: string;
      explanation: string | null;
      marks: number;
      maxMarks: number;
    };
  }>(`/student/exams/student/exams/evaluate`, {
    questionId,
    answer,
  });

  return res.data.data;
}
