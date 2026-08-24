import * as eventService from "./event.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { invalidateEvents } from "../../utils/cacheInvalidation.js";

export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.studentId, req.body);
  await invalidateEvents(req.studentId);
  res.status(201).json({ success: true, data: event });
});

export const getEvents = asyncHandler(async (req, res) => {
  const data = await eventService.getEvents(req.studentId);
  res.status(200).json({ success: true, data });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.studentId, req.params.id, req.body);
  await invalidateEvents(req.studentId);
  res.status(200).json({ success: true, data: event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.studentId, req.params.id);
  await invalidateEvents(req.studentId);
  res.status(200).json({ success: true, message: "Event deleted successfully" });
});
