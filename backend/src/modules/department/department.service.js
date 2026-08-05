import prisma from "../../lib/prisma.js";

export const getDepartmentsByUniversity = async (universityId) => {
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