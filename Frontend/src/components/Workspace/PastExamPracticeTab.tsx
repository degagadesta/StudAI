import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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
        <Loader2 size={32} className="animate-spin text-accent mb-3" />
        <p className="text-sm text-secondary">Loading practice questions...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-secondary mb-2">{error || "No questions available"}</p>
        <p className="text-xs text-muted">
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
    <div className="flex flex-col h-full bg-surface text-primary">
      {/* Progress Header */}
      <div className="pb-3 mb-3 border-b border-default">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-primary">
            Question {currentIndex + 1} of {questions.length}
          </h3>
          <span className="text-xs text-secondary font-mono">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-border/40 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Question Text & Metadata */}
        <div>
          <p className="text-sm font-semibold text-primary mb-2 leading-relaxed">
            {currentQuestion.question}
          </p>
          <div className="flex items-center gap-3 text-xs text-secondary">
            {currentQuestion.topic && (
              <p>
                <span className="font-semibold text-primary">Topic:</span> {currentQuestion.topic}
              </p>
            )}
            {currentQuestion.marks && (
              <p>
                <span className="font-semibold text-primary">Marks:</span> {currentQuestion.marks}
              </p>
            )}
          </div>
        </div>

        {/* Answer Input - Dynamic by Question Type */}
        {!isAnswered && (
          <div className="space-y-3">
            {currentQuestion.questionType === "TRUE_FALSE" && (
              <div className="flex gap-2">
                {["True", "False"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]: option,
                      })
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                      answers[currentQuestion.id] === option
                        ? "bg-accent text-inverse border-accent"
                        : "bg-elevated text-primary border-default hover:bg-surface-hover"
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
                    type="button"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]: option,
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-left font-medium transition-all border cursor-pointer ${
                      answers[currentQuestion.id] === option
                        ? "border-accent bg-accent/15 text-primary font-semibold shadow-sm"
                        : "border-default bg-surface text-primary hover:border-accent/40 hover:bg-surface-hover"
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
                className="w-full px-3 py-2 bg-page border border-default rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-xs text-primary placeholder:text-muted resize-none"
                rows={currentQuestion.questionType === "ESSAY" ? 4 : 2}
              />
            )}
          </div>
        )}

        {/* Result Feedback */}
        {isAnswered && evaluated[currentQuestion.id] && (
          <div
            className={`p-3.5 rounded-xl text-xs ${
              evaluated[currentQuestion.id].isCorrect
                ? "bg-success-bg border border-success/30 text-success"
                : "bg-error-bg border border-error/30 text-error"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {evaluated[currentQuestion.id].isCorrect ? (
                <CheckCircle2 size={16} className="text-success shrink-0" />
              ) : (
                <XCircle size={16} className="text-error shrink-0" />
              )}
              <p
                className={`font-semibold ${
                  evaluated[currentQuestion.id].isCorrect
                    ? "text-success"
                    : "text-error"
                }`}
              >
                {evaluated[currentQuestion.id].isCorrect ? "Correct!" : "Incorrect"}
              </p>
            </div>

            {!evaluated[currentQuestion.id].isCorrect && (
              <p className="mb-2 text-primary">
                <span className="font-semibold">Correct Answer:</span>{" "}
                {evaluated[currentQuestion.id].correctAnswer}
              </p>
            )}

            {evaluated[currentQuestion.id].explanation && (
              <div className="text-primary mt-2">
                <p className="font-semibold mb-1">Explanation:</p>
                <p className="text-secondary leading-relaxed">
                  {evaluated[currentQuestion.id].explanation}
                </p>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-default/50 font-semibold text-primary">
              Score: {evaluated[currentQuestion.id].marks} /{" "}
              {evaluated[currentQuestion.id].maxMarks}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-default mt-4">
        {!isAnswered ? (
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !answers[currentQuestion.id]}
            className="flex-1 px-3 py-2.5 bg-accent text-inverse text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 size={14} className="animate-spin text-inverse" />
                Evaluating...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 px-3 py-2.5 bg-accent text-inverse text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {currentIndex === questions.length - 1 ? "All Done" : "Next Question"}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handlePreviousQuestion}
          disabled={currentIndex === 0}
          className="flex-1 px-3 py-2 bg-elevated text-secondary hover:text-primary hover:bg-surface-hover border border-default text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="flex-1 px-3 py-2 bg-elevated text-secondary hover:text-primary hover:bg-surface-hover border border-default text-xs font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
