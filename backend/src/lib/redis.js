import { createClient } from "redis";
import { env } from "../config/env.js";

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client with error handling
 */
async function initRedis() {
    try {
        const config = env.redisUrl ? { url: env.redisUrl, socket: { reconnectStrategy: false } } : {
            socket: {
                host: env.redisHost || "localhost",
                port: env.redisPort || 6379,
                reconnectStrategy: false
            },
            password: env.redisPassword || undefined,
            database: env.redisDb || 0,
        };
        redisClient = createClient(config);

        redisClient.on("error", (err) => {
            console.error("[Redis] Connection error:", err.message);
            isConnected = false;
        });

        redisClient.on("connect", () => {
            console.log("[Redis] Connected successfully");
            isConnected = true;
        });

        redisClient.on("ready", () => {
            console.log("[Redis] Ready to accept commands");
        });

        redisClient.on("reconnecting", () => {
            console.log("[Redis] Reconnecting...");
        });

        await redisClient.connect();
    } catch (error) {
        console.error("[Redis] Failed to initialize:", error.message);
        console.warn("[Redis] Application will continue without caching");
        isConnected = false;
    }
}

// In-memory cache fallback when Redis is unavailable
const inMemoryCache = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [key, item] of inMemoryCache.entries()) {
        if (item.expiresAt && item.expiresAt < now) {
            inMemoryCache.delete(key);
        }
    }
}, 60000).unref();

/**
 * Get value from Redis cache or in-memory fallback
 */
async function cacheGet(key) {
    if (isConnected && redisClient) {
        try {
            const value = await redisClient.get(key);
            if (value) {
                console.log(`[Redis] Cache HIT: ${key}`);
            }
            return value;
        } catch (error) {
            console.error(`[Redis] Get error for key "${key}":`, error.message);
        }
    }

    const item = inMemoryCache.get(key);
    if (item) {
        if (item.expiresAt && item.expiresAt < Date.now()) {
            inMemoryCache.delete(key);
            return null;
        }
        console.log(`[Cache-Memory] Cache HIT: ${key}`);
        return item.value;
    }

    return null;
}

/**
 * Set value in Redis cache or in-memory fallback with TTL
 */
async function cacheSet(key, value, ttl = 300) {
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;
    inMemoryCache.set(key, { value, expiresAt });

    if (isConnected && redisClient) {
        try {
            await redisClient.setEx(key, ttl, value);
            console.log(`[Redis] Cache SET: ${key} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            console.error(`[Redis] Set error for key "${key}":`, error.message);
        }
    }

    console.log(`[Cache-Memory] Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
}

/**
 * Delete a specific key from cache
 */
async function cacheDel(key) {
    inMemoryCache.delete(key);

    if (!isConnected || !redisClient) {
        return true;
    }

    try {
        await redisClient.del(key);
        console.log(`[Redis] Cache DEL: ${key}`);
        return true;
    } catch (error) {
        console.error(`[Redis] Delete error for key "${key}":`, error.message);
        return false;
    }
}

/**
 * Delete all keys matching a pattern
 */
async function cacheInvalidatePattern(pattern) {
    const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    let inMemoryCount = 0;
    for (const key of inMemoryCache.keys()) {
        if (regexPattern.test(key)) {
            inMemoryCache.delete(key);
            inMemoryCount++;
        }
    }
    if (inMemoryCount > 0) {
        console.log(`[Cache-Memory] Cache INVALIDATE: ${pattern} (${inMemoryCount} keys)`);
    }

    if (!isConnected || !redisClient) {
        return true;
    }

    try {
        let cursor = 0;
        let totalDeleted = 0;

        do {
            const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = result.cursor;
            if (result.keys.length > 0) {
                await redisClient.del(result.keys);
                totalDeleted += result.keys.length;
            }
        } while (cursor !== 0);

        if (totalDeleted > 0) {
            console.log(`[Redis] Cache INVALIDATE: ${pattern} (${totalDeleted} keys)`);
        }
        return true;
    } catch (error) {
        console.error(
            `[Redis] Invalidate pattern error for "${pattern}":`,
            error.message
        );
        return false;
    }
}

/**
 * Check if Redis is connected
 */
function isRedisConnected() {
    return isConnected;
}

/**
 * Gracefully close Redis connection
 */
async function closeRedis() {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log("[Redis] Connection closed");
        } catch (error) {
            console.error("[Redis] Error closing connection:", error.message);
        }
    }
}

export {
    initRedis,
    cacheGet,
    cacheSet,
    cacheDel,
    cacheInvalidatePattern,
    isRedisConnected,
    closeRedis,
    redisClient,
};
