import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { generateStructured } from "../../lib/geminiClient.js";
import { Type } from "@google/genai";
import { extractTextFromPDF, extractTextFromImage } from "../ai/textExtraction.js";

/**
 * Upload past exam and start processing
 */
export async function uploadPastExam(
  file,
  curriculumCourseId,
  examYear,
  examType,
  uploadedBy
) {
  console.log(`[Exam] Uploading past exam: ${file.originalname}`);

  // Validate input
  if (!file || !curriculumCourseId || !examYear || !examType) {
    throw new AppError("Missing required fields", 400);
  }

  if (!["MID", "FINAL"].includes(examType)) {
    throw new AppError("Invalid exam type", 400);
  }

  // For now, store as simple reference (in production, upload to S3/Cloud Storage)
  const fileUrl = `/exams/${file.filename || Date.now()}_${file.originalname}`;

  // Create PastExam record
  const exam = await prisma.pastExam.create({
    data: {
      year: parseInt(examYear),
      type: examType,
      fileUrl,
      status: "QUEUED",
      curriculumCourseId,
      uploadedBy,
    },
    include: {
      curriculumCourse: {
        include: { course: true },
      },
    },
  });

  console.log(`[Exam] Created exam record: ${exam.id}`);

  // Trigger async processing - pass file buffer and mimeType
  processPastExamAsync(exam.id, file.buffer, file.mimetype);

  return exam;
}

/**
 * Process exam asynchronously
 */
export function processPastExamAsync(examId, fileBuffer, mimeType) {
  // Don't await - let it run in background
  processPastExam(examId, fileBuffer, mimeType).catch((error) => {
    console.error(`[Exam] Background processing failed for ${examId}:`, error);
  });
}

/**
 * Process past exam: extract questions using Vision LLM
 */
async function processPastExam(examId, fileBuffer, mimeType) {
  console.log(`[Exam Processing] Starting for exam ${examId}`);

  try {
    // Update status to PROCESSING
    await prisma.pastExam.update({
      where: { id: examId },
      data: { status: "PROCESSING" },
    });

    // Step 1: Extract text/images from PDF
    console.log(`[Exam Processing] Extracting content from file`);
    const { text: extractedText, numPages } = await extractPdfContent(fileBuffer, mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No extractable content found in exam PDF");
    }

    console.log(`[Exam Processing] Extracted text from ${numPages} pages (${extractedText.length} chars)`);

    // Step 2: Use Vision LLM to structure questions
    console.log(`[Exam Processing] Extracting questions using Vision LLM`);
    const questions = await extractQuestionsWithLLM(extractedText);

    console.log(`[Exam Processing] Extracted ${questions.length} questions`);

    // Step 3: Save questions to database
    for (const q of questions) {
      await prisma.pastExamChunk.create({
        data: {
          pastExamId: examId,
          topic: q.topic,
          question: q.question,
          questionType: q.questionType,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: q.marks || null,
          status: "EXTRACTED",
        },
      });
    }

    // Step 4: Mark exam as NEEDS_REVIEW
    await prisma.pastExam.update({
      where: { id: examId },
      data: {
        status: "NEEDS_REVIEW",
        processingError: null,
      },
    });

    console.log(`[Exam Processing] ✓ Exam ${examId} processing complete - ${questions.length} questions extracted`);

    return {
      success: true,
      questionsExtracted: questions.length,
      pages: numPages,
    };
  } catch (error) {
    console.error(`[Exam Processing] ✗ Failed for exam ${examId}:`, error);

    // Mark as FAILED
    await prisma.pastExam.update({
      where: { id: examId },
      data: {
        status: "FAILED",
        processingError: error.message,
      },
    });

    throw error;
  }
}

/**
 * Extract content from PDF or Image
 */
async function extractPdfContent(fileBuffer, mimeType) {
  try {
    // Detect if it's an image or PDF
    const isImage = mimeType && mimeType.startsWith("image/");
    
    if (isImage) {
      console.log(`[Exam Processing] Detected image file (${mimeType}), using Gemini Vision OCR`);
      // Use Gemini Vision for image OCR
      const { text, numPages } = await extractTextFromImage(fileBuffer, mimeType);
      return { text, numPages };
    } else {
      console.log(`[Exam Processing] Detected PDF file, using pdfjs-dist extraction`);
      // Convert Buffer to Uint8Array for pdfjs-dist
      const uint8Array = new Uint8Array(fileBuffer);
      const { text, numPages } = await extractTextFromPDF(uint8Array);
      return { text, numPages };
    }
  } catch (error) {
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}

/**
 * Extract and structure questions using Gemini Vision LLM
 */
const questionExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          questionType: { type: Type.STRING, enum: ["TRUE_FALSE", "MULTIPLE_CHOICE", "SHORT_ANSWER", "ESSAY"] },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          topic: { type: Type.STRING },
          marks: { type: Type.NUMBER },
        },
        required: ["question", "questionType", "correctAnswer"],
      },
    },
  },
  required: ["questions"],
};

async function extractQuestionsWithLLM(examText) {
  const prompt = `You are an expert exam processor. Extract and structure all questions from the exam text below.

EXAM TEXT:
"""
${examText}
"""

For each question:
1. Identify the question type (TRUE_FALSE, MULTIPLE_CHOICE, SHORT_ANSWER, ESSAY)
2. Extract the question text
3. For MCQ/TF: extract all options
4. Identify the correct answer
5. If available, extract marks/score
6. Infer the topic area
7. Provide a detailed explanation of the correct answer

Return as JSON with this structure:
{
  "questions": [
    {
      "question": "Question text here",
      "questionType": "MULTIPLE_CHOICE",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation...",
      "topic": "Topic name",
      "marks": 5
    }
  ]
}`;

  try {
    const result = await generateStructured({
      prompt,
      schema: questionExtractionSchema,
      model: "gemini-3.5-flash",
    });

    return result.data.questions || [];
  } catch (error) {
    console.error("[Exam] Question extraction failed:", error);
    throw new Error(`Failed to extract questions: ${error.message}`);
  }
}

/**
 * Get exam with all questions (for admin review)
 */
export async function getExamForReview(examId) {
  const exam = await prisma.pastExam.findUnique({
    where: { id: examId },
    include: {
      chunks: {
        orderBy: { createdAt: "asc" },
      },
      curriculumCourse: {
        include: { course: true },
      },
    },
  });

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  const typeOrder = {
    "TRUE_FALSE": 1,
    "MULTIPLE_CHOICE": 2,
    "MATCHING": 3,
    "SHORT_ANSWER": 4,
    "ESSAY": 5
  };

  exam.chunks.sort((a, b) => {
    const orderA = typeOrder[a.questionType] || 100;
    const orderB = typeOrder[b.questionType] || 100;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return exam;
}

/**
 * Update question during admin review
 */
export async function updateQuestion(questionId, updates) {
  const question = await prisma.pastExamChunk.update({
    where: { id: questionId },
    data: {
      topic: updates.topic || undefined,
      question: updates.question || undefined,
      questionType: updates.questionType || undefined,
      options: updates.options || undefined,
      correctAnswer: updates.correctAnswer || undefined,
      explanation: updates.explanation || undefined,
      marks: updates.marks || undefined,
      status: updates.status || undefined,
    },
  });

  return question;
}

/**
 * Mark entire exam as READY after admin review
 */
export async function finalizeExam(examId) {
  // Update all questions that are not REJECTED to VERIFIED
  await prisma.pastExamChunk.updateMany({
    where: {
      pastExamId: examId,
      status: {
        in: ["EXTRACTED", "NEEDS_REVIEW"],
      },
    },
    data: {
      status: "VERIFIED",
    },
  });

  const exam = await prisma.pastExam.update({
    where: { id: examId },
    data: { status: "READY" },
    include: {
      chunks: {
        orderBy: { createdAt: "asc" },
      },
      curriculumCourse: {
        include: { course: true },
      },
    },
  });

  const typeOrder = {
    "TRUE_FALSE": 1,
    "MULTIPLE_CHOICE": 2,
    "MATCHING": 3,
    "SHORT_ANSWER": 4,
    "ESSAY": 5
  };

  exam.chunks.sort((a, b) => {
    const orderA = typeOrder[a.questionType] || 100;
    const orderB = typeOrder[b.questionType] || 100;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  console.log(`[Exam] Exam ${examId} marked as READY and questions marked as VERIFIED`);

  return exam;
}

/**
 * Get verified questions for student practice
 */
export async function getStudentPracticeQuestions(curriculumCourseId, filters = {}) {
  const questions = await prisma.pastExamChunk.findMany({
    where: {
      pastExam: {
        curriculumCourseId,
        status: "READY",
      },
      status: "VERIFIED",
      topic: filters.topic || undefined,
      questionType: filters.questionType || undefined,
    },
    include: {
      pastExam: {
        select: { year: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 50,
  });

  const typeOrder = {
    "TRUE_FALSE": 1,
    "MULTIPLE_CHOICE": 2,
    "MATCHING": 3,
    "SHORT_ANSWER": 4,
    "ESSAY": 5
  };

  return questions.sort((a, b) => {
    const orderA = typeOrder[a.questionType] || 100;
    const orderB = typeOrder[b.questionType] || 100;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/**
 * Evaluate student answer
 */
export async function evaluateAnswer(questionId, studentAnswer) {
  const question = await prisma.pastExamChunk.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  // Basic evaluation (exact match, case-insensitive)
  const isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    marks: isCorrect ? question.marks || 0 : 0,
    maxMarks: question.marks || 0,
  };
}
