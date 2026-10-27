export type SubscriptionTier = "free" | "student" | "pro";

export interface PlanFeature {
  label: string;
  sub?: string;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  price: string;
  priceYearly?: string;
  priceSuffix: string;
  features: PlanFeature[];
  unlimited?: boolean;
  badge?: string;
  popular?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "0 ETB",
    priceSuffix: "/month",
    features: [
      { label: "5 PDF uploads per month" },
      { label: "10 AI summaries per month" },
      { label: "50 flashcards per month" },
      { label: "100 AI chat messages per month" },
      { label: "10 quiz generations per month" },
      { label: "6 active courses" },
      { label: "Previous exams (last 2 years)" },
      { label: "Basic study timer" },
      { label: "Unlimited note-taking" },
    ],
  },
  {
    id: "student",
    name: "Student",
    price: "149 ETB",
    priceYearly: "1,200 ETB",
    priceSuffix: "/month",
    popular: true,
    badge: "Most Popular",
    features: [
      { label: "25 PDF uploads per month" },
      { label: "Unlimited AI summaries" },
      { label: "Unlimited flashcards" },
      { label: "1,000 AI chat messages per month" },
      { label: "Unlimited quiz practice" },
      { label: "10 active courses" },
      { label: "All previous exams (all years)" },
      { label: "Advanced study timer with Pomodoro" },
      { label: "Full analytics dashboard" },
      { label: "Join study groups" },
      { label: "Export notes to PDF" },
      { label: "Priority email support (24h)" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "249 ETB",
    priceYearly: "2,400 ETB",
    priceSuffix: "/month",
    badge: "Best Value",
    unlimited: true,
    features: [
      { label: "Unlimited PDF uploads" },
      { label: "Unlimited AI summaries" },
      { label: "Unlimited flashcards" },
      { label: "Unlimited AI chat messages" },
      { label: "Unlimited quiz practice" },
      { label: "Unlimited active courses" },
      { label: "All previous exams + AI solutions" },
      { label: "Advanced study timer + Team timer" },
      { label: "Advanced analytics with predictions" },
      { label: "Create & manage study groups" },
      { label: "Export to PDF, Markdown, Anki" },
      { label: "Offline mode" },
      { label: "Custom exam generation" },
      { label: "24/7 priority chat support" },
      { label: "Ad-free experience" },
    ],
  },
];

export function normalizeSubscriptionTier(
  raw?: string | null,
): SubscriptionTier {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("pro")) return "pro";
  if (value.includes("student") || value.includes("standard")) return "student";
  return "free";
}

/**
 * Get savings percentage for yearly billing
 */
export function getYearlySavings(tier: SubscriptionTier): number {
  if (tier === "student") {
    return Math.round(((149 * 12 - 1200) / (149 * 12)) * 100); // 33%
  }
  if (tier === "pro") {
    return Math.round(((249 * 12 - 2400) / (249 * 12)) * 100); // 20%
  }
  return 0;
}
