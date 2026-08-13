import { api } from "./client";

export async function generateSummary(materialId: string) {
  const res = await api.post(`/student/ai/materials/${materialId}/summary`);
  return res.data.data as { summary: string };
}

export async function generateFlashcards(materialId: string, count?: number) {
  const res = await api.post(`/student/ai/materials/${materialId}/flashcards`, {
    count,
  });
  return res.data.data as {
    flashcards: { id: string; question: string; answer: string }[];
  };
}

export async function askQuestion(
  curriculumCourseId: string,
  materialId: string,
  question: string,
) {
  const res = await api.post(`/student/ai/chat/ask`, {
    curriculumCourseId,
    materialId,
    question,
  });
  return res.data.data as { sessionId: string; answer: string };
}

export async function generateExam(
  curriculumCourseId: string,
  materialId: string,
  topic?: string,
) {
  const res = await api.post(
    `/student/ai/courses/${curriculumCourseId}/materials/${materialId}/exam`,
    null,
    { params: topic ? { topic } : {} },
  );
  return res.data.data;
}
