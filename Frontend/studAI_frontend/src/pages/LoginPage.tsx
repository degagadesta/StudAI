import { useState, FormEvent, ChangeEvent } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

// RFC 5322-ish, deliberately not exhaustive — full validation always happens server-side
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LEN = 254; // RFC 5321 limit
const PASSWORD_MAX_LEN = 128; // matches bcrypt's 72-byte input limit safely
const PASSWORD_MIN_LEN = 8;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, type, value, checked } = e.target;

    // Hard-cap input length client-side so a pasted 50,000-char string
    // never even reaches state or gets sent in a request body.
    const capped =
      name === "email"
        ? value.slice(0, EMAIL_MAX_LEN)
        : name === "password"
          ? value.slice(0, PASSWORD_MAX_LEN)
          : value;

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : capped,
    }));

    // Clear the field's error as soon as the user edits it
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const validate = (email: string, password: string): FormErrors => {
    const next: FormErrors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (trimmedEmail.length > EMAIL_MAX_LEN) {
      next.email = "Email is too long.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < PASSWORD_MIN_LEN) {
      next.password = `Password must be at least ${PASSWORD_MIN_LEN} characters.`;
    } else if (password.length > PASSWORD_MAX_LEN) {
      next.password = "Password is too long.";
    }

    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Normalize before validating/sending: trim whitespace, lowercase email.
    // Never trim or alter the password itself — a trailing space may be intentional.
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    const fieldErrors = validate(email, password);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // sends/receives the httpOnly refresh-token cookie
        body: JSON.stringify({ email, password, remember: values.remember }),
      });

      if (!res.ok) {
        // Deliberately generic — never reveal whether the email exists,
        // whether it was the email or password that was wrong, or any
        // server-side detail. That distinction is a common enumeration leak.
        setErrors({ form: "Invalid email or password." });
        return;
      }

      const data = await res.json();
      // store the short-lived access token in memory (e.g. context/store),
      // NOT in localStorage — localStorage is readable by any injected script.
      console.log("Logged in:", data);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = (): void => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F6F1E3]">
      {/* Left — brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#253D31] text-[#F6F1E3] p-14 overflow-hidden">
        <div className="font-serif text-xl tracking-wide">
          Stud<span className="text-[#C7D3B9]">AI</span>
        </div>

        {/* signature stack — nods to StudAI's flashcards / notes / exam features */}
        <div className="relative w-72 h-72 mx-auto">
          <div className="absolute top-8 left-2 -rotate-6 w-56 h-36 rounded-xl bg-[#2C4739] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#C7D3B9] text-[#253D31] px-2 py-1 rounded mb-2">
              Quiz
            </span>
            Weak topic
            <div className="h-px bg-[#F6F1E3]/20 my-2" />
            found in Ch. 4
          </div>

          <div className="absolute top-16 left-16 rotate-3 w-56 h-36 rounded-xl bg-[#33513F] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75 z-10">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#C7D3B9] text-[#253D31] px-2 py-1 rounded mb-2">
              Notes
            </span>
            Auto-saved
            <div className="h-px bg-[#F6F1E3]/20 my-2" />2 min ago
          </div>

          <div className="absolute top-24 left-6 -rotate-2 w-56 h-36 rounded-xl bg-[#3B5C47] border border-[#F6F1E3]/20 p-5 font-mono text-xs text-[#F6F1E3]/75 z-20">
            <span className="inline-block text-[10px] uppercase tracking-wide bg-[#B08D4F] text-[#2A2013] px-2 py-1 rounded mb-2">
              Exam
            </span>
            Trend detected
            <div className="h-px bg-[#F6F1E3]/20 my-2" />3 years running
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl leading-snug mb-3 max-w-sm">
            Everything you're studying, in one place.
          </h1>
          <p className="text-sm leading-relaxed text-[#F6F1E3]/70 max-w-sm">
            Upload lecture PDFs, chat with your course material, and let StudAI
            surface what's actually likely to be on the exam.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#F6F1E3]/50 mt-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7D3B9]" />
            AASTU · Software Engineering
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm border-l-2 border-[#B08D4F]/50 pl-7">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5B6156] bg-[#EFE8D4] border border-[#DCD2B4] px-2.5 py-1 rounded-full mb-6">
            <b className="text-[#2F4A3D] font-semibold">AASTU</b> → Software
            Engineering
          </span>

          <h2 className="font-serif text-3xl text-[#253D31] mb-1.5">
            Welcome back
          </h2>
          <p className="text-sm text-[#5B6156] mb-8">
            Sign in to continue where you left off.
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

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#5B6156] mb-1.5"
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
                className={`w-full px-3.5 py-3 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
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

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#5B6156] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                maxLength={PASSWORD_MAX_LEN}
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`w-full px-3.5 py-3 pr-11 text-sm bg-[#FFFDF7] border rounded-lg outline-none placeholder:text-[#A9A18A] focus:ring-4 ${
                  errors.password
                    ? "border-[#C97B7B] focus:border-[#C97B7B] focus:ring-[#C97B7B]/15"
                    : "border-[#DCD2B4] focus:border-[#8CA37E] focus:ring-[#8CA37E]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] text-[#A9A18A] hover:text-[#5B6156]"
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

            <div className="flex items-center justify-between text-sm -mt-1">
              <label className="flex items-center gap-2 text-[#5B6156]">
                <input
                  type="checkbox"
                  name="remember"
                  checked={values.remember}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 accent-[#2F4A3D]"
                />
                Remember me
              </label>
              <a
                href="#"
                className="font-medium text-[#2F4A3D] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-1.5 py-3 bg-[#2F4A3D] hover:bg-[#253D31] disabled:opacity-60 disabled:cursor-not-allowed text-[#F6F1E3] text-sm font-semibold rounded-lg transition-colors active:scale-[0.99]"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs text-[#A9A18A]">
            <span className="flex-1 h-px bg-[#DCD2B4]" />
            or
            <span className="flex-1 h-px bg-[#DCD2B4]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg text-sm font-medium text-[#3A382F] hover:bg-[#EFE8D4] transition-colors active:scale-[0.99]"
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
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#5B6156] mt-6">
            New to StudAI?{" "}
            <a href="#" className="font-medium text-[#2F4A3D] hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
