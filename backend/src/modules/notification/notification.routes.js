import { Router } from "express";
import {
  getUpcomingEventNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "./notification.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/upcoming-events", authenticate, getUpcomingEventNotifications);
router.patch("/:id/read", authenticate, markNotificationAsRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
