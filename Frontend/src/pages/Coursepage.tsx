import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getCourses,
  type Course,
} from "../api/Coursesapi";
import { getMaterials, type Material } from "../api/Materialsapi";
import { getApiErrorMessage } from "../api/authApi";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected course state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((coursesData) => {
        if (cancelled) return;
        setCourses(coursesData);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Could not load your courses."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle selecting a course card
  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setIsLoadingMaterials(true);
    try {
      const allMaterials = await getMaterials();
      const filtered = allMaterials.filter(
        (m) =>
          m.courseName.toLowerCase().includes(course.name.toLowerCase()) ||
          m.courseName.toLowerCase().includes(course.code.toLowerCase()),
      );
      setMaterials(filtered);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not load materials for this course."),
      );
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Header */}
      {selectedCourse ? (
        <button
          type="button"
          onClick={() => setSelectedCourse(null)}
          className="inline-flex items-center gap-2 text-sm text-[#5B6156] hover:text-[#253D31] mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to all courses
        </button>
      ) : null}

      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">
        {selectedCourse ? selectedCourse.name : "Courses"}
      </h1>
      <p className="text-sm text-[#5B6156] mb-8">
        {selectedCourse
          ? `${selectedCourse.code} — Uploaded Course Materials`
          : "Your courses for this semester."}
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5 mb-6">
          {error}
        </div>
      )}

      {/* Dynamic View: Course List vs. Course Materials */}
      {selectedCourse ? (
        /* --- MATERIALS VIEW --- */
        <div>
          <h2 className="font-serif text-lg text-[#253D31] mb-4">
            Materials for {selectedCourse.name}
          </h2>

          {isLoadingMaterials ? (
            <div className="flex items-center gap-2 text-sm text-[#5B6156] py-8">
              <Loader2 size={18} className="animate-spin text-[#2F4A3D]" />
              Fetching course materials…
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl text-center">
              <FileText size={32} className="mx-auto text-[#DCD2B4] mb-2" />
              <p className="text-sm font-medium text-[#253D31]">
                No materials uploaded for this course yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => (
                <Link
                  key={m.id}
                  to={`/app/workspace/${m.id}`}
                  className="group relative p-5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl hover:border-[#8CA37E] transition-colors cursor-pointer block"
                >
                  <div className="flex items-start gap-3 mb-4 pr-6">
                    <div className="w-9 h-9 rounded-lg bg-[#EFE8D4] flex items-center justify-center shrink-0">
                      <FileText size={17} className="text-[#2F4A3D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#253D31] truncate group-hover:underline">
                        {m.fileName}
                      </p>
                      <p className="text-xs text-[#A9A18A]">{m.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5B6156] mb-1.5">
                    <span>Progress</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8CA37E] transition-all"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* --- COURSES LIST VIEW --- */
        <div>
          <h2 className="font-serif text-lg text-[#253D31] mb-4">
            Courses this semester
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-[#EFE8D4] animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-[#5B6156]">
              No courses found for your current year and semester yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourse(course)}
                  className="w-full text-left flex items-center gap-4 p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl hover:border-[#8CA37E] transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EFE8D4] group-hover:bg-[#E5DCC2] flex items-center justify-center shrink-0 transition-colors">
                    <BookOpen size={17} className="text-[#2F4A3D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#253D31] truncate group-hover:underline">
                      {course.name}
                    </p>
                    <p className="text-xs text-[#A9A18A] font-mono mt-0.5">
                      {course.code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
