import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { generateStructured } from "../../lib/geminiClient.js";
import { Type } from "@google/genai";

const quizGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          questionType: { 
            type: Type.STRING, 
            enum: ["TRUE_FALSE", "MULTIPLE_CHOICE", "SHORT_ANSWER"] 
          },
          choices: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          correctAnswer: { type: Type.STRING },
        },
        required: ["question", "questionType", "correctAnswer"],
      },
    },
  },
  required: ["questions"],
};

/**
 * Generate a personalized, material-grounded quiz
 */
export async function generateQuizFromMaterial(materialId, difficulty, count = 5, studentId) {
  console.log(`[Quiz Service] Generating quiz for material: ${materialId}`);

  // Fetch course material
  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    throw new AppError("Material not found", 404);
  }

  // Get material text basis
  let contentBasis = material.summary;
  if (!contentBasis) {
    const chunks = await prisma.materialChunk.findMany({
      where: { materialId },
      orderBy: { chunkIndex: "asc" },
      take: 40,
    });

    if (chunks.length === 0) {
      throw new AppError("This material has no content to generate a quiz from", 400);
    }

    contentBasis = chunks.map((c) => c.content).join("\n\n");
  }

  // Limit content length for safety
  const MAX_CHARS = 40000;
  if (contentBasis.length > MAX_CHARS) {
    contentBasis = contentBasis.substring(0, MAX_CHARS);
  }

  const prompt = `You are an expert academic evaluator. Generate a quiz of difficulty "${difficulty}" containing exactly ${count} questions based strictly on the course material below.
  
COURSE MATERIAL:
"""
${contentBasis}
"""

Instructions:
1. All questions must be strictly grounded in the COURSE MATERIAL. Do not ask questions about concepts not mentioned in the material.
2. Produce a mix of question types (TRUE_FALSE, MULTIPLE_CHOICE, SHORT_ANSWER).
3. For MULTIPLE_CHOICE, provide 4 plausible choices.
4. For TRUE_FALSE, provide exactly ["True", "False"] as choices.
5. For SHORT_ANSWER, set choices to null or an empty array.
6. Provide clear, direct correct answers.

Return the result as JSON matching the schema.`;

  try {
    const result = await generateStructured({
      prompt,
      schema: quizGenerationSchema,
      model: "gemini-3.5-flash",
      temperature: 0.5,
    });

    const questionsData = result.data.questions || [];

    // Sort questions by type: TRUE_FALSE first, then MULTIPLE_CHOICE, then SHORT_ANSWER
    const typeOrder = {
      "TRUE_FALSE": 1,
      "MULTIPLE_CHOICE": 2,
      "SHORT_ANSWER": 3,
    };

    questionsData.sort((a, b) => {
      const orderA = typeOrder[a.questionType] || 100;
      const orderB = typeOrder[b.questionType] || 100;
      return orderA - orderB;
    });

    // Write to database in a transaction
    const quiz = await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          difficulty,
          curriculumCourseId: material.curriculumCourseId,
          materialId: material.id,
        },
      });

      const createdQuestions = [];
      for (const q of questionsData) {
        // Enforce True/False choices if missing
        let choicesVal = q.choices;
        if (q.questionType === "TRUE_FALSE") {
          choicesVal = ["True", "False"];
        }

        const question = await tx.quizQuestion.create({
          data: {
            quizId: newQuiz.id,
            question: q.question,
            questionType: q.questionType,
            correctAnswer: q.correctAnswer,
            choices: choicesVal ? JSON.stringify(choicesVal) : null,
          },
        });
        createdQuestions.push({
          ...question,
          choices: choicesVal,
        });
      }

      return {
        ...newQuiz,
        questions: createdQuestions,
      };
    });

    return quiz;
  } catch (error) {
    console.error("[Quiz Generation] AI generation failed:", error);
    throw new AppError(`Failed to generate quiz: ${error.message}`, 500);
  }
}

/**
 * Evaluate student answers and save the quiz attempt
 */
export async function evaluateQuizAttempt(quizId, answers, studentId) {
  console.log(`[Quiz Service] Evaluating attempt for quiz: ${quizId}`);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw new AppError("Quiz not found", 404);
  }

  let correctCount = 0;
  const results = quiz.questions.map((q) => {
    const studentAns = answers[q.id] || "";
    const isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    if (isCorrect) correctCount++;

    // Parse choices if stringified json
    let parsedChoices = q.choices;
    if (typeof q.choices === "string") {
      try {
        parsedChoices = JSON.parse(q.choices);
      } catch (err) {}
    }

    return {
      questionId: q.id,
      question: q.question,
      questionType: q.questionType,
      choices: parsedChoices,
      correctAnswer: q.correctAnswer,
      studentAnswer: studentAns,
      isCorrect,
    };
  });

  const score = quiz.questions.length > 0 ? (correctCount / quiz.questions.length) * 100 : 0;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId,
      score,
      answers: JSON.stringify(results),
    },
  });

  return {
    ...attempt,
    answers: results,
  };
}

/**
 * Get past quiz attempts for a course material
 */
export async function getQuizHistory(materialId, studentId) {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId,
      quiz: {
        materialId,
      },
    },
    include: {
      quiz: {
        select: {
          difficulty: true,
          createdAt: true,
        },
      },
    },
    orderBy: { takenAt: "desc" },
  });

  return attempts.map((attempt) => {
    let parsedAnswers = attempt.answers;
    if (typeof attempt.answers === "string") {
      try {
        parsedAnswers = JSON.parse(attempt.answers);
      } catch (err) {}
    }
    return {
      ...attempt,
      answers: parsedAnswers,
    };
  });
}
