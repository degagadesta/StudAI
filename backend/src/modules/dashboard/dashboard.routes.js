import { Router } from "express";
import { getDashboard, getDashboardPDFs } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getDashboard);
router.get("/pdfs", authenticate, getDashboardPDFs);

export default router;
