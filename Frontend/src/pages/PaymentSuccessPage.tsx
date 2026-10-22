import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Sparkles, ArrowRight, Download, Rocket } from "lucide-react";
import { verifyPayment, type PaymentVerifyResponse } from "../api/paymentApi";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get("tx_ref");

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!txRef) {
      setError("No transaction reference provided");
      setIsVerifying(false);
      return;
    }

    verifyPaymentTransaction();
  }, [txRef]);

  const verifyPaymentTransaction = async () => {
    if (!txRef) return;

    try {
      setIsVerifying(true);
      const result = await verifyPayment(txRef);
      
      console.log("[PaymentSuccess] Verification result:", result);
      console.log("[PaymentSuccess] Payment status:", result.payment.status);
      console.log("[PaymentSuccess] Success flag:", result.success);
      
      setPaymentData(result);
      setError(null);

      // If payment was successful, show celebration (NO auto-redirect)
      if (result.success || result.payment.status === "SUCCESS") {
        console.log("[PaymentSuccess] Payment successful! Showing celebration");
        setShowCelebration(true);
        // User must click "Go to Dashboard" button to navigate
      } else {
        console.warn("[PaymentSuccess] Payment not successful:", result);
      }
    } catch (err: any) {
      console.error("Payment verification failed:", err);
      setError(err?.response?.data?.error || "Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-surface border border-default rounded-xl p-8 max-w-md w-full text-center">
          <Loader2 size={48} className="text-accent mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-primary mb-2">
            Verifying Payment...
          </h2>
          <p className="text-sm text-secondary">
            Please wait while we confirm your payment with Chapa.
          </p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-surface border border-default rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            Verification Failed
          </h2>
          <p className="text-sm text-secondary mb-6">
            {error || "Unable to verify your payment. Please contact support."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/app")}
              className="flex-1 py-2.5 px-4 border border-default hover:bg-surface-hover rounded-lg text-sm font-medium text-secondary transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={verifyPaymentTransaction}
              className="flex-1 py-2.5 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { payment } = paymentData;

  // Check if payment was actually successful
  // Accept both the success flag and the payment status
  const isPaymentSuccessful = paymentData.success === true || 
                               payment.status === "SUCCESS" || 
                               payment.status === "success";

  console.log("[PaymentSuccess] Rendering - isPaymentSuccessful:", isPaymentSuccessful);
  console.log("[PaymentSuccess] paymentData.success:", paymentData.success);
  console.log("[PaymentSuccess] payment.status:", payment.status);

  if (!isPaymentSuccessful) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="bg-surface border border-default rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-warning/10 border border-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            Payment {payment.status}
          </h2>
          <p className="text-sm text-secondary mb-6">
            Your payment was not successful. No charges were made to your account.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/app")}
              className="flex-1 py-2.5 px-4 border border-default hover:bg-surface-hover rounded-lg text-sm font-medium text-secondary transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 py-2.5 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6 relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket 
              size={100} 
              className="text-accent animate-bounce"
              style={{
                animation: "bounce 1s ease-in-out infinite, rocket-launch 2s ease-out"
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-surface border border-default rounded-xl overflow-hidden max-w-2xl w-full relative z-10">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-b border-default p-8 text-center">
          <div className="w-20 h-20 bg-accent/20 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <CheckCircle size={48} className="text-accent" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            🎉 Payment Successful! 🎉
          </h1>
          <p className="text-base font-semibold text-accent mb-1">
            Welcome to {payment.plan} Plan!
          </p>
          <p className="text-sm text-secondary">
            Your subscription is now active. Get ready to study smarter!
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-8">
          <div className="bg-elevated border border-default rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-primary mb-4">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-default">
                <span className="text-sm text-secondary">Plan</span>
                <span className="text-sm font-semibold text-primary capitalize">
                  {payment.plan} Plan
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default">
                <span className="text-sm text-secondary">Billing Cycle</span>
                <span className="text-sm font-semibold text-primary capitalize">
                  {payment.billingCycle}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default">
                <span className="text-sm text-secondary">Amount Paid</span>
                <span className="text-lg font-bold text-accent">
                  {payment.amount} ETB
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-secondary">Transaction ID</span>
                <span className="text-xs font-mono text-secondary">
                  {payment.id.substring(0, 16)}...
                </span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <span>What's Next?</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-elevated border border-default rounded-lg">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary mb-0.5">
                    Explore Your New Features
                  </p>
                  <p className="text-xs text-secondary">
                    Access unlimited AI features, advanced analytics, and more
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-elevated border border-default rounded-lg">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary mb-0.5">
                    Check Your Email
                  </p>
                  <p className="text-xs text-secondary">
                    We've sent a receipt and subscription details to your email
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-elevated border border-default rounded-lg">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary mb-0.5">
                    Start Studying Smarter
                  </p>
                  <p className="text-xs text-secondary">
                    Upload your materials and let AI do the heavy lifting
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 py-2.5 px-4 border border-default hover:bg-surface-hover rounded-lg text-sm font-medium text-secondary transition-colors"
            >
              <Download size={16} />
              <span>Download Receipt</span>
            </button>
            <button
              onClick={() => window.location.href = "/app"}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <Rocket size={16} />
              <span>Start Learning Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-8 pb-8">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-xs text-secondary text-center">
              Need help? Contact us at support@studai.et or check our{" "}
              <button className="text-accent hover:underline">
                Help Center
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
