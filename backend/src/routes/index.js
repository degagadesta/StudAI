import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);
// router.use("/courses", courseRoutes);  // add as you build later phases

export default router;
