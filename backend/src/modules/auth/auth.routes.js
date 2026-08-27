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
  checkProfileHandler,
  deleteAccountHandler,
} from "./auth.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Strict rate limiter for account deletion (3 attempts per hour)
const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: "Too many deletion attempts. Please try again later" }
});

router.post("/register", authLimiter, registerHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/login", authLimiter, loginHandler);
router.post("/forgot-password", authLimiter, forgotPasswordHandler);
router.post("/reset-password", authLimiter, resetPasswordHandler);
router.post("/google", authLimiter, googleSignInHandler);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", authenticate, logoutHandler);
router.get("/check-profile", authenticate, checkProfileHandler);
router.delete("/account", authenticate, deleteLimiter, deleteAccountHandler);

export default router;
