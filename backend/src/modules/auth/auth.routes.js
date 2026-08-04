import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  googleSignInHandler,
  refreshTokenHandler,
  logoutHandler,
} from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/register", authLimiter, registerHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/forgot-password", authLimiter, forgotPasswordHandler);
router.post("/reset-password", authLimiter, resetPasswordHandler);
router.post("/google", authLimiter, googleSignInHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", authenticate, logoutHandler);

export default router;
