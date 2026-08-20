import { api } from "./client";

export async function generateSummary(
  materialId: string,
  forceRegenerate: boolean = false,
) {
  const res = await api.post(
    `/student/ai/materials/${materialId}/summary`,
    {},
    { params: { forceRegenerate: forceRegenerate.toString() } },
  );
  return res.data.data as { summary: string; cached: boolean };
}

export async function generateFlashcards(
  materialId: string,
  count: number = 10,
  forceRegenerate: boolean = false,
) {
  const res = await api.post(
    `/student/ai/materials/${materialId}/flashcards`,
    { count },
    { params: { forceRegenerate: forceRegenerate.toString() } },
  );
  return res.data.data as {
    flashcards: { id: string; question: string; answer: string }[];
    cached: boolean;
  };
}

export async function generateNotes(materialId: string) {
  const res = await api.post(
    `/student/ai/materials/${materialId}/notes`,
    {},
    { timeout: 60000 },
  );
  return res.data.data as { html: string };
}

export async function askQuestion(
  curriculumCourseId: string,
  materialId: string,
  question: string,
) {
  // AI requests can take longer, use 60 second timeout
  const res = await api.post(
    `/student/ai/chat/ask`,
    {
      curriculumCourseId,
      materialId,
      question,
    },
    { timeout: 60000 }, // 60 seconds for AI generation
  );
  return res.data.data as { sessionId: string; answer: string };
}

export async function explainTopic(
  materialId: string,
  curriculumCourseId: string,
  selectedText: string,
) {
  const res = await api.post(`/student/ai/explain-topic`, {
    materialId,
    curriculumCourseId,
    selectedText,
  });
  return res.data.data as { explanation: string };
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
