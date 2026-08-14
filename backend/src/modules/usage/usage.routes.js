import { Router } from "express";
import { getUsage } from "./usage.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getUsage);

export default router;
