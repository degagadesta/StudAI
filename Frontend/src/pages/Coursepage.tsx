import { useState, useEffect, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  X,
  BookOpen,
  ArrowLeft,
  FileText,
  Loader2,
  Plus,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  getCourses,
  getAvailableCourses,
  deleteCourse,
  createCourse,
  type Course,
} from "../api/Coursesapi";
import { getMaterials, type Material } from "../api/Materialsapi";
import { getApiErrorMessage } from "../api/authApi";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected course state for viewing materials
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Add Course Modal & Real-time Catalog State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [departmentCatalog, setDepartmentCatalog] = useState<Course[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load enrolled student courses
  const fetchEnrolledCourses = async () => {
    try {
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load your courses."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  // Open modal — actual catalog fetch happens in the debounced effect below
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setVisibleCount(3);
    setSearchQuery("");
    setCatalogError(null);
  };

  // Debounced server-side catalog search whenever the query (or modal open state) changes
  useEffect(() => {
    if (!isAddModalOpen) return;

    const controller = new AbortController();
    setIsLoadingCatalog(true);
    setCatalogError(null);

    const timer = setTimeout(async () => {
      try {
        const catalogData = await getAvailableCourses(searchQuery);
        setDepartmentCatalog(catalogData || []);
        setVisibleCount(3);
      } catch (err) {
        if (!controller.signal.aborted) {
          setCatalogError(
            getApiErrorMessage(err, "Could not fetch department courses."),
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingCatalog(false);
      }
    }, 300); // debounce so we don't hit the API on every keystroke

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, isAddModalOpen]);

  // Select course card to load materials
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

  // Unenroll / Drop course
  const handleDeleteCourse = async (e: MouseEvent, courseId: string) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to remove this course?")) {
      return;
    }

    setDeletingCourseId(courseId);
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete the course."));
    } finally {
      setDeletingCourseId(null);
    }
  };

  // Enroll course by posting curriculumCourseId to backend
  const handleAddCourse = async (catalogCourse: Course) => {
    const isAlreadyEnrolled = courses.some(
      (c) =>
        c.id === catalogCourse.id ||
        c.code.toLowerCase() === catalogCourse.code.toLowerCase(),
    );

    if (isAlreadyEnrolled) {
      setSuccessMessage(`You are already enrolled in ${catalogCourse.name}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setAddingCourseId(catalogCourse.id);
    setSuccessMessage(null);

    try {
      // POST /student/courses/select with { curriculumCourseId: catalogCourse.id }
      await createCourse(catalogCourse.id);

      // Refresh enrolled list from server
      await fetchEnrolledCourses();

      setSuccessMessage(`Successfully enrolled in "${catalogCourse.name}"!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Could not add this course to your profile."),
      );
    } finally {
      setAddingCourseId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {selectedCourse ? (
            <button
              type="button"
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to all courses
            </button>
          ) : null}

          <h1 className="font-serif text-2xl text-primary mb-1">
            {selectedCourse ? selectedCourse.name : "Courses"}
          </h1>
          <p className="text-sm text-secondary">
            {selectedCourse
              ? `${selectedCourse.code} — Uploaded Course Materials`
              : "Your enrolled courses for this semester."}
          </p>
        </div>

        {!selectedCourse && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-[#FFFDF7] text-sm font-medium rounded-xl hover:bg-accent transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error border border-error rounded-lg px-3.5 py-2.5 mb-6">
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {selectedCourse ? (
        /* Materials View */
        <div>
          <h2 className="font-serif text-lg text-primary mb-4">
            Materials for {selectedCourse.name}
          </h2>

          {isLoadingMaterials ? (
            <div className="flex items-center gap-2 text-sm text-secondary py-8">
              <Loader2 size={18} className="animate-spin text-accent" />
              Fetching course materials…
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 bg-surface border border-default rounded-xl text-center">
              <FileText size={32} className="mx-auto text-[#DCD2B4] mb-2" />
              <p className="text-sm font-medium text-primary">
                No materials uploaded for this course yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => (
                <Link
                  key={m.id}
                  to={`/app/workspace/${m.id}`}
                  className="group relative p-5 bg-surface border border-default rounded-xl hover:border-accent transition-colors cursor-pointer block"
                >
                  <div className="flex items-start gap-3 mb-4 pr-6">
                    <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                      <FileText size={17} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate group-hover:underline">
                        {m.fileName}
                      </p>
                      <p className="text-xs text-muted">{m.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary mb-1.5">
                    <span>Progress</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#DCD2B4] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-secondary transition-all"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Enrolled Course List View */
        <div>
          <h2 className="font-serif text-lg text-primary mb-4">
            Courses enrolled
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-elevated animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-secondary">
              No courses enrolled yet. Click "Add Course" above to enroll in
              your department courses.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="w-full flex items-center justify-between p-4 bg-surface border border-default rounded-xl hover:border-accent transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectCourse(course)}
                    className="flex items-center gap-4 text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-elevated group-hover:bg-[#E5DCC2] flex items-center justify-center shrink-0 transition-colors">
                      <BookOpen size={17} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate group-hover:underline">
                        {course.name}
                      </p>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        {course.code}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteCourse(e, course.id)}
                    disabled={deletingCourseId === course.id}
                    title="Remove course"
                    className="p-1.5 text-muted hover:text-error hover:bg-error rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    {deletingCourseId === course.id ? (
                      <Loader2 size={16} className="animate-spin text-error" />
                    ) : (
                      <X size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface border border-default rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Title Bar */}
            <div className="flex items-center justify-between p-5 border-b border-default/60">
              <h3 className="font-serif text-lg font-medium text-primary">
                Select & Add Course
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-muted hover:text-primary hover:bg-elevated rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 border-b border-default/40 bg-[#FAF7EE]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  placeholder="Search department courses by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-default rounded-xl text-sm text-primary focus:outline-none focus:border-accent placeholder:text-muted"
                />
              </div>
            </div>

            {/* Error / Success Banners */}
            {catalogError && (
              <div className="mx-4 mt-3 p-3 bg-error border border-error text-error text-xs rounded-xl">
                {catalogError}
              </div>
            )}

            {successMessage && (
              <div className="mx-4 mt-3 p-3 bg-[#EAF3EC] border border-[#A2C7A9] text-primary text-xs rounded-xl flex items-center gap-2">
                <Check size={16} className="text-accent shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Scrollable Course List */}
            <div className="p-4 overflow-y-auto space-y-2.5 max-h-64 min-h-[160px]">
              {isLoadingCatalog ? (
                <div className="flex flex-col items-center justify-center py-8 text-secondary gap-2">
                  <Loader2 size={20} className="animate-spin text-accent" />
                  <span className="text-xs">Loading department courses…</span>
                </div>
              ) : departmentCatalog.length === 0 ? (
                <p className="text-xs text-center text-muted py-8">
                  No department courses matching your query.
                </p>
              ) : (
                departmentCatalog.slice(0, visibleCount).map((catCourse) => {
                  const isEnrolled =
                    catCourse.isEnrolled ??
                    courses.some(
                      (c) =>
                        c.id === catCourse.id ||
                        c.code.toLowerCase() === catCourse.code.toLowerCase(),
                    );

                  return (
                    <div
                      key={catCourse.id}
                      onClick={() => !isEnrolled && handleAddCourse(catCourse)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isEnrolled
                          ? "bg-[#F3EFE3] border-default opacity-75 cursor-default"
                          : "bg-surface border-default hover:border-accent cursor-pointer hover:bg-[#FDFBF3]"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold tracking-wider text-[#1E5652] uppercase bg-elevated px-2 py-0.5 rounded-md">
                            {catCourse.code}
                          </span>
                          <p className="text-xs font-medium text-primary truncate">
                            {catCourse.name}
                          </p>
                        </div>
                        {catCourse.description && (
                          <p className="text-[11px] text-muted truncate mt-1">
                            {catCourse.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isEnrolled || addingCourseId === catCourse.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 ${
                          isEnrolled
                            ? "text-secondary bg-transparent"
                            : "bg-accent text-[#FFFDF7] hover:bg-accent"
                        }`}
                      >
                        {addingCourseId === catCourse.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isEnrolled ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* See More Expand */}
            {!isLoadingCatalog && visibleCount < departmentCatalog.length && (
              <div className="p-3 border-t border-default/60 text-center bg-[#FAF7EE]">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E5652] hover:text-primary transition-colors cursor-pointer"
                >
                  <span>See more courses</span>
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
