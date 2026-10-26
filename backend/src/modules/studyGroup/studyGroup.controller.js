import * as studyGroupService from "./studyGroup.service.js";
import { AppError } from "../../utils/AppError.js";
import * as validation from "./studyGroup.validation.js";

/**
 * Create a new study group
 */
export async function createGroup(req, res, next) {
    try {
        console.log('=== CREATE GROUP BACKEND DEBUG ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const { error, value } = validation.createGroupSchema.validate(req.body);
        
        console.log('Validation error:', error);
        console.log('Validation value:', JSON.stringify(value, null, 2));
        
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const studentId = req.studentId;
        const group = await studyGroupService.createStudyGroup(studentId, value);
        res.status(201).json({
            success: true,
            data: group,
            message: "Study group created successfully",
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all study groups for current student
 */
export async function getMyGroups(req, res, next) {
    try {
        const studentId = req.studentId;
        const groups = await studyGroupService.getMyStudyGroups(studentId);
        res.json({
            success: true,
            data: groups,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get study group by ID
 */
export async function getGroupById(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId } = req.params;
        const group = await studyGroupService.getStudyGroupById(groupId, studentId);
        res.json({
            success: true,
            data: group,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Join a study group via invite code
 */
export async function joinGroup(req, res, next) {
    try {
        const { error, value } = validation.joinGroupSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const studentId = req.studentId;
        const { inviteCode } = value;
        const group = await studyGroupService.joinStudyGroup(studentId, inviteCode);
        res.json({
            success: true,
            data: group,
            message: "Successfully joined the study group",
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Leave a study group
 */
export async function leaveGroup(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId } = req.params;
        const result = await studyGroupService.leaveStudyGroup(studentId, groupId);
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a study group
 */
export async function deleteGroup(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId } = req.params;
        const result = await studyGroupService.deleteStudyGroup(studentId, groupId);
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update member role
 */
export async function updateMemberRole(req, res, next) {
    try {
        const { error, value } = validation.updateMemberRoleSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const studentId = req.studentId;
        const { groupId, memberId } = req.params;
        const { role } = value;
        const member = await studyGroupService.updateMemberRole(
            studentId,
            groupId,
            memberId,
            role
        );
        res.json({
            success: true,
            data: member,
            message: "Member role updated successfully",
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Remove a member from the group
 */
export async function removeMember(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId, memberId } = req.params;
        const result = await studyGroupService.removeMember(
            studentId,
            groupId,
            memberId
        );
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get group messages
 */
export async function getMessages(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        if (page < 1 || limit < 1 || limit > 100) {
            throw new AppError("Invalid pagination parameters", 400);
        }

        const result = await studyGroupService.getGroupMessages(
            studentId,
            groupId,
            page,
            limit
        );
        res.json({
            success: true,
            data: result.messages,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Share a note in the group
 */
export async function shareNote(req, res, next) {
    try {
        const { error, value } = validation.shareNoteSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const studentId = req.studentId;
        const { groupId } = req.params;
        const { noteId } = value;
        const sharedNote = await studyGroupService.shareNote(
            studentId,
            groupId,
            noteId
        );
        res.status(201).json({
            success: true,
            data: sharedNote,
            message: "Note shared successfully",
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get shared notes in a group
 */
export async function getSharedNotes(req, res, next) {
    try {
        const studentId = req.studentId;
        const { groupId } = req.params;
        const sharedNotes = await studyGroupService.getSharedNotes(
            studentId,
            groupId
        );
        res.json({
            success: true,
            data: sharedNotes,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update study group details
 */
export async function updateGroup(req, res, next) {
    try {
        const { error, value } = validation.updateGroupSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        const studentId = req.studentId;
        const { groupId } = req.params;
        const group = await studyGroupService.updateStudyGroup(
            studentId,
            groupId,
            value
        );
        res.json({
            success: true,
            data: group,
            message: "Study group updated successfully",
        });
    } catch (error) {
        next(error);
    }
}
