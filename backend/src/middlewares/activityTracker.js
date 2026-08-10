import * as activityService from "../modules/activity/activity.service.js";

/**
 * Middleware to automatically track user activity
 * Updates or creates activity session on each authenticated request
 */
export async function trackActivity(req, res, next) {
    // Only track if user is authenticated
    if (!req.studentId) {
        return next();
    }

    // Get session ID from header (sent by frontend)
    const sessionId = req.headers["x-session-id"];

    try {
        if (sessionId) {
            // Try to update existing session
            try {
                await activityService.updateSessionActivity(sessionId);
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Session expired or not found, start new one
                    const result = await activityService.startOrResumeSession(req.studentId);
                    // Set new session ID in response header
                    res.setHeader("X-Session-Id", result.sessionId);
                }
                // Don't throw - activity tracking shouldn't break the request
            }
        } else {
            // No session ID provided, start or resume session
            const result = await activityService.startOrResumeSession(req.studentId);
            // Set session ID in response header so frontend can use it
            res.setHeader("X-Session-Id", result.sessionId);
        }
    } catch (err) {
        console.error("Activity tracking error:", err.message);
        // Don't fail the request if activity tracking fails
    }

    next();
}

/**
 * Optional: Apply to specific routes only
 * Use this if you want to track only certain activities
 */
export function trackActivityForRoutes(routes) {
    return (req, res, next) => {
        const shouldTrack = routes.some((route) => req.path.startsWith(route));
        if (shouldTrack) {
            return trackActivity(req, res, next);
        }
        next();
    };
}
