import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { SUBSCRIPTION_LIMITS } from "../../lib/subscriptionLimits.js";
import { getUpcomingEventsPreview } from "../event/event.service.js";

export async function getDashboardData(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: {
        include: {
          curriculum: {
            include: {
              department: { include: { university: true } },
            },
          },
        },
      },
    },
  });

  if (!student) throw new AppError("Account not found. Please log in again", 404);
  if (!student.profile) throw new AppError("Please complete your profile setup to view your dashboard", 400);

  const { profile } = student;

  const courses = await prisma.curriculumCourse.findMany({
    where: {
      curriculumId: profile.curriculumId,
      year: profile.currentYear,
      semester: profile.currentSemester,
    },
    include: { course: { select: { id: true, title: true } } },
  });

  const activePDFs = await prisma.courseMaterial.count({
    where: { uploadedBy: studentId, status: "READY" },
  });

  const { total: upcomingEventsCount, events: upcomingEvents } =
    await getUpcomingEventsPreview(studentId);

  return {
    profile: {
      name: `${student.firstName} ${student.lastName}`,
      university: profile.curriculum.department.university.name,
      department: profile.curriculum.department.name,
      year: profile.currentYear,
      semester: profile.currentSemester,
    },
    analytics: {
      registeredCourses: courses.length,
      activePDFs,
      maxPDFs: SUBSCRIPTION_LIMITS[student.subscriptionPlan], // null = unlimited
      subscriptionPlan: student.subscriptionPlan,
      upcomingEvents: upcomingEventsCount,
    },
    courses: courses.map((cc) => ({
      id: cc.course.id,
      code: cc.courseCode,
      name: cc.course.title,
    })),
    upcomingEvents,
  };
}
