import { useState, useEffect } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import {
  getAcademicProfile,
  getCourses,
  type AcademicProfile,
  type Course,
} from "../api/Coursesapi";
import { getApiErrorMessage } from "../api/authApi";

export default function CoursesPage() {
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAcademicProfile(), getCourses()])
      .then(([profileData, coursesData]) => {
        if (cancelled) return;
        setProfile(profileData);
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

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl text-[#253D31] mb-1.5">Courses</h1>
      <p className="text-sm text-[#5B6156] mb-8">
        Your academic profile and this semester's course list.
      </p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5 mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="h-32 rounded-xl bg-[#EFE8D4] animate-pulse mb-10" />
      ) : (
        profile && (
          <div className="flex items-center gap-4 p-6 bg-[#253D31] text-[#F6F1E3] rounded-2xl mb-10">
            <div className="w-12 h-12 rounded-xl bg-[#2C4739] border border-[#F6F1E3]/15 flex items-center justify-center shrink-0">
              <GraduationCap size={22} className="text-[#C7D3B9]" />
            </div>
            <div>
              <p className="font-serif text-lg leading-tight">
                {profile.fullName}
              </p>
              <p className="text-sm text-[#F6F1E3]/70 mt-0.5">
                {profile.university} · {profile.department}
              </p>
              <p className="text-xs text-[#C7D3B9] font-mono mt-1">
                Year {profile.year} · Semester {profile.semester}
              </p>
            </div>
          </div>
        )
      )}

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
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl hover:border-[#8CA37E] transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EFE8D4] flex items-center justify-center shrink-0">
                <BookOpen size={17} className="text-[#2F4A3D]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#253D31] truncate">
                  {course.name}
                </p>
                <p className="text-xs text-[#A9A18A] font-mono mt-0.5">
                  {course.code} · {course.credits} ECTS
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
