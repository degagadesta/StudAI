import { cacheGet, cacheSet } from "../lib/redis.js";

/**
 * Cache middleware for GET requests
 * Checks Redis before proceeding to controller
 * 
 * @param {string} keyPrefix - Cache key prefix (e.g., "courses:list")
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key from req
 * 
 * Example usage:
 * router.get('/courses', cacheMiddleware('courses:list', 300, (req) => {
 *   return `courses:list:${req.studentId}`;
 * }), controller);
 */
export function cacheMiddleware(keyPrefix, ttl, keyGenerator) {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        try {
            // Generate cache key
            const cacheKey = keyGenerator(req);

            // Try to get from cache
            const cachedData = await cacheGet(cacheKey);

            if (cachedData) {
                // Cache hit - return cached response
                console.log(`[Cache] Cache HIT: ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            // Cache miss - intercept res.json to cache the response
            console.log(`[Cache] Cache MISS: ${cacheKey}`);
            const originalJson = res.json.bind(res);

            res.json = function (data) {
                // Only cache successful responses (2xx status codes)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheSet(cacheKey, JSON.stringify(data), ttl).catch((err) => {
                        console.error("[Cache] Failed to cache response:", err.message);
                    });
                }

                // Send response
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error("[Cache] Middleware error:", error.message);
            // Continue without caching on error
            next();
        }
    };
}

/**
 * Simpler cache decorator for common patterns
 */
export function cacheStudentData(resource, ttl = 300) {
    return cacheMiddleware(
        `${resource}:student`,
        ttl,
        (req) => {
            const baseKey = `${resource}:student:${req.studentId}`;
            if (req.query && Object.keys(req.query).length > 0) {
                const sortedKeys = Object.keys(req.query).sort();
                const queryParts = [];
                for (const key of sortedKeys) {
                    const value = req.query[key];
                    if (value !== undefined && value !== null) {
                        const valStr = typeof value === "object" ? JSON.stringify(value) : String(value);
                        queryParts.push(`${key}=${valStr}`);
                    }
                }
                if (queryParts.length > 0) {
                    return `${baseKey}:${queryParts.join("&")}`;
                }
            }
            return baseKey;
        }
    );
}

/**
 * Cache for course-specific data
 */
export function cacheCourseData(resource, ttl = 300) {
    return cacheMiddleware(
        `${resource}:course`,
        ttl,
        (req) => `${resource}:course:${req.params.courseId || req.params.id}`
    );
}
