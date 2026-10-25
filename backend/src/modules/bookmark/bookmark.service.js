import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { redis } from "../../lib/redis.js";

const BOOKMARK_CACHE_PREFIX = "bookmarks:material:";
const BOOKMARK_CACHE_TTL = 300; // 5 minutes
const MAX_BOOKMARKS_PER_PDF = 100;

// ────────────────────────────────────────────────────────────────────
// CREATE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export async function createBookmark(
    studentId,
    materialId,
    { name, pageNumber, textSelection, color = "yellow", note }
) {
    // Verify material ownership
    const material = await prisma.courseMaterial.findFirst({
        where: {
            id: materialId,
            uploadedBy: studentId,
            status: "READY",
        },
    });

    if (!material) {
        throw new AppError("Material not found or not accessible", 404);
    }

    // Check bookmark limit
    const bookmarkCount = await prisma.bookmark.count({
        where: {
            studentId,
            materialId,
        },
    });

    if (bookmarkCount >= MAX_BOOKMARKS_PER_PDF) {
        throw new AppError(
            `Maximum of ${MAX_BOOKMARKS_PER_PDF} bookmarks per PDF reached. Please delete some bookmarks before adding new ones.`,
            400
        );
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
        data: {
            studentId,
            materialId,
            name: name.trim(),
            pageNumber,
            textSelection: textSelection || null,
            color,
            note: note ? note.trim() : null,
        },
        select: {
            id: true,
            name: true,
            pageNumber: true,
            textSelection: true,
            color: true,
            note: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Invalidate cache
    await invalidateBookmarkCache(materialId);

    return bookmark;
}

// ────────────────────────────────────────────────────────────────────
// GET BOOKMARKS FOR MATERIAL
// ────────────────────────────────────────────────────────────────────
export async function getBookmarksForMaterial(studentId, materialId) {
    // Try cache first
    const cacheKey = `${BOOKMARK_CACHE_PREFIX}${materialId}:${studentId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    // Verify access
    const material = await prisma.courseMaterial.findFirst({
        where: {
            id: materialId,
            uploadedBy: studentId,
        },
    });

    if (!material) {
        throw new AppError("Material not found or not accessible", 404);
    }

    // Fetch bookmarks
    const bookmarks = await prisma.bookmark.findMany({
        where: {
            studentId,
            materialId,
        },
        select: {
            id: true,
            name: true,
            pageNumber: true,
            textSelection: true,
            color: true,
            note: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            pageNumber: "asc",
        },
    });

    // Cache for 5 minutes
    await redis.setex(cacheKey, BOOKMARK_CACHE_TTL, JSON.stringify(bookmarks));

    return bookmarks;
}

// ────────────────────────────────────────────────────────────────────
// GET ALL BOOKMARKS FOR STUDENT
// ────────────────────────────────────────────────────────────────────
export async function getAllBookmarks(studentId, { limit = 100, offset = 0 }) {
    const [bookmarks, total] = await Promise.all([
        prisma.bookmark.findMany({
            where: {
                studentId,
            },
            select: {
                id: true,
                name: true,
                pageNumber: true,
                textSelection: true,
                color: true,
                note: true,
                createdAt: true,
                updatedAt: true,
                materialId: true,
                material: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            skip: offset,
        }),
        prisma.bookmark.count({
            where: { studentId },
        }),
    ]);

    return {
        bookmarks,
        total,
        limit,
        offset,
    };
}

// ────────────────────────────────────────────────────────────────────
// UPDATE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export async function updateBookmark(studentId, bookmarkId, { name, note }) {
    // Verify ownership
    const bookmark = await prisma.bookmark.findFirst({
        where: {
            id: bookmarkId,
            studentId,
        },
    });

    if (!bookmark) {
        throw new AppError("Bookmark not found", 404);
    }

    // Update
    const updated = await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(note !== undefined && { note: note ? note.trim() : null }),
            updatedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            pageNumber: true,
            textSelection: true,
            color: true,
            note: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Invalidate cache
    await invalidateBookmarkCache(bookmark.materialId);

    return updated;
}

// ────────────────────────────────────────────────────────────────────
// DELETE BOOKMARK
// ────────────────────────────────────────────────────────────────────
export async function deleteBookmark(studentId, bookmarkId) {
    // Verify ownership
    const bookmark = await prisma.bookmark.findFirst({
        where: {
            id: bookmarkId,
            studentId,
        },
        select: {
            id: true,
            materialId: true,
        },
    });

    if (!bookmark) {
        throw new AppError("Bookmark not found", 404);
    }

    // Delete
    await prisma.bookmark.delete({
        where: { id: bookmarkId },
    });

    // Invalidate cache
    await invalidateBookmarkCache(bookmark.materialId);

    return { message: "Bookmark deleted successfully" };
}

// ────────────────────────────────────────────────────────────────────
// GET BOOKMARK BY ID
// ────────────────────────────────────────────────────────────────────
export async function getBookmarkById(studentId, bookmarkId) {
    const bookmark = await prisma.bookmark.findFirst({
        where: {
            id: bookmarkId,
            studentId,
        },
        select: {
            id: true,
            name: true,
            pageNumber: true,
            textSelection: true,
            color: true,
            note: true,
            createdAt: true,
            updatedAt: true,
            materialId: true,
            material: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    if (!bookmark) {
        throw new AppError("Bookmark not found", 404);
    }

    return bookmark;
}

// ────────────────────────────────────────────────────────────────────
// HELPER: INVALIDATE CACHE
// ────────────────────────────────────────────────────────────────────
async function invalidateBookmarkCache(materialId) {
    // We need to invalidate for all students who might have bookmarks
    // Since we can't easily get all studentIds, we use a pattern
    const pattern = `${BOOKMARK_CACHE_PREFIX}${materialId}:*`;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        console.error("[Bookmark] Cache invalidation error:", error.message);
    }
}
