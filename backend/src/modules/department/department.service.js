import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export const getDepartmentsByUniversity = async (universityId) => {
    // Validate that university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId }
    });

    if (!university) {
        throw new AppError("University not found. Please select a valid university", 404);
    }

    return prisma.department.findMany({
        where: {
            universityId,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

export const getDepartmentById = async (id) => {
    return prisma.department.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            name: true,
            universityId: true,
        },
    });
};