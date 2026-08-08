export type SubscriptionTier = "free" | "standard" | "premium";

export interface PlanFeature {
  label: string;
  sub?: string;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  unlimited?: boolean;
  badge?: string;
}

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSuffix: "/month",
    features: [
      { label: "5 PDF uploads" },
      { label: "5 previous exam questions" },
      { label: "5 notes" },
      { label: "10 generated questions", sub: "(No difficulty level)" },
      { label: "50 Flash cards" },
      { label: "15 chat conversations / day" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "299 birr",
    priceSuffix: "/month",
    features: [
      { label: "15 PDF uploads" },
      { label: "10 previous exam questions" },
      { label: "15 notes" },
      { label: "100 generated questions", sub: "(No difficulty level)" },
      { label: "500 Flash cards" },
      { label: "150 chat conversations / day" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "499 birr",
    priceSuffix: "/month",
    badge: "Best Value",
    unlimited: true,
    features: [
      { label: "Unlimited PDF uploads" },
      { label: "Unlimited exam questions" },
      { label: "Unlimited notes & study cards" },
      { label: "Unlimited question generation" },
      { label: "Unlimited Flash cards" },
      { label: "Unlimited chat conversations" },
    ],
  },
];

export function normalizeSubscriptionTier(
  raw?: string | null,
): SubscriptionTier {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("premium")) return "premium";
  if (value.includes("standard")) return "standard";
  return "free";
}
