import { useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { stripControlChars, capLength } from "../utils/security/sanitize";
import { forgotPassword, getApiErrorMessage } from "../api/authApi";

interface FormErrors {
  email?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LEN = 254;

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleaned = capLength(stripControlChars(e.target.value), EMAIL_MAX_LEN);
    setEmail(cleaned);
    setErrors({});
  };

  const validate = (emailValue: string): FormErrors => {
    const next: FormErrors = {};
    const trimmedEmail = emailValue.trim();

    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (trimmedEmail.length > EMAIL_MAX_LEN) {
      next.email = "Email is too long.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const fieldErrors = validate(email);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setSuccess(true);
    } catch (err) {
      setErrors({
        form: getApiErrorMessage(err, "Failed to send reset email. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F1E3] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#253D31] mb-2 text-center">
            Check Your Email
          </h2>
          <p className="text-gray-600 text-center mb-6">
            If that email exists in our system, you'll receive a password reset link shortly.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full bg-[#253D31] hover:bg-[#1a2b21] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F1E3] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#253D31] mb-2">Forgot Password?</h2>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form Error */}
          {errors.form && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{errors.form}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#253D31] mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent`}
              disabled={isSubmitting}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#253D31] hover:bg-[#1a2b21] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#8B4513] hover:underline font-semibold"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
