import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { createEvent, getEvents, updateEvent, deleteEvent } from "./event.controller.js";

const router = Router();

router.post("/", authenticate, createEvent);
router.get("/", authenticate, getEvents);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

export default router;
