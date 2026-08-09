import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { stripControlChars, capLength } from "../utils/security/sanitize";
import { resetPassword, getApiErrorMessage } from "../api/authApi";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const PASSWORD_MAX_LEN = 128;
const PASSWORD_MIN_LEN = 8;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get token from URL and stabilize it
  const [token] = useState(() => searchParams.get("token"));
  const [isPageReady, setIsPageReady] = useState(false);

  console.log('[ResetPassword] Component mounted');
  console.log('[ResetPassword] URL search params:', window.location.search);
  console.log('[ResetPassword] Token from searchParams:', token);
  
  // Ensure page is stable before rendering (prevents flash/redirect issues)
  useEffect(() => {
    console.log('[ResetPassword] Setting page ready, token:', token ? 'present' : 'missing');
    setIsPageReady(true);
  }, [token]);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = capLength(stripControlChars(e.target.value), PASSWORD_MAX_LEN);
    setPassword(cleaned);
    setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = capLength(stripControlChars(e.target.value), PASSWORD_MAX_LEN);
    setConfirmPassword(cleaned);
    setErrors((prev) => ({ ...prev, confirmPassword: undefined, form: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < PASSWORD_MIN_LEN) {
      next.password = `Password must be at least ${PASSWORD_MIN_LEN} characters.`;
    } else if (password.length > PASSWORD_MAX_LEN) {
      next.password = "Password is too long.";
    } else if (!/[A-Z]/.test(password)) {
      next.password = "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      next.password = "Password must include at least one lowercase letter.";
    } else if (!/[0-9]/.test(password)) {
      next.password = "Password must include at least one number.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    console.log('[ResetPassword] Form submitted');

    if (!token) {
      console.log('[ResetPassword] No token available');
      setErrors({ form: "Invalid reset link. No token provided." });
      return;
    }

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      console.log('[ResetPassword] Validation errors:', fieldErrors);
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[ResetPassword] Calling resetPassword API...');
      await resetPassword({
        token,
        newPassword: password,
      });
      console.log('[ResetPassword] Password reset successful');
      setSuccess(true);
      console.log('[ResetPassword] Scheduling redirect to login in 3 seconds...');
      setTimeout(() => {
        console.log('[ResetPassword] Navigating to login...');
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      console.error('[ResetPassword] Password reset failed:', err);
      setErrors({
        form: getApiErrorMessage(err, "Password reset failed. The link may be expired."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    console.log('[ResetPassword] Rendering invalid link screen (no token)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-page px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Invalid Link</h2>
          <p className="text-secondary mb-4">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="px-6 py-2 bg-accent hover-accent text-inverse font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-accent"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  // Show loading state briefly to prevent flash
  if (!isPageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  if (success) {
    console.log('[ResetPassword] Rendering success screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-page px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">
            Password Reset Successful!
          </h2>
          <p className="text-secondary">
            Your password has been reset. You'll be redirected to login shortly.
          </p>
        </div>
      </div>
    );
  }

  console.log('[ResetPassword] Rendering reset password form');
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">Reset Password</h2>
          <p className="text-secondary">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form Error */}
          {errors.form && (
            <div className="flex items-center gap-2 p-3 bg-error border border-error rounded-lg">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <span className="text-sm text-error">{errors.form}</span>
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-2 border ${errors.password ? "border-error" : "border-default"} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent pr-10`}
                disabled={isSubmitting}
                placeholder="8+ chars, 1 uppercase, 1 lowercase, 1 number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-primary mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-4 py-2 border ${errors.confirmPassword ? "border-error" : "border-default"} rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent pr-10`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent hover-accent disabled:opacity-60 disabled:cursor-not-allowed text-inverse font-semibold py-3 rounded-lg transition-colors focus:ring-2 focus:ring-accent"
          >
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
