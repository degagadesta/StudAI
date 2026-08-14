import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { generateStructured } from "../../lib/geminiClient.js";
import { Type } from "@google/genai";
import { PLAN_LIMITS } from "../../config/planLimits.js";
import {getRecentHistory} from "../ai/chatHistory.service.js"

import { retrieveRelevantChunks } from "./retrieval.service.js";

import { assertWithinLimit, recordUsage } from "../usage/usage.service.js";

// ---------- Shared helper ----------
async function getMaterialWithChunks(materialId, studentId) {
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    include: { chunks: { orderBy: { page: "asc" } } },
  });

  if (!material) throw new AppError("Material not found", 404);
  if (material.uploadedBy !== studentId) {
    throw new AppError("You don't have access to this material", 403);
  }
  if (material.chunks.length === 0) {
    throw new AppError("This material hasn't finished processing yet", 400);
  }

  return material;
}

// ---------- 1. Summary only ----------
const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
  },
  required: ["summary"],
};

// ---------- 2. Flashcards only ----------
const flashcardsSchema = {
  type: Type.OBJECT,
  properties: {
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["flashcards"],
};

export async function generateSummary(materialId, studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  await assertWithinLimit(
    studentId,
    student.subscriptionPlan,
    "SUMMARY",
    "SUMMARY",
  );

  const material = await getMaterialWithChunks(materialId, studentId);
  const noteText = material.chunks.map((c) => c.content).join("\n\n");

  const prompt = `
You are creating active-recall flashcards for a university student studying these notes.

NOTES:
"""
${noteText}
"""

Create exactly ${count} flashcards that test the key facts, definitions, and
concepts in these notes. Rules:
- Each question must be answerable using ONLY the notes above.
- Keep answers short and precise (1-3 sentences) — flashcards are for quick recall, not essays.
- Avoid duplicate or overlapping questions.
- Cover a spread of topics from across the notes, not just the beginning.
`;

  const result = await generateStructured({ prompt, schema: summarySchema });

  await prisma.courseMaterial.update({
    where: { id: materialId },
    data: { summary: result.summary },
  });

  await recordUsage(studentId, "SUMMARY");

  return { summary: result.summary };
}

export async function generateFlashcards(materialId, studentId, count = 10) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  await assertWithinLimit(
    studentId,
    student.subscriptionPlan,
    "FLASHCARDS",
    "FLASHCARDS",
  );

  const material = await getMaterialWithChunks(materialId, studentId);
  const prompt = `
You are a study assistant helping a university student review their course notes.

NOTES:
"""
${noteText}
"""

Write a clear, well-organized summary of these notes. Cover every major topic,
use short paragraphs or bullet points where it helps readability, and keep it
concise enough to review in a few minutes — this is a study aid, not a rewrite
of the original text.

Base the summary ONLY on the notes above — do not add outside information.
`;

  await recordUsage(studentId, "FLASHCARDS");

  return { flashcards };
}

export async function askAboutMaterial(
  studentId,
  curriculumCourseId,
  materialId,
  question,
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });
  const plan = student.subscriptionPlan;
  const limits = PLAN_LIMITS[plan];

  await assertWithinLimit(studentId, plan, "CHAT_MESSAGE", "CHAT_MESSAGES");

  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
  });
  if (!material) throw new AppError("Material not found", 404);

  if (material.status !== "READY") {
    throw new AppError(
      "This material is still being prepared for AI chat. Please try again shortly.",
      400,
    );
  }

  const relevantChunks = await retrieveRelevantChunks(
    materialId,
    question,
    limits.CHAT_CONTEXT_TOKENS,
  ).catch((err) => {
    // If chunks are missing or not processed, provide helpful error
    if (err.message?.includes("without embeddings")) {
      throw new AppError(
        "This material is still being prepared for AI chat. Please try again in a few moments.",
        400,
      );
    }
    throw err;
  });

  let session = await prisma.chatSession.findFirst({
    where: { studentId, curriculumCourseId },
    orderBy: { createdAt: "desc" },
  });
  if (!session) {
    session = await prisma.chatSession.create({
      data: { studentId, curriculumCourseId },
    });
  }

  const history = await getRecentHistory(
    session.id,
    limits.CHAT_HISTORY_TOKENS,
  );

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: "USER", content: question },
  });

  // No relevant chunks passed the threshold — don't force irrelevant content in.
  if (relevantChunks.length === 0) {
    const fallback =
      "I couldn't find information about that in this material. Try rephrasing your question, or check that you're studying the right document.";
    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "ASSISTANT", content: fallback },
    });
    await recordUsage(studentId, "CHAT_MESSAGE", { materialId });
    return { sessionId: session.id, answer: fallback };
  }

  const noteText = relevantChunks
    .map((c) => (c.page ? `[Page ${c.page}]\n${c.content}` : c.content))
    .join("\n\n");

  const historyText =
    history.length > 0
      ? history
          .map(
            (m) =>
              `${m.role === "USER" ? "Student" : "Assistant"}: ${m.content}`,
          )
          .join("\n")
      : "(no earlier messages)";

  const prompt = `
SYSTEM
You are a patient tutor helping a student understand their course material.
Answer using only the material below. If it's not enough to answer, say so honestly.

RELEVANT COURSE MATERIAL
"""
${noteText}
"""

RECENT CONVERSATION
${historyText}

CURRENT QUESTION
${question}
`;

  const { generateText } = await import("../../lib/geminiClient.js");
  const { text: answer, usageMetadata } = await generateText({
    prompt,
    maxOutputTokens: limits.CHAT_MAX_OUTPUT_TOKENS,
  });

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: "ASSISTANT", content: answer },
  });

  await recordUsage(studentId, "CHAT_MESSAGE", {
    materialId,
    model: "gemini-2.5-flash",
    inputTokens: usageMetadata?.promptTokenCount ?? null,
    outputTokens: usageMetadata?.candidatesTokenCount ?? null,
    totalTokens: usageMetadata?.totalTokenCount ?? null,
  });

  return { sessionId: session.id, answer };
}

export async function explainTopic(
  studentId,
  materialId,
  curriculumCourseId,
  selectedText,
) {
  // Validate selectedText
  if (!selectedText || typeof selectedText !== "string") {
    throw new AppError("Selected text is required", 400);
  }

  const trimmedText = selectedText.trim();
  if (trimmedText.length === 0) {
    throw new AppError("Selected text cannot be empty", 400);
  }

  // Enforce maximum length (2000 characters)
  const MAX_SELECTED_TEXT_LENGTH = 2000;
  if (trimmedText.length > MAX_SELECTED_TEXT_LENGTH) {
    throw new AppError(
      `Selected text is too long. Maximum ${MAX_SELECTED_TEXT_LENGTH} characters allowed`,
      400,
    );
  }

  // Get student and check subscription plan
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const plan = student.subscriptionPlan;

  // Check usage limits
  await assertWithinLimit(studentId, plan, "EXPLAIN_TOPIC");

  // Verify material exists and student has access
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    select: {
      id: true,
      uploadedBy: true,
      curriculumCourseId: true,
      status: true,
    },
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  if (material.uploadedBy !== studentId) {
    throw new AppError("You don't have access to this material", 403);
  }

  if (material.curriculumCourseId !== curriculumCourseId) {
    throw new AppError("Material does not belong to the specified course", 400);
  }

  // Create prompt for Gemini - ONLY send the selected text
  const prompt = `
You are a patient tutor helping a university student understand their course material.

The student has selected the following text from their study material and wants you to explain it:

"""
${trimmedText}
"""

Please provide a clear and simple explanation that:
1. Explains the main concept or idea in the selected text
2. Defines any difficult or technical terms
3. Provides a short, relevant example when it helps understanding
4. Uses language appropriate for a university student

Keep your explanation concise and focused. Base your explanation ONLY on what is written in the selected text - do not add information from outside sources or make assumptions beyond what is stated.

If the selected text is unclear or incomplete, mention that and explain what you can based on what's provided.
`;

  // Get plan limits for max output tokens
  const limits = PLAN_LIMITS[plan];
  const maxOutputTokens = limits.EXPLAIN_MAX_OUTPUT_TOKENS;

  // Call Gemini API
  const { generateText } = await import("../../lib/geminiClient.js");
  const { text: explanation, usageMetadata } = await generateText({
    prompt,
    maxOutputTokens,
  });

  // Record usage with actual token counts from Gemini
  await recordUsage(studentId, "EXPLAIN_TOPIC", {
    materialId,
    model: "gemini-2.5-flash",
    inputTokens: usageMetadata?.promptTokenCount ?? null,
    outputTokens: usageMetadata?.candidatesTokenCount ?? null,
    totalTokens: usageMetadata?.totalTokenCount ?? null,
  });

  return {
    explanation,
    selectedText: trimmedText,
  };
}
