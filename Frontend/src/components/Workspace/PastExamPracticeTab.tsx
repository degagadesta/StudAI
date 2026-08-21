import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { getPracticeQuestions, evaluateAnswer } from "../../api/examApi";
import type { Question } from "../../api/examApi";

interface PastExamPracticeTabProps {
  curriculumCourseId: string;
}

export default function PastExamPracticeTab({
  curriculumCourseId,
}: PastExamPracticeTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answer tracking
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [evaluated, setEvaluated] = useState<{ [key: string]: any }>({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load questions on mount or when courseId changes
  useEffect(() => {
    if (!curriculumCourseId) {
      setError("No course selected");
      setIsLoading(false);
      return;
    }

    async function loadQuestions() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPracticeQuestions(curriculumCourseId);
        setQuestions(data);
        if (data.length === 0) {
          setError("No practice questions available for this course yet");
        }
      } catch (err: any) {
        console.error("Failed to load questions:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load practice questions. Try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, [curriculumCourseId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-slate-600">Loading practice questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-slate-600 mb-2">{error || "No questions available"}</p>
        <p className="text-xs text-slate-500">
          Check back later when past exams are available for this course.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isAnswered = currentQuestion.id in evaluated;

  const handleSubmitAnswer = async () => {
    if (!answers[currentQuestion.id]) {
      alert("Please select or enter an answer");
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await evaluateAnswer(
        currentQuestion.id,
        answers[currentQuestion.id]
      );
      setEvaluated({
        ...evaluated,
        [currentQuestion.id]: result,
      });
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="pb-3 mb-3 border-b border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-slate-900">
            Question {currentIndex + 1} of {questions.length}
          </h3>
          <span className="text-xs text-slate-600">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Question Text */}
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {currentQuestion.question}
          </p>
          {currentQuestion.topic && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Topic:</span> {currentQuestion.topic}
            </p>
          )}
          {currentQuestion.marks && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Marks:</span> {currentQuestion.marks}
            </p>
          )}
        </div>

        {/* Answer Input - Dynamic by Question Type */}
        {!isAnswered && (
          <div className="space-y-3">
            {currentQuestion.questionType === "TRUE_FALSE" && (
              <div className="flex gap-2">
                {["True", "False"].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]: option,
                      })
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      answers[currentQuestion.id] === option
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]: option,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg text-xs text-left font-medium transition border-2 ${
                      answers[currentQuestion.id] === option
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {(currentQuestion.questionType === "SHORT_ANSWER" ||
              currentQuestion.questionType === "ESSAY") && (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [currentQuestion.id]: e.target.value,
                  })
                }
                placeholder="Enter your answer here..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
                rows={currentQuestion.questionType === "ESSAY" ? 4 : 2}
              />
            )}
          </div>
        )}

        {/* Result Feedback */}
        {isAnswered && evaluated[currentQuestion.id] && (
          <div
            className={`p-3 rounded-lg text-xs ${
              evaluated[currentQuestion.id].isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {evaluated[currentQuestion.id].isCorrect ? (
                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
              ) : (
                <XCircle size={16} className="text-red-600 flex-shrink-0" />
              )}
              <p
                className={`font-semibold ${
                  evaluated[currentQuestion.id].isCorrect
                    ? "text-green-900"
                    : "text-red-900"
                }`}
              >
                {evaluated[currentQuestion.id].isCorrect ? "Correct!" : "Incorrect"}
              </p>
            </div>

            {!evaluated[currentQuestion.id].isCorrect && (
              <p className="mb-2 text-slate-700">
                <span className="font-semibold">Correct Answer:</span>{" "}
                {evaluated[currentQuestion.id].correctAnswer}
              </p>
            )}

            {evaluated[currentQuestion.id].explanation && (
              <div className="text-slate-700">
                <p className="font-semibold mb-1">Explanation:</p>
                <p className="text-slate-600">
                  {evaluated[currentQuestion.id].explanation}
                </p>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-slate-200 font-semibold text-slate-700">
              Score: {evaluated[currentQuestion.id].marks} /{" "}
              {evaluated[currentQuestion.id].maxMarks}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-slate-200 mt-4">
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !answers[currentQuestion.id]}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {isEvaluating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Evaluating...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex === questions.length - 1 ? "All Done" : "Next Question"}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentIndex === 0}
          className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
