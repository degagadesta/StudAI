import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Course } from "../../../api/Coursesapi";
import AddCourseModal from "../AddCourseModal";

interface CourseTabProps {
  isLoadingCourses: boolean;
  coursesError: string | null;
  courses: Course[];
  onAddCourse: (curriculumCourseId: string) => Promise<void>;
  onRemoveCourse: (curriculumCourseId: string) => Promise<void>;
  onRefreshCourses: () => Promise<void>;
}

export default function CourseTab({
  isLoadingCourses,
  coursesError,
  courses,
  onAddCourse,
  onRemoveCourse,
  onRefreshCourses,
}: CourseTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);

  const handleAddCourse = async (curriculumCourseId: string) => {
    try {
      await onAddCourse(curriculumCourseId);
      await onRefreshCourses(); // Refresh the course list
    } catch (err: any) {
      console.error("Failed to add course:", err);
      alert(err?.response?.data?.message || "Failed to add course");
    }
  };

  const handleRemoveCourse = async (course: Course) => {
    const pdfWarning =
      course.pdfCount > 0
        ? `\n\nThis will permanently delete ${course.pdfCount} uploaded PDF${course.pdfCount > 1 ? "s" : ""} for this course.`
        : "";

    if (
      window.confirm(
        `Are you sure you want to drop "${course.name}"?${pdfWarning}\n\nThis action cannot be undone.`
      )
    ) {
      setRemovingCourseId(course.id);
      try {
        await onRemoveCourse(course.id);
        await onRefreshCourses(); // Refresh the course list
      } catch (err: any) {
        console.error("Failed to remove course:", err);
        alert(err?.response?.data?.message || "Failed to remove course");
      } finally {
        setRemovingCourseId(null);
      }
    }
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-primary">
              Course Management
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Manage your enrolled courses and add new ones.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-inverse text-xs font-medium rounded-xl transition-colors"
          >
            <Plus size={14} />
            Add Course
          </button>
        </div>

        <div>
          <p className="text-xs font-medium text-secondary mb-2">
            Enrolled Courses ({courses.length})
          </p>

          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-8 text-primary gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs text-secondary">Loading courses...</span>
            </div>
          ) : coursesError ? (
            <div className="p-4 bg-[#FDF2F2] border border-[#E5C3C3] rounded-xl text-xs text-[#8A3A3A]">
              {coursesError}
            </div>
          ) : courses.length === 0 ? (
            <div className="p-6 bg-surface border border-default rounded-xl text-center">
              <p className="text-sm text-secondary">
                You haven't enrolled in any courses yet.
              </p>
              <p className="text-xs text-muted mt-1">
                Click "Add Course" to browse and enroll in available courses.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-inverse text-xs font-medium rounded-lg transition-colors"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3.5 bg-surface border border-default rounded-xl hover:border-accent/40 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-primary">
                        {course.name}
                      </p>
                      {course.pdfCount > 0 && (
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                          {course.pdfCount} PDF{course.pdfCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {course.code}
                    </p>
                    {course.description && (
                      <p className="text-xs text-secondary mt-1 line-clamp-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(course)}
                    disabled={removingCourseId === course.id}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-[#8A3A3A] transition-all disabled:opacity-50"
                    title="Drop course"
                  >
                    {removingCourseId === course.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-default/40">
          <p className="text-xs text-muted">
            💡 Dropping a course will permanently delete all uploaded materials for that course.
          </p>
        </div>
      </div>

      <AddCourseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddCourse={handleAddCourse}
      />
    </>
  );
}
