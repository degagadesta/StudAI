import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import universityRoutes from "../modules/university/university.routes.js";
import departmentRoutes from "../modules/department/department.routes.js";
import onboardingRoutes from "../modules/onboarding/onboarding.routes.js";
import courseRoutes from "../modules/course/course.routes.js";

const router = Router();
router.use("/api/student/onboarding", onboardingRoutes);
router.use("/api/departments", departmentRoutes);
router.use("/universities", universityRoutes);
router.use("/auth", authRoutes);
router.use("/api/student/courses", courseRoutes);

export default router;
