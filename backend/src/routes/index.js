import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import universityRoutes from "../modules/university/university.routes.js";
import departmentRoutes from "../modules/department/department.routes.js";
import onboardingRoutes from "../modules/onboarding/onboarding.routes.js";
import courseRoutes from "../modules/course/course.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import pdfRoutes from "../modules/pdf/pdf.routes.js";
import examRoutes from "../modules/exam/exam.routes.js";

const router = Router();
router.use("/api/student/onboarding", onboardingRoutes);
router.use("/api/departments", departmentRoutes);
router.use("/universities", universityRoutes);
router.use("/auth", authRoutes);
router.use("/api/student/courses", courseRoutes);
router.use("/api/student/dashboard", dashboardRoutes);
router.use("/api/student/pdfs", pdfRoutes);
router.use("/api/student/exams", examRoutes);

export default router;
