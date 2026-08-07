import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmail, getApiErrorMessage } from "../api/authApi";
import { useAuthContext } from "../contexts/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    console.log('[VerifyEmail] useEffect triggered, token:', token ? 'present' : 'missing');

    if (!token) {
      console.log('[VerifyEmail] No token found, setting error state');
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    // Prevent double-execution in React Strict Mode
    if (hasVerified.current) {
      console.log('[VerifyEmail] Already verified, skipping');
      return;
    }
    hasVerified.current = true;

    const verifyEmailToken = async () => {
      try {
        console.log('[VerifyEmail] Starting verification...');
        setStatus("loading");
        
        // Call verify endpoint - it returns tokens, user data, and profile status
        const response = await verifyEmail(token);
        console.log('[VerifyEmail] Verification response:', response);
        
        // Set user in auth context with hasProfile
        console.log('[VerifyEmail] Calling setUser with hasProfile:', response.hasProfile);
        setUser(response.student, response.hasProfile);
        
        console.log('[VerifyEmail] Setting status to success');
        setStatus("success");
        setMessage(response.message || "Email verified successfully! Redirecting...");

        // Wait 1.5 seconds then redirect to onboarding (new users don't have profile yet)
        setTimeout(() => {
          console.log('[VerifyEmail] Redirecting to onboarding...');
          console.log('[VerifyEmail] hasProfile from response:', response.hasProfile);
          
          // New users should go to onboarding, returning users to dashboard
          if (response.hasProfile) {
            console.log('[VerifyEmail] User has profile, going to dashboard');
            navigate("/dashboard", { replace: true });
          } else {
            console.log('[VerifyEmail] User needs onboarding, going to /onboarding');
            navigate("/onboarding", { replace: true });
          }
        }, 1500);
      } catch (error: any) {
        console.error('[VerifyEmail] Verification failed:', error);
        setStatus("error");
        setMessage(
          getApiErrorMessage(error, "Verification failed. The link may be expired or invalid.")
        );
      }
    };

    verifyEmailToken();
  }, [searchParams, setUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1E3] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#DCD2B4] p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-[#253D31]">
            Stud<span className="text-[#8CA37E]">AI</span>
          </h1>
        </div>

        {/* Status Content */}
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EFE8D4] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#2F4A3D] animate-spin" />
              </div>
              <h2 className="text-xl font-serif text-[#253D31] mb-2">
                Verifying Your Email
              </h2>
              <p className="text-sm text-[#5B6156]">Please wait...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8CA37E]/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#2F4A3D]" />
              </div>
              <h2 className="text-xl font-serif text-[#253D31] mb-2">
                Email Verified! 🎉
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-[#5B6156]">
                <Loader2 size={16} className="animate-spin" />
                <span>Redirecting...</span>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F7E8E8] flex items-center justify-center">
                <XCircle className="w-8 h-8 text-[#8B3A3A]" />
              </div>
              <h2 className="text-xl font-serif text-[#253D31] mb-2">
                Verification Failed
              </h2>
              <p className="text-sm text-[#5B6156] mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-[#2F4A3D] hover:bg-[#253D31] text-white font-medium rounded-lg transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-3 bg-white border border-[#DCD2B4] hover:bg-[#F6F1E3] text-[#2F4A3D] font-medium rounded-lg transition-colors"
                >
                  Register Again
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        {status === "error" && (
          <p className="text-center text-xs text-[#5B6156] mt-6">
            Need help?{" "}
            <a href="mailto:support@studai.et" className="text-[#2F4A3D] hover:underline">
              Contact Support
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
