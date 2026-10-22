import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";

/**
 * Mock Payment Page
 * Simulates Chapa payment gateway for testing/demo purposes
 */
export default function MockPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const txRef = searchParams.get("tx_ref");
  const amount = searchParams.get("amount");
  const email = searchParams.get("email");

  useEffect(() => {
    // Auto-process payment after 2 seconds
    const timer = setTimeout(() => {
      handlePayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePayment = () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Redirect to success page with transaction reference
      navigate(`/payment/success?tx_ref=${txRef}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-elevated flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-surface rounded-2xl shadow-xl p-8 border border-default">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-2">
              Mock Payment Gateway
            </h1>
            <p className="text-sm text-secondary">
              This is a simulated payment for testing purposes
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-elevated rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Amount</span>
              <span className="text-lg font-bold text-primary">{amount} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Email</span>
              <span className="text-sm text-primary">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Transaction Ref</span>
              <span className="text-xs text-muted font-mono">{txRef?.substring(0, 20)}...</span>
            </div>
          </div>

          {/* Processing State */}
          {!processing ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-accent">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Processing payment...</span>
              </div>
              <p className="text-xs text-muted">
                Payment will complete automatically in a moment
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="text-sm font-semibold">Payment Successful!</span>
              </div>
              <p className="text-xs text-muted">
                Redirecting to confirmation page...
              </p>
            </div>
          )}

          {/* Mock Badge */}
          <div className="mt-6 pt-6 border-t border-default">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-amber-600 font-medium">
                DEMO MODE - No real payment processed
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>For Presentation:</strong> This mock payment gateway simulates the Chapa payment flow. 
            In production, users would be redirected to the actual Chapa checkout page.
          </p>
        </div>
      </div>
    </div>
  );
}
