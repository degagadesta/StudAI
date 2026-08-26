import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Get all CurriculumCourse records for a curriculum, with course details
 */
export const getCoursesByCurriculum = async (curriculumId) => {
    const curriculum = await prisma.curriculum.findUnique({ where: { id: curriculumId } });
    if (!curriculum) throw new AppError("Curriculum not found", 404);

    const courses = await prisma.curriculumCourse.findMany({
        where: { curriculumId },
        select: {
            id: true,
            courseCode: true,
            year: true,
            semester: true,
            creditHours: true,
            course: {
                select: { id: true, title: true, description: true },
            },
        },
        orderBy: [{ year: "asc" }, { semester: "asc" }, { courseCode: "asc" }],
    });

    return courses;
};
