import { Router } from "express";
import * as studyGroupController from "./studyGroup.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group management
router.post("/", studyGroupController.createGroup);
router.get("/", studyGroupController.getMyGroups);
router.post("/join", studyGroupController.joinGroup);
router.get("/:groupId", studyGroupController.getGroupById);
router.patch("/:groupId", studyGroupController.updateGroup);
router.delete("/:groupId", studyGroupController.deleteGroup);
router.post("/:groupId/leave", studyGroupController.leaveGroup);

// Member management
router.patch("/:groupId/members/:memberId/role", studyGroupController.updateMemberRole);
router.delete("/:groupId/members/:memberId", studyGroupController.removeMember);

// Messages
router.get("/:groupId/messages", studyGroupController.getMessages);

// Note sharing
router.post("/:groupId/notes", studyGroupController.shareNote);
router.get("/:groupId/notes", studyGroupController.getSharedNotes);

export default router;
