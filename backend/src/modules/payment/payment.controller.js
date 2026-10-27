import * as paymentService from "./payment.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { verifyWebhookSignature } from "../../lib/chapaClient.js";

/**
 * POST /api/payment/initialize
 * Initialize a subscription payment
 */
export const initializePayment = asyncHandler(async (req, res) => {
  const studentId = req.studentId;
  const { plan, billingCycle } = req.body;

  if (!plan) {
    return res.status(400).json({
      success: false,
      error: "Plan is required (STUDENT or PRO)",
    });
  }

  if (!billingCycle) {
    return res.status(400).json({
      success: false,
      error: "Billing cycle is required (MONTHLY or YEARLY)",
    });
  }

  const result = await paymentService.initializeSubscriptionPayment(
    studentId,
    plan,
    billingCycle
  );

  res.status(200).json({
    success: true,
    message: "Payment initialized successfully",
    data: result,
  });
});

/**
 * GET /api/payment/verify/:txRef
 * Verify a payment transaction
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { txRef } = req.params;

  if (!txRef) {
    return res.status(400).json({
      success: false,
      error: "Transaction reference is required",
    });
  }

  const result = await paymentService.verifyAndProcessPayment(txRef);

  res.status(200).json({
    success: true,
    message: result.alreadyProcessed
      ? "Payment already processed"
      : result.success
      ? "Payment verified and processed successfully"
      : "Payment verification failed",
    data: result,
  });
});

/**
 * POST /api/payment/webhook
 * Handle Chapa webhook for payment notifications
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["chapa-signature"] || req.headers["x-chapa-signature"];
  const payload = req.body;

  // Verify webhook signature (optional in development)
  const isValid = verifyWebhookSignature(signature, payload);
  
  if (!isValid) {
    console.warn("[Webhook] Invalid signature received");
    // Don't fail in development, just log warning
    if (process.env.NODE_ENV === "production") {
      return res.status(401).json({
        success: false,
        error: "Invalid webhook signature",
      });
    }
  }

  try {
    const result = await paymentService.processWebhook(payload);

    // Respond quickly to Chapa
    res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    
    // Still return 200 to Chapa to prevent retries
    res.status(200).json({
      success: false,
      message: "Webhook received but processing failed",
    });
  }
});

/**
 * GET /api/payment/history
 * Get payment history for the authenticated student
 */
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const studentId = req.studentId;

  const history = await paymentService.getPaymentHistory(studentId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

/**
 * GET /api/payment/subscription-history
 * Get subscription history for the authenticated student
 */
export const getSubscriptionHistory = asyncHandler(async (req, res) => {
  const studentId = req.studentId;

  const history = await paymentService.getSubscriptionHistory(studentId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

/**
 * GET /api/payment/plans
 * Get available subscription plans with pricing
 */
export const getPlans = asyncHandler(async (req, res) => {
  const { PLAN_PRICING, PLAN_LIMITS } = await import("../../config/planLimits.js");

  const plans = [
    {
      id: "FREE",
      name: "Free",
      pricing: PLAN_PRICING.FREE,
      limits: PLAN_LIMITS.FREE,
    },
    {
      id: "STUDENT",
      name: "Student",
      pricing: PLAN_PRICING.STUDENT,
      limits: PLAN_LIMITS.STUDENT,
      popular: true,
    },
    {
      id: "PRO",
      name: "Pro",
      pricing: PLAN_PRICING.PRO,
      limits: PLAN_LIMITS.PRO,
    },
  ];

  res.status(200).json({
    success: true,
    data: plans,
  });
});
