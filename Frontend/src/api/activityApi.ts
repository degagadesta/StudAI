import { api } from "./client";

/**
 * Activity session interface
 */
export interface ActivitySession {
    sessionId: string;
    startedAt: string;
    lastActiveAt?: string;
    isNew?: boolean;
    currentDuration?: number;
}

/**
 * Session statistics
 */
export interface SessionStats {
    sessionCount: number;
    totalDuration: number; // seconds
    totalHours: number;
    averageDuration: number; // seconds
}

/**
 * Start or resume activity session
 */
export async function startSession(): Promise<ActivitySession> {
    const res = await api.post<{
        success: boolean;
        message: string;
        data: ActivitySession;
    }>("/activity/start");
    return res.data.data;
}

/**
 * Send heartbeat to keep session alive
 * @param sessionId - Current session ID (optional, will start new if not provided)
 */
export async function sendHeartbeat(sessionId?: string): Promise<ActivitySession> {
    const res = await api.post<{
        success: boolean;
        message: string;
        data: ActivitySession;
    }>("/activity/heartbeat", { sessionId });

    return res.data.data;
}

/**
 * End current activity session
 * @param sessionId - Session ID to end
 */
export async function endSession(sessionId: string): Promise<{
    sessionId: string;
    duration: number;
    alreadyClosed: boolean;
}> {
    const res = await api.post<{
        success: boolean;
        message: string;
        data: {
            sessionId: string;
            duration: number;
            alreadyClosed: boolean;
        };
    }>("/activity/end", { sessionId });

    return res.data.data;
}

/**
 * Get current active session
 */
export async function getActiveSession(): Promise<ActivitySession | null> {
    const res = await api.get<{
        success: boolean;
        data: ActivitySession | null;
    }>("/activity/current");

    return res.data.data;
}

/**
 * Get session statistics
 * @param startDate - Start date (optional, defaults to 30 days ago)
 * @param endDate - End date (optional, defaults to now)
 */
export async function getSessionStats(
    startDate?: string,
    endDate?: string
): Promise<SessionStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await api.get<{
        success: boolean;
        data: SessionStats;
    }>("/activity/stats", { params });

    return res.data.data;
}
