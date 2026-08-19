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
      404,
    );
  }

  return material;
}

/**
 * Create a new PDF highlight
 */
export async function createHighlight(studentId, materialId, data) {
  // Verify material access
  await verifyMaterialAccess(studentId, materialId);

  // Create the highlight
  const highlight = await prisma.pdfHighlight.create({
    data: {
      studentId,
      materialId,
      pageNumber: data.pageNumber,
      textContent: data.textContent,
      position: data.position,
      color: data.color || "yellow",
      note: data.note || null,
    },
  });

  return highlight;
}

/**
 * Get all highlights for a material (for the authenticated student only)
 */
export async function getHighlights(studentId, materialId) {
  // Verify material access
  await verifyMaterialAccess(studentId, materialId);

  // Fetch highlights for this student and material
  const highlights = await prisma.pdfHighlight.findMany({
    where: {
      studentId,
      materialId,
    },
    orderBy: [{ pageNumber: "asc" }, { createdAt: "asc" }],
  });

  return highlights;
}

/**
 * Update a highlight (only color and note can be updated)
 */
export async function updateHighlight(studentId, highlightId, data) {
  // Verify the highlight belongs to this student
  const highlight = await prisma.pdfHighlight.findFirst({
    where: {
      id: highlightId,
      studentId,
    },
  });

  if (!highlight) {
    throw new AppError("Highlight not found", 404);
  }

  // Update only allowed fields
  const updated = await prisma.pdfHighlight.update({
    where: { id: highlightId },
    data: {
      color: data.color !== undefined ? data.color : highlight.color,
      note: data.note !== undefined ? data.note : highlight.note,
      updatedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(studentId, highlightId) {
  // Verify the highlight belongs to this student
  const highlight = await prisma.pdfHighlight.findFirst({
    where: {
      id: highlightId,
      studentId,
    },
  });

  if (!highlight) {
    throw new AppError("Highlight not found", 404);
  }

  // Delete the highlight
  await prisma.pdfHighlight.delete({
    where: { id: highlightId },
  });

  return { success: true };
}

/**
 * Get a single highlight by ID (with ownership verification)
 */
export async function getHighlightById(studentId, highlightId) {
  const highlight = await prisma.pdfHighlight.findFirst({
    where: {
      id: highlightId,
      studentId,
    },
  });

  if (!highlight) {
    throw new AppError("Highlight not found", 404);
  }

  return highlight;
}

/**
 * Get highlight count for a material (optional - for analytics)
 */
export async function getHighlightCount(studentId, materialId) {
  const count = await prisma.pdfHighlight.count({
    where: {
      studentId,
      materialId,
    },
  });

  return count;
}
