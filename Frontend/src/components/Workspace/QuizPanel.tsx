import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, History, Play } from "lucide-react";
import { generateQuiz, submitQuizAttempt, getQuizHistory } from "../../api/quizApi";
import type { Quiz, QuizQuestion, QuizAttempt } from "../../api/quizApi";

interface QuizPanelProps {
  materialId: string;
}

export default function QuizPanel({ materialId }: QuizPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"practice" | "history">("practice");

  // Generator Config States
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Play States
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result States
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<QuizAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history when tab changes to history
  useEffect(() => {
    if (activeSubTab === "history") {
      loadHistory();
    }
  }, [activeSubTab, materialId]);

  async function loadHistory() {
    try {
      setIsLoadingHistory(true);
      const data = await getQuizHistory(materialId);
      setHistoryList(data);
    } catch (err: any) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentQuiz(null);
    setLastAttempt(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const quiz = await generateQuiz(materialId, difficulty, questionCount);
      setCurrentQuiz(quiz);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuiz) return;
    setIsSubmitting(true);
    try {
      const attempt = await submitQuizAttempt(currentQuiz.id, answers);
      setLastAttempt(attempt);
      // Reload history silently
      loadHistory();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectOption = (questionId: string, option: string) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleNext = () => {
    if (currentQuiz && currentIndex < currentQuiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const startNewQuiz = () => {
    setCurrentQuiz(null);
    setLastAttempt(null);
    setAnswers({});
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col h-full min-h-[350px]">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-[#DCD2B4]/40 pb-3 mb-4 shrink-0">
        <button
          onClick={() => setActiveSubTab("practice")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === "practice"
              ? "bg-[#253D31] text-[#FFFDF7]"
              : "text-[#5B6156] hover:bg-[#F3EFE0]/60"
          }`}
        >
          <Play size={13} />
          Practice
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            activeSubTab === "history"
              ? "bg-[#253D31] text-[#FFFDF7]"
              : "text-[#5B6156] hover:bg-[#F3EFE0]/60"
          }`}
        >
          <History size={13} />
          Quiz History
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {activeSubTab === "practice" ? (
          <>
            {/* Loading Mode */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <Loader2 size={36} className="animate-spin text-[#253D31] mb-4" />
                <h4 className="text-sm font-semibold text-[#253D31] mb-1">Generating Quiz</h4>
                <p className="text-xs text-[#5B6156]">
                  Reading course material and preparing questions...
                </p>
              </div>
            )}

            {/* Error Mode */}
            {!isLoading && error && (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
                <button
                  onClick={startNewQuiz}
                  className="px-4 py-2 bg-[#253D31] text-[#FFFDF7] text-xs font-semibold rounded-lg hover:bg-[#1C3026] transition cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            )}

            {/* Setup Mode */}
            {!isLoading && !error && !currentQuiz && !lastAttempt && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#253D31] mb-3">Select Difficulty</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          difficulty === diff
                            ? "border-[#253D31] bg-[#253D31]/5 text-[#253D31]"
                            : "border-[#DCD2B4] hover:bg-[#F3EFE0]/40 text-[#5B6156]"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#253D31] mb-3">Number of Questions</h3>
                  <div className="flex gap-2">
                    {[5, 10, 15].map((count) => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          questionCount === count
                            ? "border-[#253D31] bg-[#253D31]/5 text-[#253D31]"
                            : "border-[#DCD2B4] hover:bg-[#F3EFE0]/40 text-[#5B6156]"
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-3 bg-[#253D31] hover:bg-[#1C3026] text-[#FFFDF7] rounded-xl font-semibold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Play size={14} fill="currentColor" />
                  Generate Practice Quiz
                </button>
              </div>
            )}

            {/* Question Playing Mode */}
            {!isLoading && !error && currentQuiz && !lastAttempt && (
              <div className="flex flex-col flex-1">
                {/* Header Progress */}
                <div className="pb-3 mb-4 border-b border-[#DCD2B4]/40 shrink-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold text-[#5B6156]">
                      Question {currentIndex + 1} of {currentQuiz.questions.length}
                    </span>
                    <span className="text-[11px] font-mono text-[#5B6156]">
                      {Math.round(((currentIndex + 1) / currentQuiz.questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F3EFE0] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#253D31] h-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Body */}
                <div className="flex-1 space-y-4">
                  <h4 className="text-sm font-semibold text-[#253D31] leading-relaxed">
                    {currentQuiz.questions[currentIndex].question}
                  </h4>

                  {/* Input options by type */}
                  {currentQuiz.questions[currentIndex].questionType === "TRUE_FALSE" && (
                    <div className="flex gap-2 pt-2">
                      {["True", "False"].map((opt) => {
                        const isSelected = answers[currentQuiz.questions[currentIndex].id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => selectOption(currentQuiz.questions[currentIndex].id, opt)}
                            className={`flex-1 py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? "bg-[#253D31] border-[#253D31] text-[#FFFDF7]"
                                : "border-[#DCD2B4] hover:bg-[#F3EFE0]/40 text-[#5B6156] bg-white"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentQuiz.questions[currentIndex].questionType === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2 pt-2">
                      {currentQuiz.questions[currentIndex].choices?.map((opt, idx) => {
                        const isSelected = answers[currentQuiz.questions[currentIndex].id] === opt;
                        return (
                          <button
                            key={idx}
                            onClick={() => selectOption(currentQuiz.questions[currentIndex].id, opt)}
                            className={`w-full px-4 py-3 rounded-xl border text-xs text-left font-semibold transition flex items-start gap-2.5 cursor-pointer ${
                              isSelected
                                ? "border-[#253D31] bg-[#253D31]/5 text-[#253D31]"
                                : "border-[#DCD2B4] hover:border-[#253D31]/40 text-[#5B6156] bg-white"
                            }`}
                          >
                            <span className="font-mono text-[10px] bg-[#F3EFE0] text-[#5B6156] px-1.5 py-0.5 rounded uppercase shrink-0">
                              {String.fromCharCode(97 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentQuiz.questions[currentIndex].questionType === "SHORT_ANSWER" && (
                    <div className="pt-2">
                      <textarea
                        rows={3}
                        placeholder="Type your answer here..."
                        value={answers[currentQuiz.questions[currentIndex].id] || ""}
                        onChange={(e) => selectOption(currentQuiz.questions[currentIndex].id, e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DCD2B4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#253D31] bg-white text-[#253D31] resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-[#DCD2B4]/40 mt-4 shrink-0">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 border border-[#DCD2B4] rounded-lg text-[#5B6156] hover:bg-[#F3EFE0]/40 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center justify-center"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {currentIndex === currentQuiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#253D31] hover:bg-[#1C3026] text-[#FFFDF7] font-semibold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Quiz"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="p-2 border border-[#DCD2B4] rounded-lg text-[#5B6156] hover:bg-[#F3EFE0]/40 cursor-pointer flex items-center justify-center"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Results Review Mode */}
            {lastAttempt && (
              <div className="space-y-6">
                <div className="bg-[#253D31]/5 border border-[#253D31]/20 rounded-2xl p-6 text-center">
                  <span className="text-[32px] font-bold text-[#253D31] block mb-1">
                    {Math.round(lastAttempt.score)}%
                  </span>
                  <span className="text-xs text-[#5B6156] font-semibold uppercase tracking-wider block">
                    Your Performance Score
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#253D31]">Review Answers</h4>
                  <div className="space-y-3">
                    {lastAttempt.answers.map((answer, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex gap-3 ${
                          answer.isCorrect
                            ? "bg-green-50/50 border-green-200"
                            : "bg-red-50/50 border-red-200"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {answer.isCorrect ? (
                            <CheckCircle2 size={18} className="text-green-600" />
                          ) : (
                            <XCircle size={18} className="text-red-600" />
                          )}
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p className="font-semibold text-[#253D31]">
                            Q{idx + 1}: {answer.question}
                          </p>
                          <p className="text-[#5B6156]">
                            <span className="font-medium text-[#253D31]">Your Answer:</span>{" "}
                            {answer.studentAnswer || <span className="italic opacity-60">Not answered</span>}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-green-700">
                              <span className="font-medium">Correct Answer:</span> {answer.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startNewQuiz}
                  className="w-full py-3 bg-[#253D31] hover:bg-[#1C3026] text-[#FFFDF7] rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Practice Again
                </button>
              </div>
            )}
          </>
        ) : (
          /* History View Mode */
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 size={24} className="animate-spin text-[#253D31]" />
              </div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-12 text-[#5B6156]">
                <p className="text-xs">No previous quiz attempts found.</p>
                <p className="text-[10px] opacity-70 mt-1">Start practicing to track your scores!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historyList.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-3 border border-[#DCD2B4]/60 bg-white rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-[#253D31] uppercase tracking-wider bg-[#F3EFE0] px-1.5 py-0.5 rounded">
                        {attempt.quiz?.difficulty}
                      </span>
                      <span className="text-[10px] text-[#5B6156] block mt-1">
                        {new Date(attempt.takenAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${
                        attempt.score >= 80
                          ? "text-green-600"
                          : attempt.score >= 50
                          ? "text-[#5B6156]"
                          : "text-red-600"
                      }`}>
                        {Math.round(attempt.score)}%
                      </span>
                      <button
                        onClick={() => {
                          setLastAttempt(attempt);
                          setActiveSubTab("practice");
                        }}
                        className="px-2 py-1 bg-[#F3EFE0] hover:bg-[#DCD2B4]/40 rounded text-[10px] font-semibold text-[#253D31] transition cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
