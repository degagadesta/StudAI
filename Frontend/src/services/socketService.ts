import { io, Socket } from "socket.io-client";

class SocketService {
    private socket: Socket | null = null;
    private isConnecting: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    /**
     * Connect to Socket.IO server with authentication token
     */
    connect(token: string): void {
        if (this.socket?.connected) {
            console.log("[Socket] Already connected");
            return;
        }

        if (this.isConnecting) {
            console.log("[Socket] Connection already in progress");
            return;
        }

        this.isConnecting = true;

        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
        const socketPath = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

        console.log("[Socket] Connecting to:", socketUrl);

        this.socket = io(socketUrl, {
            path: socketPath,
            auth: {
                token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.setupEventHandlers();
    }

    /**
     * Setup Socket.IO event handlers
     */
    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            console.log("[Socket] Connected successfully", this.socket?.id);
            this.isConnecting = false;
            this.reconnectAttempts = 0;
        });

        this.socket.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected:", reason);
            this.isConnecting = false;
        });

        this.socket.on("connect_error", (error) => {
            console.error("[Socket] Connection error:", error.message);
            this.isConnecting = false;
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error("[Socket] Max reconnection attempts reached");
                this.disconnect();
            }
        });

        this.socket.on("error", (error) => {
            console.error("[Socket] Socket error:", error);
        });

        // Ping-pong for connection health
        this.socket.on("pong", () => {
            console.log("[Socket] Pong received");
        });
    }

    /**
     * Disconnect from Socket.IO server
     */
    disconnect(): void {
        if (this.socket) {
            console.log("[Socket] Disconnecting...");
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
    }

    /**
     * Subscribe to an event
     */
    on(event: string, callback: (...args: unknown[]) => void): void {
        if (!this.socket) {
            console.warn(`[Socket] Cannot subscribe to "${event}": not connected`);
            return;
        }

        this.socket.on(event, callback);
        console.log(`[Socket] Subscribed to "${event}"`);
    }

    /**
     * Unsubscribe from an event
     */
    off(event: string, callback?: (...args: unknown[]) => void): void {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }

        console.log(`[Socket] Unsubscribed from "${event}"`);
    }

    /**
     * Emit an event to server
     */
    emit(event: string, data?: unknown): void {
        if (!this.socket?.connected) {
            console.warn(`[Socket] Cannot emit "${event}": not connected`);
            return;
        }

        this.socket.emit(event, data);
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get socket ID
     */
    getSocketId(): string | undefined {
        return this.socket?.id;
    }

    /**
     * Send ping to server
     */
    ping(): void {
        this.emit("ping");
    }

    /**
     * Join a course room
     */
    joinCourse(courseId: string): void {
        this.emit("join:course", courseId);
    }

    /**
     * Leave a course room
     */
    leaveCourse(courseId: string): void {
        this.emit("leave:course", courseId);
    }
}

// Export singleton instance
export const socketService = new SocketService();
