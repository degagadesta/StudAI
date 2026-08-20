import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { generateStructured, generateText, MODELS } from "../../lib/geminiClient.js";
import { Type } from "@google/genai";
import { retrieveRelevantChunks } from "./retrieval.service.js";
import { getRecentHistory } from "./chatHistory.service.js";
import { assertWithinLimit, recordUsage } from "../usage/usage.service.js";
import { PLAN_LIMITS } from "../../config/planLimits.js";

// ---------- Shared helper ----------
// ai.service.js
async function getMaterialWithAccess(materialId, studentId) {
  const material = await prisma.courseMaterial.findUnique({ where: { id: materialId } });

  if (!material) throw new AppError("Material not found", 404);
  if (material.uploadedBy !== studentId) {
    throw new AppError("You don't have access to this material", 403);
  }
  if (material.status === "FAILED") {
    throw new AppError("This material failed to process. Try re-uploading it.", 400);
  }
  if (material.status !== "READY") {
    throw new AppError("This material is still being processed", 400);
  }

  return material;
}

// ---------- In-process de-dup lock ----------
// Prevents two concurrent requests (double-click, two tabs) from both
// paying for a full Gemini generation for the same key. This only
// dedupes within a single server process — if you run multiple
// instances behind a load balancer, upgrade this to a Redis SETNX lock
// before it matters.
const inFlight = new Map();

async function dedupe(key, fn) {
  if (inFlight.has(key)) {
    console.log(`[AI] Joining in-flight request for ${key}`);
    return inFlight.get(key);
  }
  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

// ---------- Concurrency-limited map helper ----------
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ---------- SUMMARY GENERATION ----------

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
  },
  required: ["summary"],
};

const SUMMARY_SYSTEM = `You are a study assistant helping a university student review their course material. Base your output ONLY on the material given to you — never add outside information.`;

const MAX_SINGLE_PASS_TOKENS = 30000; // ~7500 words
const CHUNK_BATCH_SIZE = 5; // chunks summarized together per map-step call
const MAP_CONCURRENCY = 4; // concurrent Gemini calls during map step — tune to your rate-limit tier

export async function generateSummary(materialId, studentId, forceRegenerate = false) {
  const material = await getMaterialWithAccess(materialId, studentId);

  if (material.summary && !forceRegenerate) {
    console.log(`[AI] Returning cached summary for material ${materialId}`);
    return { summary: material.summary, cached: true };
  }

  return dedupe(`summary:${materialId}`, () => doGenerateSummary(materialId, studentId));
}

async function doGenerateSummary(materialId, studentId) {
  console.log(`[AI] Generating new summary for material ${materialId}`);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  await assertWithinLimit(studentId, student.subscriptionPlan, "SUMMARY");

  const chunks = await prisma.materialChunk.findMany({
    where: { materialId },
    orderBy: { chunkIndex: "asc" },
  });

  if (chunks.length === 0) {
    throw new AppError("This material has no content to summarize", 400);
  }

  let summary;
  const totalText = chunks.map((c) => c.content).join("\n\n");
  const estimatedTokens = Math.ceil(totalText.length / 4);

  if (estimatedTokens <= MAX_SINGLE_PASS_TOKENS) {
    console.log(`[AI] Single-pass summary (${estimatedTokens} tokens)`);

    const prompt = `COURSE MATERIAL:
"""
${totalText}
"""

Write a clear, well-organized summary of this material. Cover every major topic, use short paragraphs or bullet points where it helps readability, and keep it concise enough to review in a few minutes.`;

    const result = await generateStructured({
      prompt,
      schema: summarySchema,
      model: MODELS.SUMMARY_SINGLE,
      system: SUMMARY_SYSTEM,
    });

    summary = result.data.summary;
  } else {
    console.log(`[AI] Map-reduce summary (${estimatedTokens} tokens, ${chunks.length} chunks)`);

    const batches = [];
    for (let i = 0; i < chunks.length; i += CHUNK_BATCH_SIZE) {
      batches.push(chunks.slice(i, i + CHUNK_BATCH_SIZE));
    }

    // Map step, fired with bounded concurrency instead of one-at-a-time —
    // this is the main latency win for long documents.
    const chunkSummaries = await mapWithConcurrency(batches, MAP_CONCURRENCY, async (batch) => {
      const batchText = batch.map((c) => c.content).join("\n\n");
      const chunkPrompt = `Summarize these course material sections concisely, preserving key facts and concepts:

"""
${batchText}
"""

Summary:`;

      const chunkResult = await generateText({
        prompt: chunkPrompt,
        model: MODELS.SUMMARY_MAP,
        // maxOutputTokens: 500,
      });

      return chunkResult.text;
    });

    console.log(`[AI] Map step complete (${chunkSummaries.length} batch summaries)`);

    const combinedText = chunkSummaries.join("\n\n");
    const finalPrompt = `SECTION SUMMARIES:
"""
${combinedText}
"""

Create a cohesive, well-organized final summary that:
- Covers all major topics from the sections
- Uses clear paragraphs or bullet points
- Is concise enough to review in a few minutes
- Flows naturally as a single document`;

    const finalResult = await generateStructured({
      prompt: finalPrompt,
      schema: summarySchema,
      model: MODELS.SUMMARY_REDUCE,
      system: SUMMARY_SYSTEM,
    });

    summary = finalResult.data.summary;
  }

  await prisma.courseMaterial.update({
    where: { id: materialId },
    data: { summary },
  });

  await recordUsage(studentId, "SUMMARY", { materialId });

  console.log(`[AI] Summary generated and cached (${summary.length} chars)`);

  return { summary, cached: false };
}

// ---------- FLASHCARD GENERATION ----------

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

const FLASHCARDS_SYSTEM = `You are creating active-recall flashcards for a university student. Every question must be answerable using ONLY the material given to you.`;

export async function generateFlashcards(materialId, studentId, count = 10, forceRegenerate = false) {
  const material = await getMaterialWithAccess(materialId, studentId);

  const existingFlashcards = await prisma.flashcard.findMany({
    where: { materialId },
    select: { id: true, question: true, answer: true },
  });

  // Cache hit only if we actually have the requested count cached —
  // otherwise a caller asking for 20 silently got back 10 before.
  if (existingFlashcards.length === count && !forceRegenerate) {
    console.log(`[AI] Returning ${existingFlashcards.length} cached flashcards for material ${materialId}`);
    return { flashcards: existingFlashcards, cached: true };
  }

  return dedupe(`flashcards:${materialId}:${count}`, () =>
    doGenerateFlashcards(material, materialId, studentId, count, forceRegenerate, existingFlashcards),
  );
}

async function doGenerateFlashcards(material, materialId, studentId, count, forceRegenerate, existingFlashcards) {
  console.log(`[AI] Generating ${count} new flashcards for material ${materialId}`);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });

  await assertWithinLimit(studentId, student.subscriptionPlan, "FLASHCARDS");

  let contentBasis;
  if (material.summary) {
    console.log(`[AI] Using cached summary as basis for flashcards`);
    contentBasis = material.summary;
  } else {
    console.log(`[AI] No summary available, using chunks directly`);
    const chunks = await prisma.materialChunk.findMany({
      where: { materialId },
      orderBy: { chunkIndex: "asc" },
      take: 20,
    });

    if (chunks.length === 0) {
      throw new AppError("This material has no content", 400);
    }

    contentBasis = chunks.map((c) => c.content).join("\n\n");

    const MAX_CHARS = 30000;
    if (contentBasis.length > MAX_CHARS) {
      console.log(`[AI] Content too long (${contentBasis.length} chars), truncating to ${MAX_CHARS}`);
      contentBasis = contentBasis.substring(0, MAX_CHARS);
    }
  }

  const prompt = `COURSE MATERIAL:
"""
${contentBasis}
"""

Create exactly ${count} flashcards that test the key facts, definitions, and concepts. Rules:
- Each question must be answerable using ONLY the material above
- Keep answers short and precise (1-3 sentences) — flashcards are for quick recall
- Avoid duplicate or overlapping questions
- Cover a spread of topics from across the material
- Format: clear question, concise answer`;

  try {
    const result = await generateStructured({
      prompt,
      schema: flashcardsSchema,
      model: MODELS.FLASHCARDS,
      system: FLASHCARDS_SYSTEM,
    });

    const flashcards = result.data.flashcards.slice(0, count);

    if (existingFlashcards.length > 0) {
      await prisma.flashcard.deleteMany({ where: { materialId } });
    }

    await prisma.flashcard.createMany({
      data: flashcards.map((fc) => ({
        materialId,
        question: fc.question,
        answer: fc.answer,
      })),
    });

    const createdFlashcards = await prisma.flashcard.findMany({
      where: { materialId },
      select: { id: true, question: true, answer: true },
      orderBy: { createdAt: "asc" },
    });

    await recordUsage(studentId, "FLASHCARDS", { materialId, count: flashcards.length });

    console.log(`[AI] Generated and cached ${createdFlashcards.length} flashcards`);

    return { flashcards: createdFlashcards, cached: false };
  } catch (error) {
    console.error(`[AI] Flashcard generation failed:`, error);
    throw new AppError(`Failed to generate flashcards: ${error.message}`, 500);
  }
}

// ---------- CHAT / RAG ----------

const CHAT_SYSTEM = `You are a patient tutor helping a student understand their course material. Answer using the material given to you and general internet information if you asked you about the text that exists inside it. If it's not enough to answer, say so honestly. Keep answers clear and concise.`;

export async function askAboutMaterial(studentId, curriculumCourseId, materialId, question) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });
  const plan = student.subscriptionPlan;
  const limits = PLAN_LIMITS[plan];

  await assertWithinLimit(studentId, plan, "CHAT_MESSAGE");

  const material = await getMaterialWithAccess(materialId, studentId);

  console.log(`[AI] Chat question for material ${materialId}: "${question.substring(0, 50)}..."`);

  const relevantChunks = await retrieveRelevantChunks(
    materialId,
    question,
    limits?.CHAT_CONTEXT_TOKENS || 4000,
  ).catch((err) => {
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

  const history = await getRecentHistory(session.id, limits?.CHAT_HISTORY_TOKENS || 2000, 8);

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: "USER", content: question },
  });

  if (relevantChunks.length === 0) {
    const fallback =
      "I couldn't find information about that in this material. Try rephrasing your question, or check that you're studying the right document.";

    await prisma.chatMessage.create({
      data: { sessionId: session.id, role: "ASSISTANT", content: fallback },
    });

    await recordUsage(studentId, "CHAT_MESSAGE", { materialId });

    return { sessionId: session.id, answer: fallback };
  }

  const contextText = relevantChunks
    .map((c) => (c.page ? `[Page ${c.page}]\n${c.content}` : c.content))
    .join("\n\n");

  const historyText =
    history.length > 0
      ? history.map((m) => `${m.role === "USER" ? "Student" : "Assistant"}: ${m.content}`).join("\n")
      : "(no earlier messages)";

  const prompt = `RELEVANT COURSE MATERIAL
"""
${contextText}
"""

RECENT CONVERSATION
${historyText}

CURRENT QUESTION
${question}`;

  const { text: answer, usageMetadata } = await generateText({
    prompt,
    model: MODELS.CHAT,
    system: CHAT_SYSTEM,
    //maxOutputTokens: limits?.CHAT_MAX_OUTPUT_TOKENS || 800,
  });

  await prisma.chatMessage.create({
    data: { sessionId: session.id, role: "ASSISTANT", content: answer },
  });

  await recordUsage(studentId, "CHAT_MESSAGE", {
    materialId,
    model: MODELS.CHAT,
    inputTokens: usageMetadata?.promptTokenCount ?? null,
    outputTokens: usageMetadata?.candidatesTokenCount ?? null,
    totalTokens: usageMetadata?.totalTokenCount ?? null,
  });

  console.log(`[AI] Chat response generated (${answer.length} chars)`);

  return { sessionId: session.id, answer };
}

/**
 * Explain a selected topic/text snippet (standalone, not part of chat history)
 */
export async function explainTopic(studentId, materialId, curriculumCourseId, selectedText) {
  if (!selectedText || typeof selectedText !== "string") {
    throw new AppError("Selected text is required", 400);
  }

  const trimmed = selectedText.trim();
  if (trimmed.length === 0) {
    throw new AppError("Selected text cannot be empty", 400);
  }

  if (trimmed.length > 2000) {
    throw new AppError("Selected text is too long (max 2000 characters)", 400);
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true },
  });
  const plan = student.subscriptionPlan;
  const limits = PLAN_LIMITS[plan];

  await assertWithinLimit(studentId, plan, "EXPLAIN_TOPIC");

  await getMaterialWithAccess(materialId, studentId);

  const prompt = `The student selected this text and wants it explained:

"""
${trimmed}
"""

Provide a clear, concise explanation that:
- Defines any difficult terms
- Explains the concept step-by-step if complex
- Gives a short example if helpful
- Is suitable for a university student

Do not invent information — explain only what's in the selected text. based on the material uploaded`;

  const { text: explanation, usageMetadata } = await generateText({
    prompt,
    model: MODELS.EXPLAIN,
    system: `You are a patient tutor helping a student understand a specific topic from their course material.`,
    // maxOutputTokens: limits?.EXPLAIN_MAX_OUTPUT_TOKENS || 600,
  });

  await recordUsage(studentId, "EXPLAIN_TOPIC", {
    materialId,
    model: MODELS.EXPLAIN,
    inputTokens: usageMetadata?.promptTokenCount ?? null,
    outputTokens: usageMetadata?.candidatesTokenCount ?? null,
    totalTokens: usageMetadata?.totalTokenCount ?? null,
  });

  return { explanation };
}

// ---------- EXAM GENERATION (not implemented yet) ----------

export async function generateExamFromMaterial(_studentId, _curriculumCourseId, _materialId, _topic) {
  throw new AppError("Practice exam generation isn't available yet.", 501);
}