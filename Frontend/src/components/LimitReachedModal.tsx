import { X, Zap, TrendingUp, Check } from "lucide-react";
import { PLANS, type SubscriptionTier } from "../utils/PlanData";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  currentPlan: SubscriptionTier;
  limitUsed: number;
  limitTotal: number;
  onUpgrade: (plan: SubscriptionTier) => void;
}

export default function LimitReachedModal({
  isOpen,
  onClose,
  featureName,
  currentPlan,
  limitUsed,
  limitTotal,
  onUpgrade,
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  // Get recommended upgrade plans
  const upgradePlans = PLANS.filter((plan) => {
    if (currentPlan === "free") return plan.id === "student" || plan.id === "pro";
    if (currentPlan === "student") return plan.id === "pro";
    return false;
  });

  const featureIcons: Record<string, string> = {
    "PDF Uploads": "📄",
    "AI Chat Messages": "💬",
    "Flashcards": "🎴",
    "AI Summaries": "📝",
    "Quiz Generations": "🎯",
    "Active Courses": "📚",
  };

  const icon = featureIcons[featureName] || "⚡";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-default rounded-2xl shadow-2xl animate-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-default">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-serif font-bold text-primary mb-2">
                {featureName} Limit Reached
              </h2>
              <p className="text-sm text-secondary">
                You've used{" "}
                <span className="font-semibold text-warning">
                  {limitUsed} of {limitTotal}
                </span>{" "}
                {featureName.toLowerCase()} this month. Upgrade to continue using this feature.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Plan Info */}
          <div className="mb-6 p-4 bg-elevated border border-default rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary uppercase tracking-wide mb-1">
                  Current Plan
                </p>
                <p className="text-lg font-semibold text-primary capitalize">
                  {currentPlan} Plan
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary mb-1">Monthly Limit</p>
                <p className="text-lg font-semibold text-warning">
                  {limitTotal} {featureName}
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary mb-3">
              Choose a plan to upgrade:
            </p>

            {upgradePlans.map((plan) => {
              const feature = plan.features.find((f) =>
                f.label.toLowerCase().includes(featureName.toLowerCase().split(" ")[0])
              );

              return (
                <button
                  key={plan.id}
                  onClick={() => onUpgrade(plan.id)}
                  className="w-full p-4 border border-default hover:border-accent rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] bg-surface hover:bg-elevated text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-primary">
                          {plan.name} Plan
                        </h3>
                        {plan.popular && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent border border-accent/20 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Feature Highlight */}
                      <div className="flex items-center gap-2 mb-3">
                        <Check size={16} className="text-accent shrink-0" />
                        <span className="text-sm text-primary font-medium">
                          {feature?.label || `Unlimited ${featureName}`}
                        </span>
                      </div>

                      {/* Top Features */}
                      <div className="space-y-1">
                        {plan.features.slice(0, 3).map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-secondary"
                          >
                            <div className="w-1 h-1 rounded-full bg-accent/50" />
                            <span>{f.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-primary">
                          {plan.price}
                        </span>
                        <span className="text-sm text-secondary">
                          {plan.priceSuffix}
                        </span>
                      </div>
                      {plan.priceYearly && (
                        <p className="text-xs text-accent mt-1">
                          Save with yearly
                        </p>
                      )}
                      <div className="mt-3 px-4 py-2 bg-accent text-inverse rounded-lg text-sm font-medium group-hover:bg-accent-hover transition-colors flex items-center gap-2">
                        <TrendingUp size={14} />
                        <span>Upgrade</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-accent shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary mb-1">
                  Why upgrade?
                </p>
                <ul className="text-xs text-secondary space-y-1">
                  <li>• Instant access to more resources</li>
                  <li>• No interruptions during study sessions</li>
                  <li>• Priority support and advanced features</li>
                  <li>• Cancel anytime, no long-term commitment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
          >
            Maybe Later
          </button>
          <p className="text-xs text-secondary">
            Limits reset on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  );
}
