import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { getPracticeQuestions, evaluateAnswer } from "../api/examApi";
import type { Question } from "../api/examApi";

export default function ExamPracticePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answer tracking
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [evaluated, setEvaluated] = useState<{ [key: string]: any }>({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load questions
  useEffect(() => {
    if (!courseId) return;

    async function loadQuestions() {
      try {
        setIsLoading(true);
        const data = await getPracticeQuestions(courseId);
        setQuestions(data);
        if (data.length === 0) {
          setError("No practice questions available for this course");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load questions");
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestions();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <p className="text-slate-600 text-lg">{error || "No questions available"}</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-slate-900">Exam Practice</h1>
            <p className="text-slate-600">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Question Text */}
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Metadata */}
          <div className="mb-6 pb-6 border-b border-slate-200 text-sm text-slate-600">
            {currentQuestion.topic && (
              <p className="mb-2">
                <span className="font-semibold">Topic:</span> {currentQuestion.topic}
              </p>
            )}
            {currentQuestion.marks && (
              <p>
                <span className="font-semibold">Marks:</span> {currentQuestion.marks}
              </p>
            )}
          </div>

          {/* Answer Input based on Question Type */}
          {currentQuestion.questionType === "TRUE_FALSE" ? (
            <div className="flex gap-4 mb-6">
              {["True", "False"].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: option,
                    })
                  }
                  disabled={isAnswered}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                    answers[currentQuestion.id] === option
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  } ${isAnswered ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : currentQuestion.questionType === "MULTIPLE_CHOICE" ? (
            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: option,
                    })
                  }
                  disabled={isAnswered}
                  className={`w-full px-6 py-3 rounded-lg text-left font-semibold transition border-2 ${
                    answers[currentQuestion.id] === option
                      ? "border-blue-600 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                  } ${isAnswered ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion.id]: e.target.value,
                })
              }
              disabled={isAnswered}
              placeholder="Enter your answer here..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 disabled:opacity-75"
              rows={4}
            />
          )}

          {/* Result Feedback */}
          {isAnswered && evaluated[currentQuestion.id] && (
            <div
              className={`p-6 rounded-lg mb-6 ${
                evaluated[currentQuestion.id].isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {evaluated[currentQuestion.id].isCorrect ? (
                  <CheckCircle2 size={24} className="text-green-600" />
                ) : (
                  <XCircle size={24} className="text-red-600" />
                )}
                <p
                  className={`text-lg font-semibold ${
                    evaluated[currentQuestion.id].isCorrect
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {evaluated[currentQuestion.id].isCorrect ? "Correct!" : "Incorrect"}
                </p>
              </div>

              {!evaluated[currentQuestion.id].isCorrect && (
                <p className="text-sm mb-3">
                  <span className="font-semibold">Correct Answer:</span>{" "}
                  {evaluated[currentQuestion.id].correctAnswer}
                </p>
              )}

              {evaluated[currentQuestion.id].explanation && (
                <div className="text-sm">
                  <p className="font-semibold mb-2">Explanation:</p>
                  <p>{evaluated[currentQuestion.id].explanation}</p>
                </div>
              )}

              <div className="mt-4 text-sm font-semibold">
                Score: {evaluated[currentQuestion.id].marks} /{" "}
                {evaluated[currentQuestion.id].maxMarks}
              </div>
            </div>
          )}

          {/* Submit/Next Button */}
          <div className="flex gap-4">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !answers[currentQuestion.id]}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
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
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIndex === questions.length - 1 ? "Quiz Complete" : "Next Question"}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentIndex === questions.length - 1}
            className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
