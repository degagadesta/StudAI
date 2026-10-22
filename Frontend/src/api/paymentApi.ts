import client from "./client";

export interface PaymentInitResponse {
  paymentId: string;
  checkoutUrl: string;
  txRef: string;
  amount: number;
  currency: string;
  plan: string;
  billingCycle: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  alreadyProcessed?: boolean;
  payment: {
    id: string;
    status: string;
    amount: number;
    plan: string;
    billingCycle: string;
  };
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  planUpgraded: string;
  billingCycle: string;
  createdAt: string;
  completedAt: string | null;
  transactionRef: string;
}

export interface SubscriptionHistory {
  id: string;
  previousPlan: string;
  newPlan: string;
  changedAt: string;
  expiresAt: string | null;
  reason: string | null;
  isActive: boolean;
}

export interface PlanInfo {
  id: string;
  name: string;
  pricing: {
    monthly: number;
    yearly: number;
  };
  limits: Record<string, number | null>;
  popular?: boolean;
}

/**
 * Initialize a subscription payment
 */
export async function initializePayment(
  plan: "STUDENT" | "PRO",
  billingCycle: "MONTHLY" | "YEARLY"
): Promise<PaymentInitResponse> {
  const response = await client.post("/payment/initialize", {
    plan,
    billingCycle,
  });
  return response.data.data;
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(
  txRef: string
): Promise<PaymentVerifyResponse> {
  const response = await client.get(`/payment/verify/${txRef}`);
  return response.data.data;
}

/**
 * Get payment history
 */
export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  const response = await client.get("/payment/history");
  return response.data.data;
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
  const response = await client.get("/payment/subscription-history");
  return response.data.data;
}

/**
 * Get available plans with pricing
 */
export async function getPlans(): Promise<PlanInfo[]> {
  const response = await client.get("/payment/plans");
  return response.data.data;
}
