import { Router } from "express";
import { getDashboard, getDashboardPDFs } from "./dashboard.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { cacheStudentData } from "../../middlewares/cache.js";

const router = Router();

// Cache dashboard data for 30 seconds (frequently updated)
router.get("/", authenticate, cacheStudentData("dashboard", 30), getDashboard);
// Cache dashboard PDFs for 2 minutes
router.get("/pdfs", authenticate, cacheStudentData("dashboard:pdfs", 120), getDashboardPDFs);

export default router;
