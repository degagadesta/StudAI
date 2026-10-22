import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getSubscriptionHistory,
  getPlans,
} from "./payment.controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

// Public routes
router.get("/plans", getPlans);
router.post("/webhook", handleWebhook); // No auth - Chapa calls this

// Protected routes (require authentication)
router.post("/initialize", authenticate, initializePayment);
router.get("/verify/:txRef", authenticate, verifyPayment);
router.get("/history", authenticate, getPaymentHistory);
router.get("/subscription-history", authenticate, getSubscriptionHistory);

export default router;
