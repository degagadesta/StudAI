import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Verify that a student has access to a specific course material
 */
async function verifyMaterialAccess(studentId, materialId) {
    const material = await prisma.courseMaterial.findFirst({
        where: {
            id: materialId,
            status: { not: "DELETED" },
            curriculumCourse: {
                studentSelections: {
                    some: {
                        studentProfile: {
                            studentId,
                        },
                    },
                },
            },
        },
    });

    if (!material) {
        throw new AppError(
            "Material not found or you don't have access to it",
            404
        );
    }

    if (material.status !== "READY") {
        if (material.status === "FAILED") {
            throw new AppError("This material failed to process. Try re-uploading it.", 400);
        }
        throw new AppError("This material is still being processed. Please wait until processing is complete.", 400);
    }

    return material;
}

/**
 * Get the note for a specific material (for the authenticated student)
 */
export async function getNote(studentId, materialId) {
    // Verify material access
    await verifyMaterialAccess(studentId, materialId);

    // Fetch the note
    const note = await prisma.pdfNote.findUnique({
        where: {
            studentId_materialId: {
                studentId,
                materialId,
            },
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return note; // Returns null if note doesn't exist yet
}

/**
 * Create or update a note (upsert based on studentId + materialId)
 */
export async function upsertNote(studentId, materialId, content) {
    // Verify material access
    await verifyMaterialAccess(studentId, materialId);

    // Trim whitespace
    const trimmedContent = content.trim();

    // If content is empty after trimming, delete the note instead
    if (trimmedContent.length === 0) {
        await deleteNote(studentId, materialId);
        return null;
    }

    // Upsert the note
    const note = await prisma.pdfNote.upsert({
        where: {
            studentId_materialId: {
                studentId,
                materialId,
            },
        },
        update: {
            content: trimmedContent,
            updatedAt: new Date(),
        },
        create: {
            studentId,
            materialId,
            content: trimmedContent,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return note;
}

/**
 * Delete a note for a specific material
 */
export async function deleteNote(studentId, materialId) {
    // Verify material access
    await verifyMaterialAccess(studentId, materialId);

    // Use deleteMany to avoid errors if note doesn't exist
    await prisma.pdfNote.deleteMany({
        where: {
            studentId,
            materialId,
        },
    });

    return { success: true };
}
