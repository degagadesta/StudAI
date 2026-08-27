import { Router } from "express";
import {
  getProfile,
  getFullProfile,
  updateProfileController,
} from "./profile.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getProfile);
router.get("/full", authenticate, getFullProfile);
router.patch("/profileUpdate", authenticate, updateProfileController);

export default router;
