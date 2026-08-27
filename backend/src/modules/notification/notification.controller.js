import * as notificationService from "./notification.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getUpcomingEventNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUpcomingEventNotifications(
    req.studentId
  );

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await notificationService.markNotificationAsRead(
    req.studentId,
    id
  );

  res.status(200).json(result);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await notificationService.deleteNotification(
    req.studentId,
    id
  );

  res.status(200).json(result);
});
