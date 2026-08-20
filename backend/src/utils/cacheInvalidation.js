import { cacheDel, cacheInvalidatePattern } from "../lib/redis.js";

/**
 * Invalidate all courses cache for a student
 */
export async function invalidateCourses(studentId) {
    await cacheInvalidatePattern(`courses:list:${studentId}:*`);
    await cacheInvalidatePattern(`courses:materials:${studentId}:*`);
}

/**
 * Invalidate specific course detail cache
 */
export async function invalidateCourseDetail(courseId) {
    await cacheDel(`courses:detail:${courseId}`);
}

/**
 * Invalidate materials cache for a student
 */
export async function invalidateMaterials(studentId, materialId = null) {
    await cacheDel(`materials:list:${studentId}`);

    if (materialId) {
        await cacheDel(`materials:detail:${materialId}`);
        await cacheDel(`materials:status:${materialId}`);
    }
}

/**
 * Invalidate analytics cache for a student
 */
export async function invalidateAnalytics(studentId) {
    await cacheDel(`analytics:student:${studentId}`);
    await cacheInvalidatePattern(`analytics:daily:${studentId}:*`);
    await cacheInvalidatePattern(`analytics:weekly:${studentId}:*`);
}

/**
 * Invalidate dashboard cache for a student
 */
export async function invalidateDashboard(studentId) {
    await cacheDel(`dashboard:stats:${studentId}`);
}

/**
 * Invalidate profile cache for a student
 */
export async function invalidateProfile(studentId) {
    await cacheDel(`profile:${studentId}`);
}

/**
 * Invalidate academic structure cache
 */
export async function invalidateAcademicStructure() {
    await cacheDel("academic:universities");
    await cacheInvalidatePattern("academic:departments:*");
    await cacheInvalidatePattern("academic:curriculum:*");
}

/**
 * Invalidate all caches for a student (use sparingly)
 */
export async function invalidateAllStudent(studentId) {
    await invalidateCourses(studentId);
    await invalidateMaterials(studentId);
    await invalidateAnalytics(studentId);
    await invalidateDashboard(studentId);
    await invalidateProfile(studentId);
}
