import { useState, useEffect } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, Edit2, Save, X, ChevronDown } from "lucide-react";
import { uploadPastExam, getExamForReview, updateQuestion, finalizeExam, getCurriculaByDepartment, getCurriculumCourses } from "../api/examApi";
import type { Exam, Question, Curriculum, CurriculumCourseItem } from "../api/examApi";
import { getUniversities, getDepartments } from "../api/onboardingapi";
import type { University, Department } from "../api/onboardingapi";

const SELECT_CLS = "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed appearance-none";

function SelectField({
  label, id, value, onChange, disabled, loading, error, children,
}: {
  label: string; id: string; value: string;
  onChange: (v: string) => void; disabled?: boolean;
  loading?: boolean; error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className={SELECT_CLS}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {loading
            ? <Loader2 size={16} className="animate-spin text-slate-400" />
            : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminExamDashboard() {
  const [activeTab, setActiveTab] = useState<"upload" | "review">("upload");

  // ─── Selector state ───────────────────────────────────────────────────────
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [allCourses, setAllCourses] = useState<CurriculumCourseItem[]>([]);

  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [curriculumCourseId, setCurriculumCourseId] = useState("");

  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingCurricula, setLoadingCurricula] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [deptError, setDeptError] = useState<string | null>(null);
  const [curriculaError, setCurriculaError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // ─── Upload state ─────────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [examYear, setExamYear] = useState("");
  const [examType, setExamType] = useState<"MID" | "FINAL">("MID");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ─── Review state ─────────────────────────────────────────────────────────
  const [exam, setExam] = useState<Exam | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Question>>({});
  const [isSaving, setIsSaving] = useState(false);

  // ─── Derived selections ───────────────────────────────────────────────────
  const availableYears = [...new Set(allCourses.map((c) => c.year))].sort();
  const availableSemesters = [...new Set(
    allCourses.filter((c) => c.year === Number(selectedYear)).map((c) => c.semester)
  )].sort();
  const filteredCourses = allCourses.filter(
    (c) => c.year === Number(selectedYear) && c.semester === Number(selectedSemester)
  );

  // ─── Load universities on mount ───────────────────────────────────────────
  useEffect(() => {
    getUniversities().then(setUniversities).catch(() => {});
  }, []);

  // ─── Load departments when university changes ─────────────────────────────
  useEffect(() => {
    if (!selectedUniversityId) return;
    setLoadingDepts(true);
    setDeptError(null);
    setDepartments([]);
    getDepartments(selectedUniversityId)
      .then(setDepartments)
      .catch(() => setDeptError("Failed to load departments. Please try again."))
      .finally(() => setLoadingDepts(false));
  }, [selectedUniversityId]);

  // ─── Load curricula when department changes ───────────────────────────────
  useEffect(() => {
    if (!selectedDepartmentId) return;
    setLoadingCurricula(true);
    setCurriculaError(null);
    setCurricula([]);
    getCurriculaByDepartment(selectedDepartmentId)
      .then(setCurricula)
      .catch(() => setCurriculaError("Failed to load curricula. Please try again."))
      .finally(() => setLoadingCurricula(false));
  }, [selectedDepartmentId]);

  // ─── Load courses when curriculum changes ─────────────────────────────────
  useEffect(() => {
    if (!selectedCurriculumId) return;
    setLoadingCourses(true);
    setCoursesError(null);
    setAllCourses([]);
    getCurriculumCourses(selectedCurriculumId)
      .then(setAllCourses)
      .catch(() => setCoursesError("Failed to load courses. Please try again."))
      .finally(() => setLoadingCourses(false));
  }, [selectedCurriculumId]);

  // ─── Cascade clear helpers ────────────────────────────────────────────────
  const handleUniversityChange = (id: string) => {
    setSelectedUniversityId(id);
    setSelectedDepartmentId(""); setDepartments([]);
    setSelectedCurriculumId(""); setCurricula([]);
    setSelectedYear(""); setSelectedSemester("");
    setAllCourses([]); setCurriculumCourseId("");
  };
  const handleDepartmentChange = (id: string) => {
    setSelectedDepartmentId(id);
    setSelectedCurriculumId(""); setCurricula([]);
    setSelectedYear(""); setSelectedSemester("");
    setAllCourses([]); setCurriculumCourseId("");
  };
  const handleCurriculumChange = (id: string) => {
    setSelectedCurriculumId(id);
    setSelectedYear(""); setSelectedSemester("");
    setCurriculumCourseId("");
  };
  const handleYearChange = (y: string) => {
    setSelectedYear(y); setSelectedSemester(""); setCurriculumCourseId("");
  };
  const handleSemesterChange = (s: string) => {
    setSelectedSemester(s); setCurriculumCourseId("");
  };

  // ─── Upload handler ───────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!file || !examYear || !curriculumCourseId) {
      setUploadError("Please complete all fields and select a file before uploading.");
      return;
    }
    setIsUploading(true);
    try {
      await uploadPastExam(file, curriculumCourseId, parseInt(examYear), examType);
      setUploadSuccess(true);
      setFile(null);
      setExamYear("");
      setCurriculumCourseId("");
      setSelectedYear(""); setSelectedSemester("");
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Review handlers ──────────────────────────────────────────────────────
  const handleLoadExam = async (examId: string) => {
    try {
      const loadedExam = await getExamForReview(examId);
      setExam(loadedExam);
    } catch (err: any) {
      alert(`Failed to load exam: ${err.message}`);
    }
  };
  const startEdit = (question: Question) => {
    setEditingQuestion(question.id);
    setEditValues({ ...question });
  };
  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    setIsSaving(true);
    try {
      await updateQuestion(editingQuestion, editValues);
      if (exam) {
        setExam({ ...exam, chunks: exam.chunks.map((q) => q.id === editingQuestion ? { ...q, ...editValues } : q) });
      }
      setEditingQuestion(null);
      setEditValues({});
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  const handleUpdateStatus = async (questionId: string, status: "VERIFIED" | "REJECTED") => {
    try {
      await updateQuestion(questionId, { status });
      if (exam) {
        setExam({ ...exam, chunks: exam.chunks.map((q) => q.id === questionId ? { ...q, status } : q) });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };
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

  const canSubmit = !!file && !!examYear && !!curriculumCourseId && !isUploading;

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
            <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Past Exam</h2>
            <form onSubmit={handleUpload} className="space-y-5">

              {/* File Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Exam File</label>
                <label className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:bg-blue-50 transition cursor-pointer block">
                  <Upload className="mx-auto mb-3 text-blue-500" size={40} />
                  <span className="text-base font-semibold text-blue-600 block">
                    {file ? file.name : "Click to upload PDF or image"}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">PDF or image, max 50 MB</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* University */}
              <SelectField label="University" id="university" value={selectedUniversityId} onChange={handleUniversityChange}>
                <option value="">Select a university…</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </SelectField>

              {/* Department */}
              <SelectField
                label="Department" id="department" value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                disabled={!selectedUniversityId}
                loading={loadingDepts} error={deptError}
              >
                <option value="">{!selectedUniversityId ? "Select a university first" : "Select a department…"}</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </SelectField>

              {/* Curriculum */}
              <SelectField
                label="Curriculum" id="curriculum" value={selectedCurriculumId}
                onChange={handleCurriculumChange}
                disabled={!selectedDepartmentId}
                loading={loadingCurricula} error={curriculaError}
              >
                <option value="">{!selectedDepartmentId ? "Select a department first" : "Select a curriculum…"}</option>
                {curricula.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </SelectField>

              {/* Year & Semester row */}
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Year" id="year" value={selectedYear}
                  onChange={handleYearChange}
                  disabled={!selectedCurriculumId || loadingCourses}
                  loading={loadingCourses} error={coursesError}
                >
                  <option value="">{!selectedCurriculumId ? "Select a curriculum first" : "Select year…"}</option>
                  {availableYears.map((y) => <option key={y} value={String(y)}>{y === 1 ? "1st Year" : y === 2 ? "2nd Year" : y === 3 ? "3rd Year" : `${y}th Year`}</option>)}
                </SelectField>

                <SelectField
                  label="Semester" id="semester" value={selectedSemester}
                  onChange={handleSemesterChange}
                  disabled={!selectedYear}
                >
                  <option value="">{!selectedYear ? "Select a year first" : "Select semester…"}</option>
                  {availableSemesters.map((s) => <option key={s} value={String(s)}>Semester {s}</option>)}
                </SelectField>
              </div>

              {/* Course */}
              <SelectField
                label="Course" id="course" value={curriculumCourseId}
                onChange={setCurriculumCourseId}
                disabled={!selectedSemester || filteredCourses.length === 0}
              >
                <option value="">{!selectedSemester ? "Select year & semester first" : "Select a course…"}</option>
                {filteredCourses.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.course.title} — {cc.courseCode}
                  </option>
                ))}
              </SelectField>

              {/* Exam Type & Exam Year row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="examType" className="text-sm font-semibold text-slate-700">Exam Type</label>
                  <div className="relative">
                    <select
                      id="examType"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as "MID" | "FINAL")}
                      className={SELECT_CLS}
                    >
                      <option value="MID">Mid-term Exam</option>
                      <option value="FINAL">Final Exam</option>
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="examYear" className="text-sm font-semibold text-slate-700">Exam Year</label>
                  <input
                    id="examYear"
                    type="number"
                    placeholder="e.g. 2024"
                    min={2000}
                    max={2100}
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Error */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {uploadError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {isUploading ? (
                  <><Loader2 size={20} className="animate-spin" />Uploading…</>
                ) : (
                  <><Upload size={20} />Upload Exam</>
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
