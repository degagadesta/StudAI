import { prisma } from "../lib/prisma.js";

/**
 * Main Socket.IO event handlers setup
 */
export function setupSocketHandlers(io) {
    io.on("connection", (socket) => {
        const { studentId } = socket.data;

        console.log(`[Socket.IO] Student ${studentId} connected (${socket.id})`);

        // Handle disconnection
        socket.on("disconnect", (reason) => {
            console.log(
                `[Socket.IO] Student ${studentId} disconnected: ${reason} (${socket.id})`
            );
        });

        // Handle errors
        socket.on("error", (error) => {
            console.error(
                `[Socket.IO] Socket error for student ${studentId}:`,
                error.message
            );
        });

        // Ping-pong for connection health check
        socket.on("ping", () => {
            socket.emit("pong");
        });

        // Join course room — verifies student is enrolled before allowing
        socket.on("join:course", async (courseId) => {
            try {
                // Validate courseId format
                if (!courseId || typeof courseId !== 'string') {
                    socket.emit("error", { message: "Invalid course ID format" });
                    return;
                }

                const profile = await prisma.studentProfile.findUnique({
                    where: { studentId },
                    select: { curriculumId: true },
                });

                if (!profile) {
                    socket.emit("error", { message: "Complete onboarding before joining a course room" });
                    return;
                }

                const enrolled = await prisma.curriculumCourse.findFirst({
                    where: { curriculumId: profile.curriculumId, courseId },
                });

                if (!enrolled) {
                    socket.emit("error", { message: "Not enrolled in this course" });
                    return;
                }

                const room = `course:${courseId}`;
                socket.join(room);
                console.log(`[Socket.IO] Student ${studentId} joined ${room}`);
            } catch (err) {
                console.error(`[Socket.IO] join:course error:`, err.message);
                socket.emit("error", { message: "Failed to join course room" });
            }
        });

        // Leave course room
        socket.on("leave:course", (courseId) => {
            // Validate courseId format
            if (!courseId || typeof courseId !== 'string') {
                socket.emit("error", { message: "Invalid course ID format" });
                return;
            }

            const room = `course:${courseId}`;
            socket.leave(room);
            console.log(`[Socket.IO] Student ${studentId} left ${room}`);
        });
    });

    console.log("[Socket.IO] Event handlers registered");
}
