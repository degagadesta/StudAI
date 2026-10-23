import { Router } from "express";
import * as studyGroupController from "./studyGroup.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import * as validation from "./studyGroup.validation.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group management
router.post(
    "/",
    validate(validation.createGroupSchema),
    studyGroupController.createGroup
);

router.get("/", studyGroupController.getMyGroups);

router.post(
    "/join",
    validate(validation.joinGroupSchema),
    studyGroupController.joinGroup
);

router.get("/:groupId", studyGroupController.getGroupById);

router.patch(
    "/:groupId",
    validate(validation.updateGroupSchema),
    studyGroupController.updateGroup
);

router.delete("/:groupId", studyGroupController.deleteGroup);

router.post("/:groupId/leave", studyGroupController.leaveGroup);

// Member management
router.patch(
    "/:groupId/members/:memberId/role",
    validate(validation.updateMemberRoleSchema),
    studyGroupController.updateMemberRole
);

router.delete(
    "/:groupId/members/:memberId",
    studyGroupController.removeMember
);

// Messages
router.get("/:groupId/messages", studyGroupController.getMessages);

// Note sharing
router.post(
    "/:groupId/notes",
    validate(validation.shareNoteSchema),
    studyGroupController.shareNote
);

router.get("/:groupId/notes", studyGroupController.getSharedNotes);

export default router;
