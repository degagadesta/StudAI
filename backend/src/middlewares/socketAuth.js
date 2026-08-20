import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { studentCache } from "../lib/studentCache.js";

/**
 * Socket.IO authentication middleware
 * Verifies JWT token and attaches studentId to socket
 */
export async function socketAuthMiddleware(socket, next) {
    try {
        // Extract token from handshake auth
        const token = socket.handshake.auth?.token;

        if (!token) {
            console.warn("[Socket.IO] Connection rejected: No token provided");
            return next(new Error("Authentication token required"));
        }

        // Verify JWT token (same logic as REST API)
        const decoded = jwt.verify(token, env.jwtSecret);

        if (!decoded.studentId) {
            console.warn("[Socket.IO] Connection rejected: Invalid token payload");
            return next(new Error("Invalid token"));
        }

        // Check cache first, then DB — mirrors the HTTP authenticate middleware
        if (!studentCache.has(decoded.studentId)) {
            const student = await prisma.student.findUnique({
                where: { id: decoded.studentId },
                select: { id: true },
            });
            if (!student) {
                console.warn(`[Socket.IO] Connection rejected: Account ${decoded.studentId} not found`);
                return next(new Error("Account not found"));
            }
            studentCache.set(decoded.studentId);
        }

        // Attach studentId to socket data
        socket.data.studentId = decoded.studentId;
        socket.data.email = decoded.email;

        // Join student-specific room
        const room = `student:${decoded.studentId}`;
        socket.join(room);

        console.log(
            `[Socket.IO] Student ${decoded.studentId} authenticated and joined ${room}`
        );

        next();
    } catch (error) {
        console.error("[Socket.IO] Authentication error:", error.message);

        if (error.name === "TokenExpiredError") {
            return next(new Error("Token expired"));
        }

        return next(new Error("Authentication failed"));
    }
}
