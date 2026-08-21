import { api } from "./client";

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  questionType: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  correctAnswer: string;
  choices: string[] | null;
}

export interface Quiz {
  id: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  curriculumCourseId: string;
  materialId: string | null;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptAnswer {
  questionId: string;
  question: string;
  questionType: "TRUE_FALSE" | "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  choices: string[] | null;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  answers: QuizAttemptAnswer[];
  takenAt: string;
  quiz?: {
    difficulty: "EASY" | "MEDIUM" | "HARD";
    createdAt: string;
  };
}

/**
 * Generate a new quiz from material
 */
export async function generateQuiz(
  materialId: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  count?: number
): Promise<Quiz> {
  const res = await api.post<{ success: boolean; data: Quiz }>(
    "/student/quizzes/generate",
    { materialId, difficulty, count }
  );
  
  const quiz = res.data.data;
  if (quiz.questions) {
    quiz.questions = quiz.questions.map((q) => {
      let choicesVal = q.choices;
      if (typeof q.choices === "string") {
        try {
          choicesVal = JSON.parse(q.choices);
        } catch (err) {}
      }
      return { ...q, choices: choicesVal };
    });
  }
  return quiz;
}

/**
 * Submit answers for a quiz attempt
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
): Promise<QuizAttempt> {
  const res = await api.post<{ success: boolean; data: QuizAttempt }>(
    `/student/quizzes/${quizId}/attempt`,
    { answers }
  );
  
  const attempt = res.data.data;
  if (typeof attempt.answers === "string") {
    try {
      attempt.answers = JSON.parse(attempt.answers);
    } catch (err) {}
  }
  return attempt;
}

/**
 * Retrieve past attempts of quizzes for a material
 */
export async function getQuizHistory(materialId: string): Promise<QuizAttempt[]> {
  const res = await api.get<{ success: boolean; data: QuizAttempt[] }>(
    `/student/quizzes/history/${materialId}`
  );
  
  return res.data.data.map((attempt) => {
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
