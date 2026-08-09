import { Loader2, Plus } from "lucide-react";
import type { Course } from "../../../api/Coursesapi";
import { stripControlChars, capLength } from "../../../utils/security/sanitize";

const CODE_MAX_LEN = 20;
const NAME_MAX_LEN = 100;

interface CourseTabProps {
  autoLoadMaterials: boolean;
  onToggleAutoLoad: (val: boolean) => void;

  showAddCourse: boolean;
  onToggleAddCourse: () => void;

  newCode: string;
  newName: string;
  newCredits: string;
  onChangeCode: (v: string) => void;
  onChangeName: (v: string) => void;
  onChangeCredits: (v: string) => void;

  createError: string | null;
  isCreatingCourse: boolean;
  onSaveCourse: () => void;
  onCancelAddCourse: () => void;

  isLoadingCourses: boolean;
  coursesError: string | null;
  courses: Course[];
}

export default function CourseTab({
  autoLoadMaterials,
  onToggleAutoLoad,
  showAddCourse,
  onToggleAddCourse,
  newCode,
  newName,
  newCredits,
  onChangeCode,
  onChangeName,
  onChangeCredits,
  createError,
  isCreatingCourse,
  onSaveCourse,
  onCancelAddCourse,
  isLoadingCourses,
  coursesError,
  courses,
}: CourseTabProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-primary">
            Course Preferences
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Manage the courses tied to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAddCourse}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent text-inverse text-xs font-medium rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Add Course
        </button>
      </div>

      <div className="flex items-center justify-between p-4 bg-surface border border-default rounded-xl">
        <div>
          <p className="text-sm font-medium text-primary">
            Auto-load Course Materials
          </p>
          <p className="text-xs text-secondary">
            Directly load uploaded files as cards on the current page
          </p>
        </div>
        <input
          type="checkbox"
          checked={autoLoadMaterials}
          onChange={(e) => onToggleAutoLoad(e.target.checked)}
          className="w-4 h-4 accent-[#253D31] cursor-pointer"
        />
      </div>

      {showAddCourse && (
        <div className="p-4 bg-surface-hover border border-default rounded-xl space-y-3">
          {createError && (
            <p className="text-xs text-[#8A3A3A]">{createError}</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Code"
              value={newCode}
              maxLength={CODE_MAX_LEN}
              placeholder="SE3103"
              onChange={(v) =>
                onChangeCode(capLength(stripControlChars(v), CODE_MAX_LEN))
              }
            />
            <Field
              label="Name"
              value={newName}
              maxLength={NAME_MAX_LEN}
              placeholder="Database Management Systems"
              onChange={(v) =>
                onChangeName(capLength(stripControlChars(v), NAME_MAX_LEN))
              }
            />
            <div>
              <label className="block text-[11px] font-medium text-secondary mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={newCredits}
                onChange={(e) => onChangeCredits(e.target.value)}
                placeholder="4"
                className="w-full px-3 py-2 text-sm bg-surface border border-default rounded-lg outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelAddCourse}
              className="px-3.5 py-2 border border-default text-primary hover:bg-elevated text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isCreatingCourse}
              onClick={onSaveCourse}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed text-inverse text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              {isCreatingCourse && (
                <Loader2 size={13} className="animate-spin" />
              )}
              Save Course
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-secondary mb-2">Your courses</p>

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
          <p className="text-sm text-secondary">
            No courses found for your current year and semester yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3.5 bg-surface border border-default rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-primary">
                    {course.name}
                  </p>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    {course.code}
                  </p>
                </div>
                <span className="text-xs text-secondary bg-elevated px-2.5 py-1 rounded-full shrink-0">
                  {course.credits} ECTS
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  maxLength,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-secondary mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-surface border border-default rounded-lg outline-none placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/20"
      />
    </div>
  );
}
