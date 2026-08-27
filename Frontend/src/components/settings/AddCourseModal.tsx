import { useState, useEffect } from "react";
import { X, Search, Loader2, Plus, Check } from "lucide-react";
import { getAvailableCourses, type Course } from "../../api/Coursesapi";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (curriculumCourseId: string) => Promise<void>;
}

export default function AddCourseModal({
  isOpen,
  onClose,
  onAddCourse,
}: AddCourseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableCourses();
    }
  }, [isOpen]);

  const loadAvailableCourses = async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const courses = await getAvailableCourses(search);
      setAvailableCourses(courses);
    } catch (err: any) {
      console.error("Failed to load available courses:", err);
      setError(
        err?.response?.data?.message || "Failed to load available courses"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      loadAvailableCourses(query.trim());
    } else {
      loadAvailableCourses();
    }
  };

  const handleAddCourse = async (curriculumCourseId: string) => {
    setAddingCourseId(curriculumCourseId);
    try {
      await onAddCourse(curriculumCourseId);
      // Refresh the list to update isEnrolled status
      await loadAvailableCourses(searchQuery.trim() || undefined);
    } catch (err) {
      console.error("Failed to add course:", err);
    } finally {
      setAddingCourseId(null);
    }
  };

  if (!isOpen) return null;

  const notEnrolledCourses = availableCourses.filter((c) => !c.isEnrolled);
  const enrolledCourses = availableCourses.filter((c) => c.isEnrolled);

  return (
    <div className="fixed inset-0 bg-page/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-default rounded-2xl w-full max-w-3xl max-h-[80vh] shadow-xl relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          <div>
            <h2 className="font-serif text-2xl text-primary">Add Courses</h2>
            <p className="text-xs text-secondary mt-1">
              Browse and add courses to your schedule
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-default">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by course name or code..."
              className="w-full pl-4 pr-11 py-2.5 text-sm bg-page border border-default rounded-full outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Search size={14} className="text-inverse" />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-primary gap-2">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs text-secondary">Loading courses...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#FDF2F2] border border-[#E5C3C3] rounded-xl text-xs text-[#8A3A3A]">
              {error}
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-secondary">No courses found</p>
              <p className="text-xs text-muted mt-1">
                Try a different search query
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Courses */}
              {notEnrolledCourses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-secondary mb-3">
                    Available Courses ({notEnrolledCourses.length})
                  </p>
                  <div className="space-y-2">
                    {notEnrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 bg-page border border-default rounded-xl hover:border-accent/40 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-primary">
                              {course.name}
                            </p>
                            <span className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded-full">
                              Year {course.year} • Sem {course.semester}
                            </span>
                          </div>
                          <p className="text-xs text-muted font-mono mt-0.5">
                            {course.code}
                            {course.creditHours && ` • ${course.creditHours} credits`}
                          </p>
                          {course.description && (
                            <p className="text-xs text-secondary mt-1 line-clamp-2">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddCourse(course.id)}
                          disabled={addingCourseId === course.id}
                          className="ml-4 px-3.5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-inverse text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {addingCourseId === course.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already Enrolled */}
              {enrolledCourses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-secondary mb-3">
                    Already Enrolled ({enrolledCourses.length})
                  </p>
                  <div className="space-y-2">
                    {enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-primary">
                              {course.name}
                            </p>
                            <span className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded-full">
                              Year {course.year} • Sem {course.semester}
                            </span>
                          </div>
                          <p className="text-xs text-muted font-mono mt-0.5">
                            {course.code}
                            {course.creditHours && ` • ${course.creditHours} credits`}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-1.5 text-accent text-xs">
                          <Check size={14} />
                          Enrolled
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-default flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-inverse text-sm font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
