import { useState, FormEvent, ChangeEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check, X } from "lucide-react";
import {
  stripControlChars,
  capLength,
  sanitizeNameInput,
  validateRedirectPath,
} from "../utils/security/sanitize";
import { register, getApiErrorMessage } from "../api/authApi";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LEN = 254;
const NAME_MAX_LEN = 70;
const PASSWORD_MAX_LEN = 128;
const PASSWORD_MIN_LEN = 8;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, type, value, checked } = e.target;

    let cleaned = value;
    if (name === "fullName") {
      cleaned = capLength(stripControlChars(value), NAME_MAX_LEN);
    } else if (name === "email") {
      cleaned = capLength(stripControlChars(value), EMAIL_MAX_LEN);
    } else if (name === "password" || name === "confirmPassword") {
      cleaned = capLength(stripControlChars(value), PASSWORD_MAX_LEN);
    }

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : cleaned,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = (val: RegisterFormValues): FormErrors => {
    const next: FormErrors = {};

    const cleanName = sanitizeNameInput(val.fullName, NAME_MAX_LEN);
    if (!cleanName) {
      next.fullName = "Full name is required.";
    } else if (cleanName.length < 2) {
      next.fullName = "Name must be at least 2 characters.";
    }

    const trimmedEmail = val.email.trim();
    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (trimmedEmail.length > EMAIL_MAX_LEN) {
      next.email = "Email is too long.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    if (!val.password) {
      next.password = "Password is required.";
    } else if (val.password.length < PASSWORD_MIN_LEN) {
      next.password = `Password must be at least ${PASSWORD_MIN_LEN} characters.`;
    } else if (val.password.length > PASSWORD_MAX_LEN) {
      next.password = "Password is too long.";
    } else if (!/[A-Z]/.test(val.password)) {
      next.password = "Must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(val.password)) {
      next.password = "Must include at least one lowercase letter.";
    } else if (!/[0-9]/.test(val.password)) {
      next.password = "Must include at least one numbe4.";
    }

    if (!val.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (val.password !== val.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    if (!val.acceptTerms) {
      next.acceptTerms = "You must agree to the Terms of Service.";
    }

    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const normalizedFullName = sanitizeNameInput(values.fullName, NAME_MAX_LEN);
    const normalizedEmail = values.email.trim().toLowerCase();

    setIsSubmitting(true);
    try {
      const data = await register({
        fullName: normalizedFullName,
        email: normalizedEmail,
        password: values.password,
      });

      console.log("Account created:", data.user);

      const target = validateRedirectPath(
        searchParams.get("redirect"),
        "/dashboard",
      );
      navigate(target);
    } catch (err) {
      setErrors({
        form: getApiErrorMessage(err, "Registration failed. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = (): void => {
    window.location.href = `${import.meta.env.VITE_API_URL || "/api"}/auth/google`;
  };

  // Dynamic Password Strength Criteria
  const passwordCriteria = [
    {
      label: "8+ characters",
      valid: values.password.length >= PASSWORD_MIN_LEN,
    },
    { label: "1 uppercase letter", valid: /[A-Z]/.test(values.password) },
    { label: "1 lowercase letter", valid: /[a-z]/.test(values.password) },
    { label: "1 numbe4", valid: /[0-9]/.test(values.password) },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F6F1E3]">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#253D31] text-[#F6F1E3] p-14 overflow-hidden">
        <div className="font-serif text-xl tracking-wide">
          Stud<span className="text-[#C7D3B9]">AI</span>
        </div>

        <div className="relative w-72 h-72 mx-auto">
          <div className="absolute top-8 left-2 -rotate-6 w-56 h-36 rounded-xl bg-[#2C4739] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#C7D3B9] text-[#253D31] px-2 py-1 rounded mb-4">
              Setup
            </span>
            Smart Workspace
            <div className="h-px bg-[#F6F1E3]/20 my-2" />
            Configuring AI Engine
          </div>

          <div className="absolute top-16 left-16 rotate-3 w-56 h-36 rounded-xl bg-[#33513F] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75 z-10">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#C7D3B9] text-[#253D31] px-2 py-1 rounded mb-4">
              Sync
            </span>
            Courses & Flashcards
            <div className="h-px bg-[#F6F1E3]/20 my-2" />
            Ready to import
          </div>

          <div className="absolute top-24 left-6 -rotate-2 w-56 h-36 rounded-xl bg-[#3B5C47] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75 z-20">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#B08D4F] text-[#2A2013] px-2 py-1 rounded mb-4">
              Account
            </span>
            Student Access
            <div className="h-px bg-[#F6F1E3]/20 my-2" />
            Free Tier Enabled
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl leading-snug mb-4 max-w-sm">
            Join your smart study workspace.
          </h1>
          <p className="text-sm leading-relaxed text-[#F6F1E3]/70 max-w-sm">
            Create an account to extract insights from lecture notes, generate
            practice exams, and track your weak topics.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#F6F1E3]/50 mt-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7D3B9]" />
            AASTU · Software Engineering
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm border-l-2 border-[#B08D4F]/50 pl-7">
          <span
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-4
          "
          >
            <b className="text-[#2F4A3D] font-semibold">AASTU</b> → Software
            Engineering
          </span>

          <h2 className="font-serif text-3xl text-[#253D31] mb-4">
            Create an account
          </h2>
          <p className="text-sm text-[#5B6156] mb-4">
            Get started with StudAI today.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {errors.form && (
              <div className="flex items-center gap-2 text-sm text-[#8B3A3A] bg-[#F7E8E8] border border-[#E3B8B8] rounded-lg px-3.5 py-2.5">
                <AlertCircle size={15} className="shrink-0" />
                {errors.form}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-medium text-[#5B6156] mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                maxLength={NAME_MAX_LEN}
                value={values.fullName}
                onChange={handleChange}
                placeholder="Abebe Bikila"
                aria-invalid={!!errors.fullName}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
                className={`w-full px-3.5 py-2.5 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
                  errors.fullName
                    ? "border-[#C97B7B] focus:border-[#C97B7B] focus:ring-[#C97B7B]/15"
                    : "border-[#DCD2B4] focus:border-[#8CA37E] focus:ring-[#8CA37E]/20"
                }`}
              />
              {errors.fullName && (
                <p
                  id="fullName-error"
                  className="mt-1.5 text-xs text-[#8B3A3A]"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#5B6156] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={EMAIL_MAX_LEN}
                value={values.email}
                onChange={handleChange}
                placeholder="yourname@aastustudent.edu.et"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
                  errors.email
                    ? "border-[#C97B7B] focus:border-[#C97B7B] focus:ring-[#C97B7B]/15"
                    : "border-[#DCD2B4] focus:border-[#8CA37E] focus:ring-[#8CA37E]/20"
                }`}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-[#8B3A3A]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#5B6156] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LEN}
                value={values.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`w-full px-3.5 py-2.5 pr-11 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
                  errors.password
                    ? "border-[#C97B7B] focus:border-[#C97B7B] focus:ring-[#C97B7B]/15"
                    : "border-[#DCD2B4] focus:border-[#8CA37E] focus:ring-[#8CA37E]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[32px] text-[#A9A18A] hover:text-[#5B6156]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs text-[#8B3A3A]"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Real-time Password Requirements Checklist */}
            {values.password.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 bg-[#EFE8D4]/50 border border-[#DCD2B4] p-2.5 rounded-lg text-[11px]">
                {passwordCriteria.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1 ${
                      c.valid ? "text-[#2F4A3D] font-medium" : "text-[#5B6156]"
                    }`}
                  >
                    {c.valid ? (
                      <Check size={12} className="text-[#2F4A3D]" />
                    ) : (
                      <X size={12} className="text-[#8B3A3A]" />
                    )}
                    {c.label}
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-[#5B6156] mb-4"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LEN}
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                className={`w-full px-3.5 py-2.5 pr-11 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
                  errors.confirmPassword
                    ? "border-[#C97B7B] focus:border-[#C97B7B] focus:ring-[#C97B7B]/15"
                    : "border-[#DCD2B4] focus:border-[#8CA37E] focus:ring-[#8CA37E]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-[32px] text-[#A9A18A] hover:text-[#5B6156]"
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="mt-1.5 text-xs text-[#8B3A3A]"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-2 text-xs text-[#5B6156] cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={values.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-3.5 h-3.5 accent-[#2F4A3D]"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-[#2F4A3D] font-medium hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#2F4A3D] font-medium hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-[#8B3A3A]">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center gap-1.5 py-3 bg-[#2F4A3D] hover:bg-[#253D31] disabled:opacity-60 disabled:cursor-not-allowed text-[#F6F1E3] text-sm font-semibold rounded-lg transition-colors active:scale-[0.99]"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 text-xs text-[#A9A18A]">
            <span className="flex-1 h-px bg-[#DCD2B4]" />
            or
            <span className="flex-1 h-px bg-[#DCD2B4]" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg text-sm font-medium text-[#3A382F] hover:bg-[#EFE8D4] transition-colors active:scale-[0.99]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Link to Login */}
          <p className="text-center text-sm text-[#5B6156] mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#2F4A3D] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
