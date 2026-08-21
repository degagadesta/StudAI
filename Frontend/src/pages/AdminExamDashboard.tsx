import { useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, Edit2, Save, X } from "lucide-react";
import { uploadPastExam, getExamForReview, updateQuestion, finalizeExam } from "../api/examApi";
import type { Exam, Question } from "../api/examApi";

export default function AdminExamDashboard() {
  const [activeTab, setActiveTab] = useState<"upload" | "review">("upload");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [examYear, setExamYear] = useState("");
  const [examType, setExamType] = useState<"MID" | "FINAL">("MID");
  const [curriculumCourseId, setCurriculumCourseId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Review state
  const [exam, setExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Question>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !examYear || !curriculumCourseId) {
      alert("Please fill all fields");
      return;
    }

    setIsUploading(true);
    try {
      await uploadPastExam(file, curriculumCourseId, parseInt(examYear), examType);
      setUploadSuccess(true);
      setFile(null);
      setExamYear("");
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      alert(`Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Load exam for review
  const handleLoadExam = async (examId: string) => {
    try {
      const loadedExam = await getExamForReview(examId);
      setExam(loadedExam);
    } catch (err: any) {
      alert(`Failed to load exam: ${err.message}`);
    }
  };

  // Edit question
  const startEdit = (question: Question) => {
    setEditingQuestion(question.id);
    setEditValues({ ...question });
  };

  // Save question
  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;

    setIsSaving(true);
    try {
      await updateQuestion(editingQuestion, editValues);
      
      if (exam) {
        setExam({
          ...exam,
          chunks: exam.chunks.map((q) =>
            q.id === editingQuestion ? { ...q, ...editValues } : q
          ),
        });
      }
      
      setEditingQuestion(null);
      setEditValues({});
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update question status directly (Approve/Reject)
  const handleUpdateStatus = async (questionId: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await updateQuestion(questionId, { status });
      if (exam) {
        setExam({
          ...exam,
          chunks: exam.chunks.map((q) =>
            q.id === questionId ? { ...q, status } : q
          ),
        });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Finalize exam
  const handleFinalizeExam = async () => {
    if (!exam) return;

    if (!window.confirm("Mark this exam as READY for students?")) return;

    try {
      const finalizedExam = await finalizeExam(exam.id);
      setExam(finalizedExam);
      alert("Exam finalized successfully!");
    } catch (err: any) {
      alert(`Finalization failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Admin Exam Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "upload"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            Upload Exam
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "review"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            Review Questions
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Upload */}
              <label className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:bg-blue-50 transition cursor-pointer block">
                <Upload className="mx-auto mb-4 text-blue-600" size={48} />
                <span className="text-lg font-semibold text-blue-600 block">
                  Click to upload PDF or image
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {file && (
                  <p className="text-sm text-slate-600 mt-2">Selected: {file.name}</p>
                )}
              </label>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Curriculum Course ID"
                  value={curriculumCourseId}
                  onChange={(e) => setCurriculumCourseId(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Exam Year (e.g., 2024)"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Exam Type */}
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as "MID" | "FINAL")}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MID">Mid-term Exam</option>
                <option value="FINAL">Final Exam</option>
              </select>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Exam
                  </>
                )}
              </button>

              {uploadSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={20} />
                  Exam uploaded successfully! Processing has started.
                </div>
              )}
            </form>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === "review" && (
          <div className="space-y-8">
            {!exam ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-slate-600 mb-4">Load an exam to review questions</p>
                <input
                  type="text"
                  placeholder="Enter Exam ID"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                      handleLoadExam((e.target as HTMLInputElement).value);
                    }
                  }}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md mx-auto block mb-4"
                />
              </div>
            ) : (
              <>
                {/* Exam Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {exam.type} Exam {exam.year}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Status: <span className="font-semibold">{exam.status}</span>
                      </p>
                    </div>
                    {exam.status !== "READY" && (
                      <button
                        onClick={handleFinalizeExam}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                      >
                        Finalize Exam
                      </button>
                    )}
                  </div>
                  {exam.processingError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                      <AlertCircle size={20} />
                      {exam.processingError}
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    Questions ({exam.chunks.length})
                  </h3>
                  {exam.chunks.map((question, idx) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl shadow p-6 border border-slate-200"
                    >
                      {editingQuestion === question.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <textarea
                            value={editValues.question || ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, question: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                          <select
                            value={editValues.questionType || ""}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                questionType: e.target.value as any,
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          >
                            <option>TRUE_FALSE</option>
                            <option>MULTIPLE_CHOICE</option>
                            <option>SHORT_ANSWER</option>
                            <option>ESSAY</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Correct Answer"
                            value={editValues.correctAnswer || ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, correctAnswer: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                          />
                          <textarea
                            value={editValues.explanation || ""}
                            onChange={(e) =>
                              setEditValues({ ...editValues, explanation: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            placeholder="Explanation"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveQuestion}
                              disabled={isSaving}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingQuestion(null)}
                              className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                Q{idx + 1}: {question.question}
                              </p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                question.status === "VERIFIED"
                                  ? "bg-green-100 text-green-800"
                                  : question.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {question.status}
                              </span>
                            </div>
                            <button
                              onClick={() => startEdit(question)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0"
                            >
                              <Edit2 size={18} />
                            </button>
                          </div>
                          <div className="space-y-2 text-sm text-slate-700">
                            <p>
                              <span className="font-semibold">Type:</span>{" "}
                              {question.questionType}
                            </p>
                            {question.options && (
                              <p>
                                <span className="font-semibold">Options:</span>{" "}
                                {question.options.join(", ")}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold">Answer:</span>{" "}
                              {question.correctAnswer}
                            </p>
                            {question.explanation && (
                              <p>
                                <span className="font-semibold">Explanation:</span>{" "}
                                {question.explanation}
                              </p>
                            )}
                            {question.topic && (
                              <p>
                                <span className="font-semibold">Topic:</span>{" "}
                                {question.topic}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => handleUpdateStatus(question.id, "VERIFIED")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                question.status === "VERIFIED"
                                  ? "bg-green-600 text-white"
                                  : "bg-slate-100 text-green-700 hover:bg-green-50 border border-green-200"
                              }`}
                            >
                              <CheckCircle2 size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(question.id, "REJECTED")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                question.status === "REJECTED"
                                  ? "bg-red-600 text-white"
                                  : "bg-slate-100 text-red-700 hover:bg-red-50 border border-red-200"
                              }`}
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
