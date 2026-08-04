import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

const UNIVERSITIES = [
  "Addis Ababa Science and Technology University (AASTU)",
  "Addis Ababa University (AAU)",
  "Adama Science and Technology University (ASTU)",
  "Other Institution",
];

const DEPARTMENTS = [
  "Software Engineering",
  "Computer Science",
  "Electrical & Computer Engineering",
  "Electromechanical Engineering",
  "Civil Engineering",
  "Other",
];

const SEMESTERS = [
  "Year 1 - Semester 1",
  "Year 1 - Semester 2",
  "Year 2 - Semester 1",
  "Year 2 - Semester 2",
  "Year 3 - Semester 1",
  "Year 3 - Semester 2",
  "Year 4 - Semester 1",
  "Year 4 - Semester 2",
  "Year 5 - Semester 1",
  "Year 5 - Semester 2",
];

// Mock course mapping based on selected semester/department
const SAMPLE_COURSES: Record<string, Course[]> = {
  "Year 3 - Semester 1": [
    { id: "1", code: "SE3101", name: "Operating Systems", credits: 4 },
    {
      id: "2",
      code: "SE3102",
      name: "Formal Language & Automata Theory",
      credits: 3,
    },
    {
      id: "3",
      code: "SE3103",
      name: "Database Management Systems",
      credits: 4,
    },
    {
      id: "4",
      code: "SE3104",
      name: "Software Requirement Engineering",
      credits: 3,
    },
    { id: "5", code: "SE3105", name: "Computer Networks", credits: 4 },
  ],
  default: [
    {
      id: "101",
      code: "CS1001",
      name: "Introduction to Computer Science",
      credits: 3,
    },
    { id: "102", code: "MATH101", name: "Applied Mathematics I", credits: 4 },
    { id: "103", code: "PHYS101", name: "General Physics", credits: 3 },
    {
      id: "104",
      code: "ENG101",
      name: "Communicative English Skills",
      credits: 3,
    },
  ],
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Selections
  const [university, setUniversity] = useState<string>(UNIVERSITIES[0]);
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [semester, setSemester] = useState<string>("Year 3 - Semester 1");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);

  const availableCourses =
    SAMPLE_COURSES[semester] || SAMPLE_COURSES["default"];

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const selectAllCourses = () => {
    setSelectedCourseIds(availableCourses.map((c) => c.id));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        university,
        department,
        semester,
        courseIds: selectedCourseIds,
      };

      // TODO: Call your backend API endpoint here to save onboarding preferences
      console.log("Onboarding data submitted:", payload);

      // Navigate to dashboard upon completion
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1715] text-[#E3E8E5] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#2D5A46]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1C3A2F]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#24352F]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D5A46] flex items-center justify-center text-[#A3E6C5] font-bold text-lg">
            S
          </div>
          <span className="font-serif text-xl tracking-wide text-[#F0F4F2]">
            Stud<span className="text-[#34D399]">AI</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#87968F]">
          <span>STEP {step} OF 3</span>
          <div className="flex gap-1.5 ml-2">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-[#34D399]" : "bg-[#24352F]"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="relative z-10 max-w-2xl mx-auto w-full my-auto py-8">
        {/* STEP 1: Academic Profile */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2C27] border border-[#2D453E] text-xs text-[#34D399] mb-3">
                <GraduationCap size={14} />
                <span>Academic Institution</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F0F4F2]">
                Where do you study?
              </h1>
              <p className="text-xs sm:text-sm text-[#87968F] mt-1">
                We use your university and department to curate aligned course
                outlines.
              </p>
            </div>

            <div className="bg-[#16221E]/60 border border-[#24352F] p-6 rounded-2xl space-y-5 backdrop-blur-sm">
              {/* University Select */}
              <div>
                <label className="block text-xs font-medium text-[#A0ACA6] mb-2">
                  Select University
                </label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#0C1210] border border-[#24352F] text-[#E3E8E5] rounded-xl outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Select */}
              <div>
                <label className="block text-xs font-medium text-[#A0ACA6] mb-2">
                  Select Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#0C1210] border border-[#24352F] text-[#E3E8E5] rounded-xl outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Current Semester */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2C27] border border-[#2D453E] text-xs text-[#34D399] mb-3">
                <Calendar size={14} />
                <span>Academic Timeline</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F0F4F2]">
                Which semester are you in?
              </h1>
              <p className="text-xs sm:text-sm text-[#87968F] mt-1">
                Select your current active semester to view standard curriculum
                modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {SEMESTERS.map((sem) => {
                const isSelected = semester === sem;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSemester(sem)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all ${
                      isSelected
                        ? "bg-[#1C3A2F]/60 border-[#34D399] text-[#F0F4F2]"
                        : "bg-[#16221E]/60 border-[#24352F] text-[#A0ACA6] hover:border-[#2D453E]"
                    }`}
                  >
                    <span>{sem}</span>
                    {isSelected && (
                      <CheckCircle2
                        size={18}
                        className="text-[#34D399] shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Course Selection */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2C27] border border-[#2D453E] text-xs text-[#34D399] mb-3">
                  <BookOpen size={14} />
                  <span>Course Enrollment</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F0F4F2]">
                  Select your courses
                </h1>
                <p className="text-xs sm:text-sm text-[#87968F] mt-1">
                  Choose the courses you are currently taking this semester.
                </p>
              </div>

              <button
                type="button"
                onClick={selectAllCourses}
                className="text-xs text-[#34D399] hover:underline shrink-0"
              >
                Select All
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {availableCourses.map((course) => {
                const isChecked = selectedCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-[#1C3A2F]/40 border-[#34D399]/60"
                        : "bg-[#16221E]/60 border-[#24352F] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-[#34D399] border-[#34D399] text-[#0F1715]"
                            : "border-[#4A5751] bg-[#0C1210]"
                        }`}
                      >
                        {isChecked && (
                          <CheckCircle2 size={14} className="stroke-[3]" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#E3E8E5]">
                          {course.name}
                        </p>
                        <p className="text-xs text-[#7A8882] font-mono mt-0.5">
                          {course.code} • {course.credits} ECTS
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#62726B] bg-[#0C1210] px-2.5 py-1 rounded-md border border-[#24352F]">
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-8 mt-6 border-t border-[#24352F]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#24352F] text-xs font-medium text-[#A0ACA6] hover:text-[#E3E8E5] hover:bg-[#16221E] rounded-xl transition-all"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1C3A2F] hover:bg-[#254B3D] text-[#34D399] border border-[#2D5A46] text-xs font-semibold rounded-xl transition-all"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || selectedCourseIds.length === 0}
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#34D399] hover:bg-[#2EB885] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F1715] font-semibold text-xs rounded-xl transition-all"
            >
              {isSubmitting ? "Saving setup..." : "Complete Setup"}
              {!isSubmitting && <Sparkles size={16} />}
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-6 border-t border-[#24352F] text-center sm:text-left text-xs text-[#62726B] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#34D399]" />
          <span>Personalizing workspace based on curriculum standards</span>
        </div>
        <span>StudAI Academic Workspace</span>
      </footer>
    </div>
  );
}
