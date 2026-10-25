import { useEffect, useState, type FormEvent } from "react";
import { Plus, UsersRound, X } from "lucide-react";
import { getCourses, type Course } from "../api/Coursesapi";
import { getApiErrorMessage } from "../api/authApi";

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
}

export default function StudyBuddyPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCreateDialogOpen) {
      return;
    }

    let cancelled = false;
    setIsLoadingCourses(true);
    setCoursesError(null);

    getCourses()
      .then((coursesData) => {
        if (!cancelled) {
          setCourses(coursesData);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCoursesError(
            getApiErrorMessage(error, "Could not load your courses."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCourses(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isCreateDialogOpen]);

  const handleCreateGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("groupName") ?? "").trim();
    const description = String(formData.get("groupDescription") ?? "").trim();
    const courseId = String(formData.get("courseId") ?? "");
    const course = courses.find((item) => item.id === courseId);

    if (!name || !course) {
      return;
    }

    setGroups((currentGroups) => [
      ...currentGroups,
      { id: Date.now(), name, description, courseId, courseName: course.name },
    ]);
    setIsCreateDialogOpen(false);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Study together</p>
          <h1 className="mt-1 font-serif text-3xl text-primary">Study Buddy</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateDialogOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse transition-colors hover:opacity-90"
        >
          <Plus size={17} />
          Create a study group
        </button>
      </header>

      {groups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.id}
              className="rounded-2xl border border-default bg-surface p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-accent">
                <UsersRound size={20} strokeWidth={1.8} />
              </div>
              <h2 className="font-serif text-lg text-primary">{group.name}</h2>
              {group.description && (
                <p className="mt-1 text-sm leading-6 text-secondary">
                  {group.description}
                </p>
              )}
              <p className="mt-2 text-xs font-medium text-secondary">
                {group.courseName}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-default bg-surface p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-accent">
            <UsersRound size={26} strokeWidth={1.8} />
          </div>
          <h2 className="font-serif text-xl text-primary">
            Find your study partner
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
            Create a study group to bring classmates together and make studying
            a shared experience.
          </p>
        </div>
      )}

      {isCreateDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsCreateDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-study-group-title"
            className="w-full max-w-md rounded-3xl border border-default bg-surface p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-study-group-title"
                  className="font-serif text-2xl text-primary"
                >
                  Create a study group
                </h2>
                <p className="mt-1 text-sm text-secondary">
                  Give your group a name and a short description.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label
                  htmlFor="groupCourse"
                  className="mb-1.5 block text-sm font-medium text-primary"
                >
                  Course
                </label>
                <select
                  id="groupCourse"
                  name="courseId"
                  required
                  disabled={isLoadingCourses || courses.length === 0}
                  defaultValue=""
                  className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="" disabled>
                    {isLoadingCourses
                      ? "Loading courses…"
                      : courses.length > 0
                        ? "Select a course"
                        : "No courses available"}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code ? `${course.code} — ` : ""}
                      {course.name}
                    </option>
                  ))}
                </select>
                {coursesError && (
                  <p role="alert" className="mt-2 text-sm text-error">
                    {coursesError}
                  </p>
                )}
                {!isLoadingCourses && !coursesError && courses.length === 0 && (
                  <p className="mt-2 text-sm text-secondary">
                    Add a course before creating a study group.
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="groupName"
                  className="mb-1.5 block text-sm font-medium text-primary"
                >
                  Group name
                </label>
                <input
                  id="groupName"
                  name="groupName"
                  type="text"
                  required
                  maxLength={60}
                  autoFocus
                  placeholder="e.g. Biology study group"
                  className="w-full rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="groupDescription"
                  className="mb-1.5 block text-sm font-medium text-primary"
                >
                  Description
                  <span className="ml-1 font-normal text-muted">Optional</span>
                </label>
                <textarea
                  id="groupDescription"
                  name="groupDescription"
                  rows={3}
                  maxLength={300}
                  placeholder="What will your group study?"
                  className="w-full resize-none rounded-xl border border-default bg-page px-3.5 py-3 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-elevated"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoadingCourses || courses.length === 0 || Boolean(coursesError)}
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-inverse transition-colors hover:opacity-90"
                >
                  Create group
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
