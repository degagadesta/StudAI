import PlanCard from "../PlanCard";
// import {
//   PLANS,
//   normalizeSubscriptionTier,
//   type SubscriptionTier,
// } from "../../../data/planData";

import {
  PLANS,
  normalizeSubscriptionTier,
  type SubscriptionTier,
} from "../../../utils/PlanData";
import type { AcademicProfile } from "../../../api/Coursesapi";

interface PlanTabProps {
  currentPlan: SubscriptionTier;
  onChangePlan: (tier: SubscriptionTier) => void;
  profile: AcademicProfile | null;
}

export default function PlanTab({ currentPlan, onChangePlan, profile }: PlanTabProps) {
  // Use the currentPlan prop which is managed by the parent
  const activePlan = normalizeSubscriptionTier(profile?.subscriptionPlan) || currentPlan;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl text-primary">
          Subscription Plans
        </h3>
        <p className="text-xs text-secondary mt-0.5">
          Choose the plan that fits your study workload and resource needs.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3.5 pt-1">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={activePlan}
            displayName={
              plan.id === "free" ? profile?.subscriptionPlan : undefined
            }
            onSelect={onChangePlan}
          />
        ))}
      </div>
    </div>
  );
}
