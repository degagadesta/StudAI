import { Server } from "socket.io";
import { env } from "../config/env.js";
import { socketAuthMiddleware } from "../middlewares/socketAuth.js";
import { setupSocketHandlers } from "../sockets/index.js";

let io = null;

/**
 * Initialize Socket.IO server
 */
export function initSocketIO(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: env.socketCorsOrigin,
            credentials: true,
        },
        path: env.socketPath,
    });

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Setup event handlers
    setupSocketHandlers(io);

    console.log("[Socket.IO] Server initialized");

    return io;
}

/**
 * Emit event to a specific student's room
 */
export function emitToStudent(studentId, event, data) {
    if (!io) {
        console.warn("[Socket.IO] Not initialized, cannot emit event");
        return;
    }

    const room = `student:${studentId}`;
    io.to(room).emit(event, data);
    console.log(`[Socket.IO] Emitted "${event}" to ${room}`);
}

/**
 * Emit event to a specific course room
 */
export function emitToCourse(courseId, event, data) {
    if (!io) {
        console.warn("[Socket.IO] Not initialized, cannot emit event");
        return;
    }

    const room = `course:${courseId}`;
    io.to(room).emit(event, data);
    console.log(`[Socket.IO] Emitted "${event}" to ${room}`);
}

/**
 * Get Socket.IO instance
 */
export function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}

export { io };
