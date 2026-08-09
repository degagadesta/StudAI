import { useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  CheckCircle,
} from "lucide-react";
import { stripControlChars, capLength } from "../utils/security/sanitize";
import { register, googleSignIn, getApiErrorMessage } from "../api/authApi";
import { useAuthContext } from "../contexts/AuthContext";
import { routeAfterAuth } from "../utils/authRouting";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LEN = 254;
const NAME_MAX_LEN = 50;
const PASSWORD_MAX_LEN = 128;
const PASSWORD_MIN_LEN = 8;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [values, setValues] = useState<RegisterFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, type, value, checked } = e.target;

    let cleaned: string | boolean = value;
    if (name === "firstName" || name === "lastName") {
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

  const validate = (vals: RegisterFormValues): FormErrors => {
    const next: FormErrors = {};

    const trimmedFirstName = vals.firstName.trim();
    if (!trimmedFirstName) next.firstName = "First name is required.";
    else if (trimmedFirstName.length > NAME_MAX_LEN)
      next.firstName = "First name is too long.";

    const trimmedLastName = vals.lastName.trim();
    if (!trimmedLastName) next.lastName = "Last name is required.";
    else if (trimmedLastName.length > NAME_MAX_LEN)
      next.lastName = "Last name is too long.";

    const trimmedEmail = vals.email.trim();
    if (!trimmedEmail) next.email = "Email is required.";
    else if (trimmedEmail.length > EMAIL_MAX_LEN)
      next.email = "Email is too long.";
    else if (!EMAIL_REGEX.test(trimmedEmail))
      next.email = "Enter a valid email address.";

    if (!vals.password) {
      next.password = "Password is required.";
    } else if (vals.password.length < PASSWORD_MIN_LEN) {
      next.password = `Password must be at least ${PASSWORD_MIN_LEN} characters.`;
    } else if (vals.password.length > PASSWORD_MAX_LEN) {
      next.password = "Password is too long.";
    } else if (!/[A-Z]/.test(vals.password)) {
      next.password = "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(vals.password)) {
      next.password = "Password must include at least one lowercase letter.";
    } else if (!/[0-9]/.test(vals.password)) {
      next.password = "Password must include at least one number.";
    }

    if (!vals.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (vals.confirmPassword !== vals.password)
      next.confirmPassword = "Passwords do not match.";

    if (!vals.acceptTerms)
      next.acceptTerms = "You must agree to the Terms of Service.";

    return next;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      // Register does NOT log the user in — email verification is required
      // first (see auth.service.js `login()`), so we show a success state
      // and hand off to /login rather than treating this like a session start.
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErrors({
        form: getApiErrorMessage(err, "Registration failed. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ): Promise<void> => {
    if (!credentialResponse.credential) {
      setErrors({ form: "Google sign-in failed. Please try again." });
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Google sign-in returns user + hasProfile status
      const data = await googleSignIn(credentialResponse.credential);
      console.log('[RegisterPage Google] Sign-in response:', data);
      console.log('[RegisterPage Google] hasProfile value:', data.hasProfile);
      
      setUser(data.student, data.hasProfile);
      
      // Use centralized routing with onboarding check
      await routeAfterAuth(navigate, data.hasProfile);
    } catch (err) {
      setErrors({
        form: getApiErrorMessage(
          err,
          "Google sign-in failed. Please try again.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = (): void => {
    setErrors({ form: "Google sign-in was cancelled or failed." });
  };

  const passwordCriteria = [
    {
      label: "8+ characters",
      valid: values.password.length >= PASSWORD_MIN_LEN,
    },
    { label: "1 uppercase letter", valid: /[A-Z]/.test(values.password) },
    { label: "1 lowercase letter", valid: /[a-z]/.test(values.password) },
    { label: "1 number", valid: /[0-9]/.test(values.password) },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-primary mb-2">
            Registration successful!
          </h2>
          <p className="text-sm text-secondary">
            Please check your email to verify your account. You'll be redirected
            to login shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-page">
      {/* Left — brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-accent text-inverse p-14 overflow-hidden">
        <div className="font-serif text-xl tracking-wide">
          Stud<span className="text-accent-light">AI</span>
        </div>

        <div className="relative w-72 h-72 mx-auto">
          <div className="absolute top-8 left-2 -rotate-6 w-56 h-36 rounded-xl bg-accent border border-inverse/20 p-5 font-mono text-xs text-inverse/75">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-accent-light text-primary px-2 py-1 rounded mb-4">
              Setup
            </span>
            Smart Workspace
            <div className="h-px bg-page/20 my-2" />
            Configuring AI Engine
          </div>
          <div className="absolute top-16 left-16 rotate-3 w-56 h-36 rounded-xl bg-accent border border-inverse/20 p-5 font-mono text-xs text-inverse/75 z-10">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-accent-light text-primary px-2 py-1 rounded mb-4">
              Sync
            </span>
            Courses & Flashcards
            <div className="h-px bg-page/20 my-2" />
            Ready to import
          </div>
          <div className="absolute top-24 left-6 -rotate-2 w-56 h-36 rounded-xl bg-accent border border-inverse/20 p-5 font-mono text-xs text-inverse/75 z-20">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-accent-secondary text-[#2A2013] px-2 py-1 rounded mb-4">
              Account
            </span>
            Student Access
            <div className="h-px bg-page/20 my-2" />
            Free Tier Enabled
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl leading-snug mb-4 max-w-sm">
            Join your smart study workspace.
          </h1>
          <p className="text-sm leading-relaxed text-inverse/70 max-w-sm">
            Create an account to extract insights from lecture notes, generate
            practice exams, and track your weak topics.
          </p>
          <div className="flex items-center gap-2 text-xs text-inverse/50 mt-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            AASTU · Software Engineering
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm border-l-2 border-[#B08D4F]/50 pl-7">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-secondary bg-elevated border border-default px-2.5 py-1 rounded-full mb-4">
            <b className="text-accent font-semibold">AASTU</b> → Software
            Engineering
          </span>

          <h2 className="font-serif text-3xl text-primary mb-4">
            Create an account
          </h2>
          <p className="text-sm text-secondary mb-4">
            Get started with StudAI today.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            {errors.form && (
              <div className="flex items-center gap-2 text-sm text-error bg-error border border-error rounded-lg px-3.5 py-2.5">
                <AlertCircle size={15} className="shrink-0" />
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium text-secondary mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  maxLength={NAME_MAX_LEN}
                  value={values.firstName}
                  onChange={handleChange}
                  placeholder="Abebe"
                  aria-invalid={!!errors.firstName}
                  className={`w-full px-3.5 py-2.5 text-sm bg-surface border rounded-lg outline-none placeholder:text-muted focus:ring-4 ${
                    errors.firstName
                      ? "border-error focus:border-error focus:ring-error/15"
                      : "border-default focus:border-accent focus:ring-accent/20"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-xs text-error">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium text-secondary mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  maxLength={NAME_MAX_LEN}
                  value={values.lastName}
                  onChange={handleChange}
                  placeholder="Bikila"
                  aria-invalid={!!errors.lastName}
                  className={`w-full px-3.5 py-2.5 text-sm bg-surface border rounded-lg outline-none placeholder:text-muted focus:ring-4 ${
                    errors.lastName
                      ? "border-error focus:border-error focus:ring-error/15"
                      : "border-default focus:border-accent focus:ring-accent/20"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-xs text-error">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-secondary mb-1"
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
                className={`w-full px-3.5 py-2.5 text-sm bg-surface border rounded-lg outline-none placeholder:text-muted focus:ring-4 ${
                  errors.email
                    ? "border-error focus:border-error focus:ring-error/15"
                    : "border-default focus:border-accent focus:ring-accent/20"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-error">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-secondary mb-1"
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
                className={`w-full px-3.5 py-2.5 pr-11 text-sm bg-surface border rounded-lg outline-none placeholder:text-muted focus:ring-4 ${
                  errors.password
                    ? "border-error focus:border-error focus:ring-error/15"
                    : "border-default focus:border-accent focus:ring-accent/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[32px] text-muted hover:text-secondary"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {errors.password && (
                <p className="mt-1.5 text-xs text-error">
                  {errors.password}
                </p>
              )}
            </div>

            {values.password.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 bg-elevated/50 border border-default p-2.5 rounded-lg text-[11px]">
                {passwordCriteria.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1 ${c.valid ? "text-accent font-medium" : "text-secondary"}`}
                  >
                    {c.valid ? (
                      <Check size={12} className="text-accent" />
                    ) : (
                      <X size={12} className="text-error" />
                    )}
                    {c.label}
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-secondary mb-1"
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
                className={`w-full px-3.5 py-2.5 pr-11 text-sm bg-surface border rounded-lg outline-none placeholder:text-muted focus:ring-4 ${
                  errors.confirmPassword
                    ? "border-error focus:border-error focus:ring-error/15"
                    : "border-default focus:border-accent focus:ring-accent/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-[32px] text-muted hover:text-secondary"
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2 text-xs text-secondary cursor-pointer">
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
                    className="text-accent font-medium hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-accent font-medium hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-error">
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex items-center justify-center gap-1.5 py-3 bg-accent hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed text-inverse text-sm font-semibold rounded-lg transition-colors active:scale-[0.99]"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs text-muted">
            <span className="flex-1 h-px bg-[#DCD2B4]" />
            or
            <span className="flex-1 h-px bg-[#DCD2B4]" />
          </div>

          <div className="flex justify-center mb-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="352"
            />
          </div>

          <p className="text-center text-sm text-secondary mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
