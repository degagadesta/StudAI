import { Router } from "express";
import { getProfile } from "./profile.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getProfile);

export default router;
