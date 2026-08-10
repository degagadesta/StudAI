import { sendHeartbeat, endSession } from "../api/activityApi";

class ActivityTracker {
    private sessionId: string | null = null;
    private heartbeatInterval: number | null = null;
    private isActive: boolean = false;
    private readonly HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

    /**
     * Start tracking activity
     */
    start() {
        if (this.isActive) {
            return; // Already tracking
        }

        this.isActive = true;
        this.startHeartbeat();
        this.attachVisibilityHandlers();

        console.log("[ActivityTracker] Started");
    }

    /**
     * Stop tracking activity
     */
    async stop() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        this.stopHeartbeat();

        // Close current session
        if (this.sessionId) {
            try {
                await endSession(this.sessionId);
                console.log("[ActivityTracker] Session closed:", this.sessionId);
            } catch (err) {
                console.error("[ActivityTracker] Error closing session:", err);
            }
            this.sessionId = null;
        }

        console.log("[ActivityTracker] Stopped");
    }

    /**
     * Start heartbeat timer
     */
    private startHeartbeat() {
        // Send initial heartbeat immediately
        this.sendHeartbeatNow();

        // Set up interval
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeatNow();
        }, this.HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Stop heartbeat timer
     */
    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Send heartbeat immediately
     */
    private async sendHeartbeatNow() {
        // Don't send if page is hidden
        if (document.visibilityState === "hidden") {
            return;
        }

        try {
            const result = await sendHeartbeat(this.sessionId || undefined);
            this.sessionId = result.sessionId;
            console.log("[ActivityTracker] Heartbeat sent, session:", this.sessionId);
        } catch (err: any) {
            console.error("[ActivityTracker] Heartbeat failed:", err);

            // If session expired, try to start new one
            if (err?.response?.status === 410 || err?.response?.status === 404) {
                try {
                    const result = await sendHeartbeat();
                    this.sessionId = result.sessionId;
                    console.log("[ActivityTracker] New session started:", this.sessionId);
                } catch (retryErr) {
                    console.error("[ActivityTracker] Failed to start new session:", retryErr);
                }
            }
        }
    }

    /**
     * Handle page visibility changes
     */
    private attachVisibilityHandlers() {
        document.addEventListener("visibilitychange", this.handleVisibilityChange);
        window.addEventListener("beforeunload", this.handleBeforeUnload);
    }

    /**
     * Handle visibility change event
     */
    private handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            console.log("[ActivityTracker] Page visible, resuming heartbeat");
            if (this.isActive && !this.heartbeatInterval) {
                this.startHeartbeat();
            }
        } else {
            console.log("[ActivityTracker] Page hidden, pausing heartbeat");
            this.stopHeartbeat();
        }
    };

    /**
     * Handle page unload (close/refresh)
     */
    private handleBeforeUnload = async () => {
        // Try to close session before page closes
        if (this.sessionId) {
            // Use sendBeacon for reliable delivery during page unload
            const data = JSON.stringify({ sessionId: this.sessionId });
            const blob = new Blob([data], { type: "application/json" });

            // Try to send close request (may or may not complete)
            navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/activity/end`, blob);

            console.log("[ActivityTracker] Beacon sent for session close");
        }
    };

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.sessionId;
    }

    /**
     * Check if tracking is active
     */
    isTracking(): boolean {
        return this.isActive;
    }
}

// Export singleton instance
export const activityTracker = new ActivityTracker();
