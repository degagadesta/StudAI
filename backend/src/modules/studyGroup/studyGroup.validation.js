import Joi from "joi";

/**
 * Validation schema for creating a study group
 */
export const createGroupSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Group name is required",
        "string.min": "Group name must be at least 3 characters",
        "string.max": "Group name cannot exceed 100 characters",
    }),
    subject: Joi.string().max(100).optional().allow(""),
    curriculumCourseId: Joi.string().uuid().optional().allow(null, ""),
});

/**
 * Validation schema for joining a group via invite code
 */
export const joinGroupSchema = Joi.object({
    inviteCode: Joi.string().length(8).alphanum().required().messages({
        "string.empty": "Invite code is required",
        "string.length": "Invite code must be 8 characters",
    }),
});

/**
 * Validation schema for updating group member role
 */
export const updateMemberRoleSchema = Joi.object({
    role: Joi.string().valid("ADMIN", "MEMBER").required().messages({
        "any.only": "Role must be either ADMIN or MEMBER",
    }),
});

/**
 * Validation schema for sending a message
 */
export const sendMessageSchema = Joi.object({
    content: Joi.string().min(1).max(2000).required().messages({
        "string.empty": "Message content is required",
        "string.max": "Message cannot exceed 2000 characters",
    }),
    type: Joi.string().valid("TEXT", "NOTE_SHARE", "FLASHCARD_SHARE").default("TEXT"),
    sharedResourceId: Joi.string().uuid().optional(),
});

/**
 * Validation schema for sharing a note
 */
export const shareNoteSchema = Joi.object({
    noteId: Joi.string().uuid().required().messages({
        "string.empty": "Note ID is required",
    }),
});

/**
 * Validation schema for updating group details
 */
export const updateGroupSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    subject: Joi.string().max(100).optional().allow(""),
    curriculumCourseId: Joi.string().uuid().optional().allow(null),
});
