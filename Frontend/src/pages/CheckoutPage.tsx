import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { PLANS, normalizeSubscriptionTier, getYearlySavings, type SubscriptionTier } from "../utils/PlanData";
import { initializePayment } from "../api/paymentApi";
import { useAuthContext } from "../contexts/AuthContext";

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Get plan and cycle from URL params
  const planParam = searchParams.get("plan") || "student";
  const cycleParam = searchParams.get("cycle") || "monthly";

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    normalizeSubscriptionTier(planParam)
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    cycleParam as "monthly" | "yearly"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, navigate]);

  // Filter out FREE plan
  const paidPlans = PLANS.filter(p => p.id !== "free");

  const handlePlanSelect = (planId: SubscriptionTier) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleBillingCycleChange = (cycle: "monthly" | "yearly") => {
    setBillingCycle(cycle);
    setError(null);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Initialize payment with Chapa
      const result = await initializePayment(
        selectedPlan.toUpperCase() as "STUDENT" | "PRO",
        billingCycle.toUpperCase() as "MONTHLY" | "YEARLY"
      );

      // Redirect to Chapa checkout
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      console.error("Payment initialization failed:", err);
      setError(
        err?.response?.data?.error || "Failed to initialize payment. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);
  if (!selectedPlanData) return null;

  const price = billingCycle === "monthly" 
    ? parseInt(selectedPlanData.price.replace(/[^0-9]/g, ""))
    : parseInt((selectedPlanData.priceYearly || "0").replace(/[^0-9]/g, ""));

  const savings = billingCycle === "yearly" ? getYearlySavings(selectedPlan) : 0;

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Header */}
      <header className="border-b border-default bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold text-primary">
              StudAI Checkout
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Plan Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Choose Plan */}
              <div className="bg-surface border border-default rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-accent text-inverse rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-primary">
                    Choose Your Plan
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {paidPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`relative p-5 border-2 rounded-xl text-left transition-all hover:scale-[1.02] ${
                        selectedPlan === plan.id
                          ? "border-accent bg-accent/5"
                          : "border-default hover:border-accent/50"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-accent text-inverse text-xs font-bold rounded-full">
                          Popular
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-primary mb-1">
                            {plan.name}
                          </h3>
                          <p className="text-2xl font-bold text-accent">
                            {plan.price}
                            <span className="text-sm text-secondary font-normal">
                              /month
                            </span>
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === plan.id
                              ? "border-accent bg-accent"
                              : "border-border"
                          }`}
                        >
                          {selectedPlan === plan.id && (
                            <Check size={14} className="text-inverse" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-secondary"
                          >
                            <Check size={14} className="text-accent shrink-0 mt-0.5" />
                            <span>{feature.label}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Billing Cycle */}
              <div className="bg-surface border border-default rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-accent text-inverse rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-primary">
                    Choose Billing Cycle
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleBillingCycleChange("monthly")}
                    className={`p-5 border-2 rounded-xl text-left transition-all hover:scale-[1.02] ${
                      billingCycle === "monthly"
                        ? "border-accent bg-accent/5"
                        : "border-default hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-primary mb-1">
                          Monthly
                        </h3>
                        <p className="text-xs text-secondary">
                          Billed monthly, cancel anytime
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === "monthly"
                            ? "border-accent bg-accent"
                            : "border-border"
                        }`}
                      >
                        {billingCycle === "monthly" && (
                          <Check size={14} className="text-inverse" />
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleBillingCycleChange("yearly")}
                    className={`relative p-5 border-2 rounded-xl text-left transition-all hover:scale-[1.02] ${
                      billingCycle === "yearly"
                        ? "border-accent bg-accent/5"
                        : "border-default hover:border-accent/50"
                    }`}
                  >
                    {savings > 0 && (
                      <div className="absolute -top-3 left-4 px-3 py-1 bg-success text-inverse text-xs font-bold rounded-full">
                        Save {savings}%
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-primary mb-1">
                          Yearly
                        </h3>
                        <p className="text-xs text-secondary">
                          Billed annually, best value
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          billingCycle === "yearly"
                            ? "border-accent bg-accent"
                            : "border-border"
                        }`}
                      >
                        {billingCycle === "yearly" && (
                          <Check size={14} className="text-inverse" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-error mb-1">
                      Payment Failed
                    </p>
                    <p className="text-xs text-error/80">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-default rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {selectedPlanData.name} Plan
                      </p>
                      <p className="text-xs text-secondary capitalize">
                        {billingCycle} billing
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {price} ETB
                    </p>
                  </div>

                  {billingCycle === "yearly" && savings > 0 && (
                    <div className="flex items-center justify-between text-success">
                      <p className="text-xs font-medium">
                        Yearly discount ({savings}%)
                      </p>
                      <p className="text-xs font-semibold">
                        -{Math.round((parseInt(selectedPlanData.price.replace(/[^0-9]/g, "")) * 12 - price))} ETB
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-default">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-base font-semibold text-primary">
                        Total
                      </p>
                      <p className="text-xl font-bold text-accent">
                        {price} ETB
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Payment</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-default space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-secondary">
                      Instant access to all features
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-secondary">
                      Cancel anytime, no questions asked
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-secondary">
                      Secure payment via Chapa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-default bg-surface py-6">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-secondary text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Your payment is processed securely by Chapa.
          </p>
        </div>
      </footer>
    </div>
  );
}
