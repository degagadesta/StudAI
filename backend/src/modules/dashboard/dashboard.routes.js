import { Router } from "express";
import { getDashboard } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getDashboard);

export default router;
