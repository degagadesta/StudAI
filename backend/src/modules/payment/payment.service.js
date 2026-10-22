import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  initializePayment,
  verifyPayment,
  generateTxRef,
  normalizePaymentStatus,
} from "../../lib/chapaClient.js";
import { PLAN_PRICING } from "../../config/planLimits.js";
import { env } from "../../config/env.js";

/**
 * Initialize a subscription payment
 * @param {string} studentId - Student ID
 * @param {string} plan - Subscription plan (STUDENT or PRO)
 * @param {string} billingCycle - MONTHLY or YEARLY
 * @returns {Promise<Object>} Payment initialization result with checkout URL
 */
export async function initializeSubscriptionPayment(studentId, plan, billingCycle) {
  // Validate plan
  if (!["STUDENT", "PRO"].includes(plan)) {
    throw new AppError("Invalid subscription plan. Choose STUDENT or PRO", 400);
  }

  // Validate billing cycle
  if (!["MONTHLY", "YEARLY"].includes(billingCycle)) {
    throw new AppError("Invalid billing cycle. Choose MONTHLY or YEARLY", 400);
  }

  // Get student details
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      subscriptionPlan: true,
    },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Check if already on this plan
  if (student.subscriptionPlan === plan) {
    throw new AppError(`You are already on the ${plan} plan`, 400);
  }

  // Get pricing
  const pricing = PLAN_PRICING[plan];
  if (!pricing) {
    throw new AppError("Pricing not found for this plan", 500);
  }

  const amount = billingCycle === "MONTHLY" ? pricing.monthly : pricing.yearly;

  // Generate unique transaction reference
  const txRef = generateTxRef(studentId, plan);

  // Create payment record in database
  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
      currency: "ETB",
      status: "PENDING",
      provider: "CHAPA",
      transactionRef: txRef,
      planUpgraded: plan,
      billingCycle,
      metadata: {
        studentEmail: student.email,
        studentName: `${student.firstName} ${student.lastName}`,
        previousPlan: student.subscriptionPlan,
      },
    },
  });

  // Initialize Chapa payment
  try {
    const callbackUrl = `${env.frontendUrl}/api/payment/webhook`;
    const returnUrl = `${env.frontendUrl}/payment/success?tx_ref=${txRef}`;

    const chapaResponse = await initializePayment({
      amount,
      currency: "ETB",
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      txRef,
      callbackUrl,
      returnUrl,
      customization: {
        title: `StudAI ${plan} Plan`,
        description: `${billingCycle === "MONTHLY" ? "Monthly" : "Yearly"} subscription`,
        logo: `${env.frontendUrl}/logo.png`,
      },
    });

    // Update payment with Chapa response
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerResponse: chapaResponse,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: chapaResponse.checkoutUrl,
      txRef: chapaResponse.txRef,
      amount,
      currency: "ETB",
      plan,
      billingCycle,
    };
  } catch (error) {
    // Mark payment as failed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        metadata: {
          ...payment.metadata,
          error: error.message,
        },
      },
    });

    throw new AppError(`Payment initialization failed: ${error.message}`, 500);
  }
}

/**
 * Verify and process a payment
 * @param {string} txRef - Transaction reference
 * @returns {Promise<Object>} Payment verification result
 */
export async function verifyAndProcessPayment(txRef) {
  // Find payment record
  const payment = await prisma.payment.findUnique({
    where: { transactionRef: txRef },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          subscriptionPlan: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // If already processed, return existing result
  if (payment.status === "SUCCESS") {
    return {
      alreadyProcessed: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        plan: payment.planUpgraded,
      },
    };
  }

  // Verify with Chapa
  let verificationResult;
  try {
    verificationResult = await verifyPayment(txRef);
  } catch (error) {
    throw new AppError(`Payment verification failed: ${error.message}`, 500);
  }

  // Update payment status
  const paymentStatus = normalizePaymentStatus(verificationResult.status);

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: paymentStatus,
      chapaReference: verificationResult.reference,
      providerResponse: verificationResult.raw,
      completedAt: paymentStatus === "SUCCESS" ? new Date() : null,
    },
  });

  // If payment successful, upgrade subscription
  if (paymentStatus === "SUCCESS") {
    await upgradeStudentSubscription(
      payment.studentId,
      payment.planUpgraded,
      payment.billingCycle,
      payment.id
    );
  }

  return {
    success: paymentStatus === "SUCCESS",
    payment: {
      id: payment.id,
      status: paymentStatus,
      amount: payment.amount,
      plan: payment.planUpgraded,
      billingCycle: payment.billingCycle,
    },
  };
}

/**
 * Upgrade student's subscription plan
 * @param {string} studentId - Student ID
 * @param {string} newPlan - New subscription plan
 * @param {string} billingCycle - Billing cycle
 * @param {string} paymentId - Payment ID
 */
async function upgradeStudentSubscription(studentId, newPlan, billingCycle, paymentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Calculate expiration date
  const now = new Date();
  const expiresAt = new Date(now);
  
  if (billingCycle === "MONTHLY") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  // Update student subscription
  await prisma.student.update({
    where: { id: studentId },
    data: {
      subscriptionPlan: newPlan,
      subscriptionExpiresAt: expiresAt,
    },
  });

  // Create subscription history record
  await prisma.subscriptionHistory.create({
    data: {
      studentId,
      previousPlan: student.subscriptionPlan,
      newPlan,
      expiresAt,
      reason: `Upgraded via ${billingCycle} payment`,
      paymentId,
      isActive: true,
    },
  });

  console.log(`[Payment] Successfully upgraded student ${studentId} to ${newPlan}`);
}

/**
 * Process webhook from Chapa
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export async function processWebhook(webhookData) {
  const { tx_ref, status } = webhookData;

  if (!tx_ref) {
    throw new AppError("Missing transaction reference in webhook", 400);
  }

  // Verify and process the payment
  try {
    const result = await verifyAndProcessPayment(tx_ref);
    return result;
  } catch (error) {
    console.error("[Webhook] Processing failed:", error);
    throw error;
  }
}

/**
 * Get payment history for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Payment history
 */
export async function getPaymentHistory(studentId) {
  const payments = await prisma.payment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      planUpgraded: true,
      billingCycle: true,
      createdAt: true,
      completedAt: true,
      transactionRef: true,
    },
  });

  return payments;
}

/**
 * Get subscription history for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Subscription history
 */
export async function getSubscriptionHistory(studentId) {
  const history = await prisma.subscriptionHistory.findMany({
    where: { studentId },
    orderBy: { changedAt: "desc" },
    select: {
      id: true,
      previousPlan: true,
      newPlan: true,
      changedAt: true,
      expiresAt: true,
      reason: true,
      isActive: true,
    },
  });

  return history;
}
