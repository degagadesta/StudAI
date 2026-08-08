import { prisma } from "../../lib/prisma.js";

export async function getUpcomingExams(studentId) {
  // Fetch profile with year + semester so we can filter correctly
  const profile = await prisma.studentProfile.findUnique({
    where: { studentId },
    select: {
      curriculumId: true,
      currentYear: true,
      currentSemester: true,
    },
  });

  if (!profile) return [];

  // Only courses for the student's current year AND semester
  const enrolledCourses = await prisma.curriculumCourse.findMany({
    where: {
      curriculumId: profile.curriculumId,
      year: profile.currentYear,
      semester: profile.currentSemester,
    },
    select: { id: true },
  });

  const curriculumCourseIds = enrolledCourses.map((ec) => ec.id);
  if (curriculumCourseIds.length === 0) return [];

  // PastExam is an archive — there are no "future" records.
  // Return the most recent exam per course+type as study references.
  const exams = await prisma.pastExam.findMany({
    where: { curriculumCourseId: { in: curriculumCourseIds } },
    include: {
      curriculumCourse: {
        select: {
          course: {
            select: { title: true }
          }
        }
      }
    },
    orderBy: { year: "desc" },
  });

  // Keep only the latest entry per (curriculumCourseId + type) to avoid duplicates
  const seen = new Set();
  const latest = exams.filter((exam) => {
    const key = `${exam.curriculumCourseId}-${exam.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return latest.map((exam) => ({
    id: exam.id,
    courseName: exam.curriculumCourse.course.title,
    examType: exam.type,
    year: exam.year,
  }));
}
