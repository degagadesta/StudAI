import { useState, FormEvent, ChangeEvent } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, type, value, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // wire this up to your auth API (POST /api/auth/login)
    console.log(values);
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                value={values.email}
                onChange={handleChange}
                placeholder="yourname@aastustudent.edu.et"
                className="w-full px-3.5 py-3 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
              />
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
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-3.5 py-3 pr-11 text-sm bg-[#FFFDF7] border border-[#DCD2B4] rounded-lg outline-none placeholder:text-[#A9A18A] focus:border-[#8CA37E] focus:ring-4 focus:ring-[#8CA37E]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] text-[#A9A18A] hover:text-[#5B6156]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
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
              className="mt-2 flex items-center justify-center gap-1.5 py-3 bg-[#2F4A3D] hover:bg-[#253D31] text-[#F6F1E3] text-sm font-semibold rounded-lg transition-colors active:scale-[0.99]"
            >
              Sign in
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs text-[#A9A18A]">
            <span className="flex-1 h-px bg-[#DCD2B4]" />
            or
            <span className="flex-1 h-px bg-[#DCD2B4]" />
          </div>

          <p className="text-center text-sm text-[#5B6156]">
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
