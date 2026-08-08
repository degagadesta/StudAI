import { CheckCircle2, Zap, Sparkles } from "lucide-react";
// import type { PlanConfig, SubscriptionTier } from "./planData";
import type { PlanConfig, SubscriptionTier } from "../../utils/PlanData";

interface PlanCardProps {
  plan: PlanConfig;
  currentPlan: SubscriptionTier;
  displayName?: string; // override, e.g. profile.subscriptionPlan for "free"
  onSelect: (tier: SubscriptionTier) => void;
}

export default function PlanCard({
  plan,
  currentPlan,
  displayName,
  onSelect,
}: PlanCardProps) {
  const isActive = currentPlan === plan.id;

  if (plan.unlimited) {
    return (
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative bg-gradient-to-b from-[#253D31] to-[#1B2E25] text-[#F6F1E3] ${
          isActive ? "ring-2 ring-[#8CA37E] shadow-md" : "border-[#253D31]"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif text-base font-medium flex items-center gap-1.5 text-[#EFE8D4]">
              <Sparkles size={15} className="text-[#DCD2B4]" />
              {plan.name}
            </span>
            {plan.badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#EFE8D4] text-[#253D31] rounded-full">
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-[#FFFDF7] mb-3">
            {plan.price}{" "}
            <span className="text-xs font-normal text-[#DCD2B4]">
              {plan.priceSuffix}
            </span>
          </p>

          <div className="border-t border-[#DCD2B4]/20 pt-3 space-y-2">
            <p className="text-xs text-[#EFE8D4] font-medium">
              Everything Unlimited:
            </p>
            <ul className="text-xs text-[#DCD2B4] space-y-2">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#8CA37E] shrink-0" />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        // unlimited (premium) card button
        <button
          type="button"
          disabled={isActive}
          onClick={() => onSelect(plan.id)}
          className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            isActive
              ? "bg-[#EFE8D4] text-[#253D31] cursor-default font-semibold"
              : "bg-[#FFFDF7] text-[#253D31] hover:bg-[#EFE8D4]"
          }`}
        >
          {isActive ? "Active Plan" : `Upgrade to ${plan.name}`}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
        isActive
          ? "bg-[#FFFDF7] border-[#253D31] shadow-sm ring-1 ring-[#253D31]"
          : "bg-[#FFFDF7] border-[#DCD2B4]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-serif text-base text-[#253D31] flex items-center gap-1">
            {plan.id === "standard" && (
              <Zap size={15} className="text-[#1E5652]" />
            )}
            {displayName ?? plan.name}
          </span>
          {isActive && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#253D31] text-[#F6F1E3] rounded-full">
              Current
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-[#253D31] mb-3">
          {plan.price}{" "}
          <span className="text-xs font-normal text-[#5B6156]">
            {plan.priceSuffix}
          </span>
        </p>

        <ul className="text-xs text-[#5B6156] space-y-2 border-t border-[#DCD2B4]/50 pt-3">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-start gap-1.5">
              <CheckCircle2
                size={14}
                className={`shrink-0 mt-0.5 ${
                  plan.id === "standard" ? "text-[#1E5652]" : "text-[#8CA37E]"
                }`}
              />
              <span>
                {f.label}
                {f.sub && (
                  <span className="text-[10px] text-[#A9A18A] block">
                    {f.sub}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      // standard/free card button
      <button
        type="button"
        disabled={isActive || plan.id === "free"} // no "switch to free" self-serve for now
        onClick={() => onSelect(plan.id)}
        className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
          isActive
            ? "bg-[#EFE8D4] text-[#253D31] cursor-default"
            : plan.id === "free"
              ? "border border-[#DCD2B4] text-[#A9A18A] cursor-not-allowed"
              : "bg-[#253D31] text-[#F6F1E3] hover:bg-[#1E3228]"
        }`}
      >
        {isActive
          ? "Active Plan"
          : plan.id === "free"
            ? "Free Plan"
            : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}
