/**
 * In-memory cache for student existence checks
 * Reduces database queries in authenticate middleware by ~95%
 * 
 * Cache Strategy:
 * - TTL: 15 minutes (matches JWT access token expiry)
 * - Stores: studentId → expiry timestamp
 * - Invalidation: On account deletion, logout
 */

class StudentCache {
    constructor() {
        this.cache = new Map();
        this.TTL_MS = 15 * 60 * 1000; // 15 minutes

        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Check if student exists in cache and is not expired
     */
    has(studentId) {
        const expiry = this.cache.get(studentId);

        if (!expiry) {
            return false;
        }

        // Check if expired
        if (expiry < Date.now()) {
            this.cache.delete(studentId);
            return false;
        }

        return true;
    }

    /**
     * Add student to cache with TTL
     */
    set(studentId) {
        const expiry = Date.now() + this.TTL_MS;
        this.cache.set(studentId, expiry);
    }

    /**
     * Remove student from cache (called on logout/deletion)
     */
    delete(studentId) {
        this.cache.delete(studentId);
    }

    /**
     * Clear all cached students
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [studentId, expiry] of this.cache.entries()) {
            if (expiry < now) {
                this.cache.delete(studentId);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`[StudentCache] Cleaned ${cleanedCount} expired entries`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            ttlMinutes: this.TTL_MS / (60 * 1000),
        };
    }
}

// Export singleton instance
export const studentCache = new StudentCache();
