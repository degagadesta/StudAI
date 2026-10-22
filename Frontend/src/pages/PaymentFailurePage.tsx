import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const reason = searchParams.get("reason") || "unknown";
  const txRef = searchParams.get("tx_ref");

  const reasonMessages: Record<string, { title: string; description: string }> = {
    cancelled: {
      title: "Payment Cancelled",
      description: "You cancelled the payment process. No charges were made to your account.",
    },
    failed: {
      title: "Payment Failed",
      description: "The payment could not be processed. Please check your payment details and try again.",
    },
    timeout: {
      title: "Payment Timeout",
      description: "The payment session expired. Please try again.",
    },
    declined: {
      title: "Payment Declined",
      description: "Your payment was declined by the payment provider. Please use a different payment method.",
    },
    unknown: {
      title: "Payment Unsuccessful",
      description: "Something went wrong with your payment. Please try again or contact support.",
    },
  };

  const message = reasonMessages[reason] || reasonMessages.unknown;

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="bg-surface border border-default rounded-xl overflow-hidden max-w-lg w-full">
        {/* Error Header */}
        <div className="bg-gradient-to-br from-error/10 to-error/5 border-b border-default p-8 text-center">
          <div className="w-20 h-20 bg-error/20 border-2 border-error rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <XCircle size={48} className="text-error" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary mb-2">
            {message.title}
          </h1>
          <p className="text-sm text-secondary">
            {message.description}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Transaction Reference */}
          {txRef && (
            <div className="bg-elevated border border-default rounded-lg p-4 mb-6">
              <p className="text-xs text-secondary mb-1">Transaction Reference</p>
              <p className="text-sm font-mono text-primary break-all">{txRef}</p>
              <p className="text-xs text-muted mt-2">
                Keep this reference if you need to contact support
              </p>
            </div>
          )}

          {/* Common Issues */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <HelpCircle size={16} className="text-accent" />
              <span>Common Issues</span>
            </h3>
            <div className="space-y-2">
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-primary hover:text-accent transition-colors p-3 bg-elevated border border-default rounded-lg">
                  Insufficient Funds
                </summary>
                <p className="text-xs text-secondary mt-2 px-3 pb-3">
                  Ensure your account has enough balance to complete the transaction. Check with your bank if needed.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-primary hover:text-accent transition-colors p-3 bg-elevated border border-default rounded-lg">
                  Card Declined
                </summary>
                <p className="text-xs text-secondary mt-2 px-3 pb-3">
                  Your card may have been declined due to security reasons. Contact your bank to authorize online payments.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-primary hover:text-accent transition-colors p-3 bg-elevated border border-default rounded-lg">
                  Network Issues
                </summary>
                <p className="text-xs text-secondary mt-2 px-3 pb-3">
                  Poor internet connection can interrupt payment. Ensure you have a stable connection before retrying.
                </p>
              </details>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-inverse hover:bg-accent-hover rounded-lg text-sm font-semibold transition-colors"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => navigate("/app")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-default hover:bg-surface-hover rounded-lg text-sm font-medium text-secondary transition-colors"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Support */}
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <p className="text-xs text-secondary text-center">
              Still having issues?{" "}
              <button
                onClick={() => window.open("mailto:support@studai.et", "_blank")}
                className="text-accent hover:underline font-medium"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
