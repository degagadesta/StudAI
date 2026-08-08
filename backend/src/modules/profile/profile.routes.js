import { Router } from "express";
import { getProfile, getFullProfile, updateBasicInfo, updateAcademicInfo } from "./profile.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getProfile);
router.get("/full", authenticate, getFullProfile);
router.patch("/basic", authenticate, updateBasicInfo);
router.patch("/academic", authenticate, updateAcademicInfo);

export default router;
