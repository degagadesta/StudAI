import { Chapa } from "chapa-nodejs";
import { config } from "../config/env.js";

/**
 * Chapa Payment Client
 * Supports both sandbox and production environments
 * Also supports mock mode for testing without API calls
 */

const chapaSecretKey = config.CHAPA_SECRET_KEY;
const chapaWebhookSecret = config.CHAPA_WEBHOOK_SECRET;
const paymentMode = config.paymentMode || "live";

if (!chapaSecretKey && paymentMode !== "mock") {
  console.warn("⚠️  CHAPA_SECRET_KEY is not set. Payment features will not work.");
}

if (paymentMode === "mock") {
  console.log("🧪 [Chapa] Running in MOCK mode - payments will be simulated");
}

// Initialize Chapa client
const chapa = paymentMode === "mock" ? null : new Chapa({
  secretKey: chapaSecretKey || "CHASECK_TEST-placeholder",
});

/**
 * Initialize a payment transaction
 * @param {Object} paymentData - Payment initialization data
 * @returns {Promise<Object>} Chapa checkout URL and transaction reference
 */
export async function initializePayment(paymentData) {
  const {
    amount,
    currency = "ETB",
    email,
    firstName,
    lastName,
    txRef,
    callbackUrl,
    returnUrl,
    customization = {},
  } = paymentData;

  // Mock mode - simulate successful payment initialization
  if (paymentMode === "mock") {
    console.log("🧪 [Chapa Mock] Simulating payment initialization:", {
      amount,
      currency,
      email,
      txRef,
    });

    // Simulate Chapa checkout URL with mock payment page
    const mockCheckoutUrl = `${config.frontendUrl}/mock-payment?tx_ref=${txRef}&amount=${amount}&email=${email}`;

    return {
      success: true,
      checkoutUrl: mockCheckoutUrl,
      txRef: txRef,
    };
  }

  // Real Chapa API mode
  try {
    const response = await chapa.initialize({
      amount: amount.toString(),
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: customization.title || "StudAI Subscription",
        description: customization.description || "Upgrade your study experience",
        logo: customization.logo,
      },
    });

    return {
      success: true,
      checkoutUrl: response.data.checkout_url,
      txRef: txRef,
    };
  } catch (error) {
    console.error("[Chapa] Payment initialization failed:", error);
    throw new Error(`Chapa payment initialization failed: ${error.message}`);
  }
}

/**
 * Verify a payment transaction
 * @param {string} txRef - Transaction reference
 * @returns {Promise<Object>} Payment verification details
 */
export async function verifyPayment(txRef) {
  // Mock mode - simulate successful payment verification
  if (paymentMode === "mock") {
    console.log("🧪 [Chapa Mock] Simulating payment verification for:", txRef);

    return {
      success: true,
      status: "success",
      amount: 149.00, // Mock amount
      currency: "ETB",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      txRef: txRef,
      reference: `mock-ref-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      raw: {
        status: "success",
        message: "Mock payment successful",
      },
    };
  }

  // Real Chapa API mode
  try {
    const response = await chapa.verify({ tx_ref: txRef });

    return {
      success: response.status === "success",
      status: response.data.status,
      amount: parseFloat(response.data.amount),
      currency: response.data.currency,
      email: response.data.email,
      firstName: response.data.first_name,
      lastName: response.data.last_name,
      txRef: response.data.tx_ref,
      reference: response.data.reference,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      raw: response.data,
    };
  } catch (error) {
    console.error("[Chapa] Payment verification failed:", error);
    throw new Error(`Chapa payment verification failed: ${error.message}`);
  }
}

/**
 * Verify webhook signature
 * @param {string} signature - Webhook signature from headers
 * @param {Object} payload - Webhook payload
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(signature, payload) {
  if (!chapaWebhookSecret) {
    console.warn("[Chapa] CHAPA_WEBHOOK_SECRET not set. Skipping signature verification.");
    return true; // Allow in development/testing
  }

  try {
    // Chapa uses HMAC-SHA256 for webhook signatures
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", chapaWebhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("[Chapa] Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Get payment status from Chapa status string
 * @param {string} chapaStatus - Status from Chapa (e.g., "success", "failed")
 * @returns {string} Normalized payment status
 */
export function normalizePaymentStatus(chapaStatus) {
  const statusMap = {
    success: "SUCCESS",
    failed: "FAILED",
    pending: "PENDING",
    cancelled: "CANCELLED",
  };

  return statusMap[chapaStatus?.toLowerCase()] || "PENDING";
}

/**
 * Generate unique transaction reference
 * @param {string} studentId - Student ID
 * @param {string} plan - Subscription plan
 * @returns {string} Unique transaction reference
 */
export function generateTxRef(studentId, plan) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SA-${plan}-${studentId.substring(0, 8)}-${timestamp}-${random}`;
}

export default {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  normalizePaymentStatus,
  generateTxRef,
};
