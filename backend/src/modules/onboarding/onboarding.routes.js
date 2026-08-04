import { Router } from "express";
import { onboarding } from "./onboarding.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post("/", authenticate, onboarding);

export default router;