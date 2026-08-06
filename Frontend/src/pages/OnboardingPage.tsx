import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Pin,
  X,
  LayoutGrid,
  MessageCircle,
  Layers,
  BookMarked,
  FileClock,
  type LucideIcon,
} from "lucide-react";
import { stripControlChars, capLength } from "../utils/security/sanitize";
import {
  submitOnboarding,
  getUniversities,
  getDepartments,
  getAvailableCourses,
  type University,
  type Department,
  type Course,
} from "../api/onboardingapi";
import { getApiErrorMessage } from "../api/authApi";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const SUGGESTED_UNIVERSITIES = [
  "Addis Ababa Science and Technology University",
  "Addis Ababa University",
  "Adama Science and Technology University",
];

const YEARS = [1, 2, 3, 4, 5];
const SEMESTERS = [1, 2];
const SEARCH_MAX_LEN = 80;

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

const FEATURES: Feature[] = [
  {
    icon: LayoutGrid,
    title: "Course Management",
    description:
      "Every course, lecture PDF, and note lives in one organized workspace — no more digging through folders before an exam.",
    tag: "Stay organized",
  },
  {
    icon: MessageCircle,
    title: "AI Tutor Chat",
    description:
      "Ask questions about your lecture material and get answers grounded in exactly what your professor taught, not generic web results.",
    tag: "Ask anything",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description:
      "Upload a PDF and StudAI generates flashcards from it automatically — review them in minutes instead of building a deck by hand.",
    tag: "Auto-generated",
  },
  {
    icon: BookMarked,
    title: "Curriculum-Based Explanations",
    description:
      "Explanations are matched to your actual department curriculum, not a one-size-fits-all summary of the topic.",
    tag: "Tailored to you",
  },
  {
    icon: FileClock,
    title: "Previous University Exams",
    description:
      "Browse past exams from your department and see which topics and chapters come up most often, year after year.",
    tag: "Exam intelligence",
  },
];

const SLIDE_INTERVAL_MS = 2000;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data from backend
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  // Selected values
  const [university, setUniversity] = useState<University | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(),
  );

  // UI state
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  // Feature slideshow
  const [activeSlide, setActiveSlide] = useState(0);

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setIsLoading(true);
        const data = await getUniversities();
        setUniversities(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load universities"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch departments when university changes
  useEffect(() => {
    if (!university) {
      setDepartments([]);
      setDepartment(null);
      return;
    }

    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDepartments(university.id);
        setDepartments(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load departments"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, [university]);

  // Fetch courses when year/semester changes
  useEffect(() => {
    if (!university || !department || year === null || semester === null) {
      setAvailableCourses([]);
      setSelectedCourses(new Set());
      return;
    }

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAvailableCourses(
          university.id,
          department.id,
          year,
          semester,
        );
        setAvailableCourses(data);
        // Auto-select all courses by default
        setSelectedCourses(new Set(data.map((c) => c.id)));
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load courses"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [university, department, year, semester]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % FEATURES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number): void => {
    setActiveSlide(index);
  };

  const filteredUniversities = useMemo(() => {
    if (!query.trim()) return universities;
    const q = query.trim().toLowerCase();
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.city && u.city.toLowerCase().includes(q)),
    );
  }, [query, universities]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setQuery(capLength(stripControlChars(e.target.value), SEARCH_MAX_LEN));
  };

  const pinUniversity = (uni: University): void => {
    setUniversity(uni);
    setShowSearch(false);
    setQuery("");
  };

  const changeUniversity = (): void => {
    setUniversity(null);
    setDepartment(null);
    setShowSearch(false);
    setQuery("");
  };

  const toggleCourse = (courseId: string): void => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const canContinueStep1 = university !== null;
  const canContinueStep2 = department !== null;
  const canContinueStep3 = year !== null && semester !== null;
  const canFinish = selectedCourses.size > 0;

  const handleFinish = async (): Promise<void> => {
    if (
      !university ||
      !department ||
      year === null ||
      semester === null ||
      selectedCourses.size === 0
    )
      return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitOnboarding({
        universityId: university.id,
        departmentId: department.id,
        currentYear: year,
        currentSemester: semester,
        selectedCourseIds: Array.from(selectedCourses),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not save your setup. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ActiveIcon = FEATURES[activeSlide].icon;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F6F1E3]">
      {/* Left — cream panel: the onboarding wizard */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md border-l-2 border-[#B08D4F]/50 pl-7">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-[#5B6156]">
              STEP {step} OF 4
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i <= step ? "bg-[#2F4A3D]" : "bg-[#DCD2B4]"
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5 mb-5">
              {error}
            </div>
          )}

          {/* STEP 1 — University */}
          {step === 1 && (
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-4">
                <GraduationCap size={13} className="text-[#2F4A3D]" />
                Academic institution
              </span>
              <h2 className="font-serif text-2xl text-[#253D31] mb-1.5">
                Where do you study?
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">
                We use this to match your department's curriculum and past
                exams.
              </p>

              {university ? (
                <div className="flex items-center justify-between bg-[#FFFDF7] border border-[#8CA37E] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#8CA37E]/20 flex items-center justify-center shrink-0">
                      <Pin size={16} className="text-[#2F4A3D]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#253D31]">
                        {university.name}
                      </p>
                      {university.city && (
                        <p className="text-xs text-[#5B6156]">
                          {university.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={changeUniversity}
                    className="text-xs font-medium text-[#2F4A3D] hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : !showSearch ? (
                <div>
                  {isLoading ? (
                    <p className="text-sm text-[#5B6156] text-center py-8">
                      Loading universities...
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {universities
                          .filter((u) =>
                            SUGGESTED_UNIVERSITIES.includes(u.name),
                          )
                          .slice(0, 3)
                          .map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => pinUniversity(u)}
                              className="flex flex-col items-start gap-1 p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl text-left hover:border-[#8CA37E] transition-colors"
                            >
                              <span className="font-serif text-base text-[#253D31]">
                                {u.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 4)
                                  .toUpperCase()}
                              </span>
                              <span className="text-[11px] text-[#5B6156] leading-tight">
                                {u.name}
                              </span>
                            </button>
                          ))}
                        <button
                          type="button"
                          onClick={() => setShowSearch(true)}
                          className="flex flex-col items-center justify-center gap-1.5 p-4 bg-[#EFE8D4] border border-dashed border-[#B08D4F] rounded-xl hover:bg-[#E9E0C6] transition-colors"
                        >
                          <Search size={16} className="text-[#2F4A3D]" />
                          <span className="text-xs font-medium text-[#2F4A3D]">
                            More
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="relative mb-3">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A9A18A]"
                    />
                    <input
                      type="text"
                      autoFocus
                      value={query}
                      onChange={handleSearchChange}
                      maxLength={SEARCH_MAX_LEN}
                      placeholder="Search your university..."
                      className="w-full pl-10 pr-9 py-3 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setQuery("");
                      }}
                      aria-label="Back to suggestions"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9A18A] hover:text-[#5B6156]"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1">
                    {filteredUniversities.length > 0 ? (
                      filteredUniversities.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => pinUniversity(u)}
                          className="text-left px-3.5 py-2.5 text-sm text-[#3A382F] bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg hover:border-[#8CA37E] hover:bg-[#F4EFDD] transition-colors"
                        >
                          <div className="font-medium">{u.name}</div>
                          {u.city && (
                            <div className="text-xs text-[#5B6156]">
                              {u.city}
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-[#A9A18A] px-1 py-2">
                        No matches — try a different spelling.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Department */}
          {step === 2 && (
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-4">
                <BookOpen size={13} className="text-[#2F4A3D]" />
                Department
              </span>
              <h2 className="font-serif text-2xl text-[#253D31] mb-1.5">
                What's your department?
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">{university?.name}</p>

              {isLoading ? (
                <p className="text-sm text-[#5B6156] text-center py-8">
                  Loading departments...
                </p>
              ) : departments.length === 0 ? (
                <p className="text-sm text-[#8B3A3A] text-center py-8">
                  No departments found for this university.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {departments.map((dept) => {
                    const isSelected = department?.id === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setDepartment(dept)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
                          isSelected
                            ? "bg-[#FFFDF7] border-[#8CA37E] text-[#253D31] font-medium"
                            : "bg-[#FFFDF7] border-[#DCD2B4] text-[#5B6156] hover:border-[#C7BE9E]"
                        }`}
                      >
                        {dept.name}
                        {isSelected && (
                          <CheckCircle2 size={17} className="text-[#2F4A3D]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Year & Semester */}
          {step === 3 && (
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-4">
                <Calendar size={13} className="text-[#2F4A3D]" />
                Academic timeline
              </span>
              <h2 className="font-serif text-2xl text-[#253D31] mb-1.5">
                Year & semester
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">
                {department?.name} · {university?.name}
              </p>

              <p className="text-xs font-medium text-[#5B6156] mb-2">Year</p>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      year === y
                        ? "bg-[#2F4A3D] border-[#2F4A3D] text-[#F6F1E3]"
                        : "bg-[#FFFDF7] border-[#DCD2B4] text-[#5B6156] hover:border-[#8CA37E]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium text-[#5B6156] mb-2">
                Semester
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SEMESTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemester(s)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      semester === s
                        ? "bg-[#2F4A3D] border-[#2F4A3D] text-[#F6F1E3]"
                        : "bg-[#FFFDF7] border-[#DCD2B4] text-[#5B6156] hover:border-[#8CA37E]"
                    }`}
                  >
                    Semester {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Course Selection */}
          {step === 4 && (
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-4">
                <BookMarked size={13} className="text-[#2F4A3D]" />
                Select courses
              </span>
              <h2 className="font-serif text-2xl text-[#253D31] mb-1.5">
                Choose your courses
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">
                Year {year} · Semester {semester} · {department?.name}
              </p>

              {isLoading ? (
                <p className="text-sm text-[#5B6156] text-center py-8">
                  Loading courses...
                </p>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#8B3A3A] mb-2">
                    No courses found for this selection.
                  </p>
                  <p className="text-xs text-[#5B6156]">
                    Please contact support or try a different year/semester.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#5B6156]">
                      {selectedCourses.size} of {availableCourses.length}{" "}
                      selected
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCourses.size === availableCourses.length) {
                          setSelectedCourses(new Set());
                        } else {
                          setSelectedCourses(
                            new Set(availableCourses.map((c) => c.id)),
                          );
                        }
                      }}
                      className="text-xs font-medium text-[#2F4A3D] hover:underline"
                    >
                      {selectedCourses.size === availableCourses.length
                        ? "Deselect all"
                        : "Select all"}
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">
                    {availableCourses.map((course) => {
                      const isSelected = selectedCourses.has(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course.id)}
                          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                            isSelected
                              ? "bg-[#FFFDF7] border-[#8CA37E]"
                              : "bg-[#FFFDF7] border-[#DCD2B4] hover:border-[#C7BE9E]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#2F4A3D] border-[#2F4A3D]"
                                : "bg-white border-[#DCD2B4]"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2
                                size={14}
                                className="text-[#F6F1E3]"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-[#2F4A3D] bg-[#EFE8D4] px-2 py-0.5 rounded">
                                {course.courseCode}
                              </span>
                              {course.creditHours && (
                                <span className="text-xs text-[#5B6156]">
                                  {course.creditHours} credit
                                  {course.creditHours > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#253D31] mb-0.5">
                              {course.title}
                            </p>
                            {course.description && (
                              <p className="text-xs text-[#5B6156] line-clamp-2">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-[#DCD2B4]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#5B6156] hover:text-[#253D31] rounded-lg transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  (step === 3 && !canContinueStep3)
                }
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2F4A3D] hover:bg-[#253D31] disabled:opacity-50 disabled:cursor-not-allowed text-[#F6F1E3] text-sm font-semibold rounded-lg transition-colors"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canFinish || isSubmitting}
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2F4A3D] hover:bg-[#253D31] disabled:opacity-50 disabled:cursor-not-allowed text-[#F6F1E3] text-sm font-semibold rounded-lg transition-colors"
              >
                {isSubmitting ? "Saving setup..." : "Complete setup"}
                {!isSubmitting && <Sparkles size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right — green panel: feature slideshow */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#253D31] text-[#F6F1E3] p-14 overflow-hidden">
        <div className="font-serif text-xl tracking-wide">
          Stud<span className="text-[#C7D3B9]">AI</span>
        </div>

        {/* Slide content */}
        <div className="relative max-w-sm mx-auto w-full">
          {/* Floating decorative card borders — purely visual, sit behind the content */}
          <div className="absolute -top-6 -left-10 w-40 h-24 rounded-2xl border border-[#F6F1E3]/15 -rotate-6 pointer-events-none" />
          <div className="absolute top-10 -right-12 w-32 h-32 rounded-2xl border border-[#B08D4F]/25 rotate-12 pointer-events-none" />
          <div className="absolute -bottom-8 left-4 w-44 h-20 rounded-2xl border border-[#8CA37E]/20 rotate-3 pointer-events-none" />

          <div key={activeSlide} className="animate-slide-fade">
            <span className="relative inline-flex items-center gap-1.5 font-mono text-xs text-[#C7D3B9] bg-[#2C4739] border border-[#F6F1E3]/15 px-2.5 py-1 rounded-full mb-6">
              {FEATURES[activeSlide].tag}
            </span>

            <div className="relative w-16 h-16 rounded-2xl bg-[#2C4739] border border-[#F6F1E3]/15 flex items-center justify-center mb-6">
              <ActiveIcon
                size={28}
                className="text-[#C7D3B9]"
                strokeWidth={1.75}
              />
            </div>

            <h2 className="relative font-serif text-2xl leading-snug mb-3">
              {FEATURES[activeSlide].title}
            </h2>
            <p className="relative text-sm leading-relaxed text-[#F6F1E3]/70 min-h-[4.5rem]">
              {FEATURES[activeSlide].description}
            </p>
          </div>
        </div>

        {/* Icon tabs — click any feature to jump directly to it */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeSlide;
              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={feature.title}
                  aria-current={isActive}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-[#8CA37E] border-[#8CA37E] text-[#1A2B22]"
                      : "bg-[#2C4739] border-[#F6F1E3]/15 text-[#F6F1E3]/50 hover:text-[#F6F1E3]/80"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.75} />
                </button>
              );
            })}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {FEATURES.map((_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-6 bg-[#C7D3B9]"
                    : "w-1.5 bg-[#F6F1E3]/20"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-[#F6F1E3]/50 font-mono">
            Trusted by 1,200+ students · 3 universities
          </p>
        </div>
      </div>
    </div>
  );
}
