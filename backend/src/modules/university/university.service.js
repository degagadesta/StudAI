import { prisma } from "../../lib/prisma.js";

export const getAllUniversities = async () => {
    return await prisma.university.findMany({
        select: {
            id: true,
            name: true,
            shortName: true,
            city: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

export const getUniversityById = async (id) => {
    return await prisma.university.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            shortName: true,
            city: true,
        },
    });
};