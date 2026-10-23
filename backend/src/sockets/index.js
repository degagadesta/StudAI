import { prisma } from "../lib/prisma.js";

/**
 * Main Socket.IO event handlers setup
 */
export function setupSocketHandlers(io) {
    io.on("connection", (socket) => {
        const { studentId } = socket.data;

        if (studentId) {
            socket.join(`student:${studentId}`);
            console.log(`[Socket.IO] Student ${studentId} connected (${socket.id}) and joined student:${studentId}`);
        }

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

        // ========= STUDY GROUP SOCKET EVENTS =========

        // Join study group room
        socket.on("join:group", async (groupId) => {
            try {
                if (!groupId || typeof groupId !== 'string') {
                    socket.emit("error", { message: "Invalid group ID format" });
                    return;
                }

                // Verify membership
                const member = await prisma.studyGroupMember.findUnique({
                    where: {
                        studyGroupId_studentId: {
                            studyGroupId: groupId,
                            studentId,
                        },
                    },
                });

                if (!member) {
                    socket.emit("error", { message: "Not a member of this group" });
                    return;
                }

                const room = `group:${groupId}`;
                socket.join(room);
                console.log(`[Socket.IO] Student ${studentId} joined ${room}`);

                // Notify other members
                socket.to(room).emit("group:member-joined", {
                    groupId,
                    studentId,
                });
            } catch (err) {
                console.error(`[Socket.IO] join:group error:`, err.message);
                socket.emit("error", { message: "Failed to join group room" });
            }
        });

        // Leave study group room
        socket.on("leave:group", (groupId) => {
            if (!groupId || typeof groupId !== 'string') {
                socket.emit("error", { message: "Invalid group ID format" });
                return;
            }

            const room = `group:${groupId}`;
            socket.leave(room);
            console.log(`[Socket.IO] Student ${studentId} left ${room}`);
        });

        // Send message in study group
        socket.on("group:message", async (data) => {
            try {
                const { groupId, content, type = "TEXT", sharedResourceId } = data;

                if (!groupId || !content) {
                    socket.emit("error", { message: "Missing required fields" });
                    return;
                }

                // Verify membership
                const member = await prisma.studyGroupMember.findUnique({
                    where: {
                        studyGroupId_studentId: {
                            studyGroupId: groupId,
                            studentId,
                        },
                    },
                });

                if (!member) {
                    socket.emit("error", { message: "Not a member of this group" });
                    return;
                }

                // Rate limiting: max 10 messages per minute
                const rateLimitKey = `rate:group-message:${studentId}:${groupId}`;
                const messageCount = await prisma.$queryRaw`
                    SELECT COUNT(*) as count 
                    FROM "GroupMessage" 
                    WHERE "senderId" = ${studentId} 
                    AND "studyGroupId" = ${groupId}
                    AND "createdAt" > NOW() - INTERVAL '1 minute'
                `;

                if (Number(messageCount[0]?.count) >= 10) {
                    socket.emit("error", { message: "Rate limit exceeded. Please wait." });
                    return;
                }

                // Save message
                const message = await prisma.groupMessage.create({
                    data: {
                        studyGroupId: groupId,
                        senderId: studentId,
                        content,
                        type,
                        sharedResourceId,
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });

                // Broadcast to all group members
                io.to(`group:${groupId}`).emit("group:new-message", message);

                console.log(`[Socket.IO] Message sent in group ${groupId} by ${studentId}`);
            } catch (err) {
                console.error(`[Socket.IO] group:message error:`, err.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Typing indicator
        socket.on("group:typing", async (data) => {
            try {
                const { groupId, isTyping } = data;

                if (!groupId) return;

                // Verify membership
                const member = await prisma.studyGroupMember.findUnique({
                    where: {
                        studyGroupId_studentId: {
                            studyGroupId: groupId,
                            studentId,
                        },
                    },
                    include: {
                        student: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });

                if (!member) return;

                // Broadcast to other members (not self)
                socket.to(`group:${groupId}`).emit("group:member-typing", {
                    groupId,
                    studentId,
                    name: `${member.student.firstName} ${member.student.lastName}`,
                    isTyping,
                });
            } catch (err) {
                console.error(`[Socket.IO] group:typing error:`, err.message);
            }
        });

        // Member removed/left event (triggered by API)
        socket.on("group:member-removed", (data) => {
            const { groupId, memberId } = data;
            if (groupId && memberId) {
                io.to(`group:${groupId}`).emit("group:member-left", {
                    groupId,
                    memberId,
                });
            }
        });
    });

    console.log("[Socket.IO] Event handlers registered");
}
