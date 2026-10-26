import { prisma } from "../../lib/prisma.js";
import { cacheGet, cacheSet, cacheDel } from "../../lib/redis.js";
import { AppError } from "../../utils/AppError.js";
import crypto from "crypto";

/**
 * Generate a unique 8-character alphanumeric invite code
 */
async function generateInviteCode() {
    let code;
    let exists = true;

    while (exists) {
        code = crypto.randomBytes(4).toString("hex").toUpperCase();
        const existing = await prisma.studyGroup.findUnique({
            where: { inviteCode: code },
        });
        exists = !!existing;
    }

    return code;
}

/**
 * Create a new study group
 */
export async function createStudyGroup(studentId, data) {
    const inviteCode = await generateInviteCode();

    // Sanitize empty strings to null for optional fields
    const curriculumCourseId = data.curriculumCourseId && data.curriculumCourseId.trim() !== "" 
        ? data.curriculumCourseId 
        : null;
    
    const subject = data.subject && data.subject.trim() !== "" 
        ? data.subject 
        : null;

    const group = await prisma.studyGroup.create({
        data: {
            name: data.name,
            subject: subject,
            curriculumCourseId: curriculumCourseId,
            inviteCode,
            createdById: studentId,
            members: {
                create: {
                    studentId,
                    role: "ADMIN",
                },
            },
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            _count: {
                select: { members: true },
            },
        },
    });

    // Cache the group
    await cacheSet(
        `study-group:${group.id}`,
        JSON.stringify(group),
        300 // 5 minutes
    );

    return group;
}

/**
 * Get study group by ID with members
 */
export async function getStudyGroupById(groupId, studentId) {
    // Check cache first
    const cached = await cacheGet(`study-group:${groupId}`);
    if (cached) {
        const group = JSON.parse(cached);
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
            throw new AppError("You are not a member of this group", 403);
        }
        return group;
    }

    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            members: {
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { joinedAt: "asc" },
            },
            _count: {
                select: {
                    messages: true,
                    sharedNotes: true,
                },
            },
        },
    });

    if (!group) {
        throw new AppError("Study group not found", 404);
    }

    // Verify membership
    const isMember = group.members.some((m) => m.studentId === studentId);
    if (!isMember) {
        throw new AppError("You are not a member of this group", 403);
    }

    // Cache for 5 minutes
    await cacheSet(
        `study-group:${groupId}`,
        JSON.stringify(group),
        300 // 5 minutes
    );

    return group;
}

/**
 * Get all study groups for a student
 */
export async function getMyStudyGroups(studentId) {
    const groups = await prisma.studyGroup.findMany({
        where: {
            members: {
                some: {
                    studentId,
                },
            },
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
            _count: {
                select: {
                    members: true,
                    messages: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    });

    return groups;
}

/**
 * Join a study group using invite code
 */
export async function joinStudyGroup(studentId, inviteCode) {
    const group = await prisma.studyGroup.findUnique({
        where: { inviteCode },
        include: {
            members: {
                where: { studentId },
            },
        },
    });

    if (!group) {
        throw new AppError("Invalid invite code", 404);
    }

    if (group.members.length > 0) {
        throw new AppError("You are already a member of this group", 400);
    }

    // Check member count limit (max 50 members)
    const memberCount = await prisma.studyGroupMember.count({
        where: { studyGroupId: group.id },
    });

    if (memberCount >= 50) {
        throw new AppError("This group has reached its member limit", 400);
    }

    const member = await prisma.studyGroupMember.create({
        data: {
            studyGroupId: group.id,
            studentId,
            role: "MEMBER",
        },
        include: {
            studyGroup: {
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: { members: true },
                    },
                },
            },
        },
    });

    // Invalidate cache
    await cacheDel(`study-group:${group.id}`);

    return member.studyGroup;
}

/**
 * Leave a study group
 */
export async function leaveStudyGroup(studentId, groupId) {
    const member = await prisma.studyGroupMember.findUnique({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId,
            },
        },
        include: {
            studyGroup: {
                select: {
                    createdById: true,
                },
            },
        },
    });

    if (!member) {
        throw new AppError("You are not a member of this group", 404);
    }

    // Prevent creator from leaving (must delete group instead)
    if (member.studyGroup.createdById === studentId) {
        throw new AppError(
            "Group creator cannot leave. Delete the group instead.",
            400
        );
    }

    await prisma.studyGroupMember.delete({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId,
            },
        },
    });

    // Invalidate cache
    await cacheDel(`study-group:${groupId}`);

    return { message: "Successfully left the group" };
}

/**
 * Delete a study group (admin only)
 */
export async function deleteStudyGroup(studentId, groupId) {
    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new AppError("Study group not found", 404);
    }

    if (group.createdById !== studentId) {
        throw new AppError("Only the group creator can delete the group", 403);
    }

    await prisma.studyGroup.delete({
        where: { id: groupId },
    });

    // Invalidate cache
    await cacheDel(`study-group:${groupId}`);

    return { message: "Study group deleted successfully" };
}

/**
 * Update member role (admin only)
 */
export async function updateMemberRole(studentId, groupId, memberId, role) {
    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        select: { createdById: true },
    });

    if (!group) {
        throw new AppError("Study group not found", 404);
    }

    if (group.createdById !== studentId) {
        throw new AppError("Only the group creator can update member roles", 403);
    }

    if (memberId === studentId) {
        throw new AppError("You cannot change your own role", 400);
    }

    const member = await prisma.studyGroupMember.update({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId: memberId,
            },
        },
        data: { role },
        include: {
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });

    // Invalidate cache
    await cacheDel(`study-group:${groupId}`);

    return member;
}

/**
 * Remove a member from group (admin only)
 */
export async function removeMember(studentId, groupId, memberId) {
    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
        select: { createdById: true },
    });

    if (!group) {
        throw new AppError("Study group not found", 404);
    }

    const requesterMember = await prisma.studyGroupMember.findUnique({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId,
            },
        },
    });

    if (!requesterMember || requesterMember.role !== "ADMIN") {
        throw new AppError("Only admins can remove members", 403);
    }

    if (memberId === group.createdById) {
        throw new AppError("Cannot remove the group creator", 400);
    }

    await prisma.studyGroupMember.delete({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId: memberId,
            },
        },
    });

    // Invalidate cache
    await cacheDel(`study-group:${groupId}`);

    return { message: "Member removed successfully" };
}

/**
 * Get group messages with pagination
 */
export async function getGroupMessages(studentId, groupId, page = 1, limit = 50) {
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
        throw new AppError("You are not a member of this group", 403);
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        prisma.groupMessage.findMany({
            where: { studyGroupId: groupId },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.groupMessage.count({
            where: { studyGroupId: groupId },
        }),
    ]);

    return {
        messages: messages.reverse(), // Oldest first
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Share a note in the group
 */
export async function shareNote(studentId, groupId, noteId) {
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
        throw new AppError("You are not a member of this group", 403);
    }

    // Verify note ownership
    const note = await prisma.note.findUnique({
        where: { id: noteId },
    });

    if (!note) {
        throw new AppError("Note not found", 404);
    }

    if (note.studentId !== studentId) {
        throw new AppError("You can only share your own notes", 403);
    }

    // Check if already shared
    const existing = await prisma.groupSharedNote.findFirst({
        where: {
            studyGroupId: groupId,
            noteId,
        },
    });

    if (existing) {
        throw new AppError("This note is already shared in the group", 400);
    }

    const sharedNote = await prisma.groupSharedNote.create({
        data: {
            studyGroupId: groupId,
            noteId,
            sharedById: studentId,
        },
        include: {
            note: true,
            sharedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    return sharedNote;
}

/**
 * Get shared notes in a group
 */
export async function getSharedNotes(studentId, groupId) {
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
        throw new AppError("You are not a member of this group", 403);
    }

    const sharedNotes = await prisma.groupSharedNote.findMany({
        where: { studyGroupId: groupId },
        include: {
            note: {
                include: {
                    curriculumCourse: {
                        include: {
                            course: {
                                select: {
                                    title: true,
                                },
                            },
                        },
                    },
                },
            },
            sharedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: { sharedAt: "desc" },
    });

    return sharedNotes;
}

/**
 * Get my notes (for sharing in study groups)
 */
export async function getMyNotes(studentId) {
    const notes = await prisma.note.findMany({
        where: {
            studentId,
        },
        include: {
            curriculumCourse: {
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
                select: {
                    id: true,
                    courseCode: true,
                    course: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return notes;
}

/**
 * Update study group details (admin only)
 */
export async function updateStudyGroup(studentId, groupId, data) {
    const group = await prisma.studyGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new AppError("Study group not found", 404);
    }

    const member = await prisma.studyGroupMember.findUnique({
        where: {
            studyGroupId_studentId: {
                studyGroupId: groupId,
                studentId,
            },
        },
    });

    if (!member || member.role !== "ADMIN") {
        throw new AppError("Only admins can update group details", 403);
    }

    const updated = await prisma.studyGroup.update({
        where: { id: groupId },
        data,
        include: {
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
            _count: {
                select: { members: true },
            },
        },
    });

    // Invalidate cache
    await cacheDel(`study-group:${groupId}`);

    return updated;
}
