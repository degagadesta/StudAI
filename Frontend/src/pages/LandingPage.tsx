import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  MessageCircle,
  Layers,
  FileText,
  BarChart2,
  Calendar,
  ArrowRight,
  Upload,
  Cpu,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  BookMarked,
  Brain,
  Clock,
  Users,
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-surface/90 backdrop-blur-lg border-b border-default shadow-sm-theme"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="StudAI home"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-sm">
              <BookOpen size={16} className="text-inverse" strokeWidth={2} />
            </div>
            <span className="font-serif font-bold text-lg text-primary tracking-tight">
              StudAI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <a
              href="#features"
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors rounded-lg hover:bg-elevated"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors rounded-lg hover:bg-elevated"
            >
              How it works
            </a>
            <a
              href="#for-you"
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors rounded-lg hover:bg-elevated"
            >
              Why StudAI
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              id="nav-signin"
              className="px-4 py-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors rounded-lg hover:bg-elevated"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              id="nav-get-started"
              className="px-4 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-inverse rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              Get started free
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-elevated transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav
            className="md:hidden py-3 border-t border-default flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            <a
              href="#features"
              className="px-3 py-2.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-2.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            <a
              href="#for-you"
              className="px-3 py-2.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-elevated"
              onClick={() => setMobileOpen(false)}
            >
              Why StudAI
            </a>
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-default">
              <Link
                to="/login"
                className="px-3 py-2.5 text-sm font-medium text-secondary hover:text-primary rounded-lg hover:bg-elevated"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                id="mobile-get-started"
                className="px-4 py-2.5 text-sm font-semibold bg-accent text-inverse rounded-xl transition-colors text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get started free
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Soft radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, var(--color-accent-primary-bg) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-light border border-accent/30 text-accent text-xs font-semibold mb-6 shadow-sm-theme">
          <Sparkles size={12} />
          <span>Built for Ethiopian university students</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
          Study smarter with AI that{" "}
          <span className="text-accent">knows your curriculum</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your lecture PDFs. Get instant AI tutoring, auto-generated
          flashcards, practice quizzes, and access to past exams — all aligned
          to your actual department and courses.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            to="/register"
            id="hero-cta-primary"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-hover text-inverse font-semibold rounded-2xl transition-all shadow-md-theme hover:shadow-lg-theme text-base"
          >
            Start studying for free
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            to="/login"
            id="hero-cta-secondary"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-surface border border-default hover:border-hover text-primary font-medium rounded-2xl transition-all shadow-sm-theme text-base"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Social proof line */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-accent" />
            <span>Free to get started</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-accent" />
            <span>No credit card required</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-accent" />
            <span>Ethiopian curricula built-in</span>
          </div>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="relative rounded-3xl overflow-hidden border border-default shadow-xl-theme bg-surface">
          {/* Fake topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-default bg-elevated">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error/50" />
              <div className="w-3 h-3 rounded-full bg-warning/50" />
              <div className="w-3 h-3 rounded-full bg-success/50" />
            </div>
            <div className="flex-1 max-w-xs mx-4">
              <div className="h-5 bg-elevated rounded-md w-full" />
            </div>
            <div className="w-6 h-6 rounded-full bg-accent/20" />
          </div>

          {/* Fake dashboard content */}
          <div className="flex h-64 sm:h-80">
            {/* Fake sidebar */}
            <div className="w-14 border-r border-default bg-surface flex flex-col items-center py-4 gap-3 shrink-0">
              {[BookOpen, BarChart2, Calendar, Users].map((Icon, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${i === 0
                    ? "bg-accent text-inverse"
                    : "bg-elevated text-muted"
                    }`}
                >
                  <Icon size={15} />
                </div>
              ))}
            </div>

            {/* Fake main area */}
            <div className="flex-1 p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stat cards */}
              <div className="flex flex-col gap-3 sm:col-span-3 sm:flex-row">
                {[
                  { label: "Courses", value: "6" },
                  { label: "PDFs uploaded", value: "14" },
                  { label: "Events saved", value: "8" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex-1 rounded-xl bg-elevated p-3 flex flex-col gap-1"
                  >
                    <p className="text-xs text-muted">{s.label}</p>
                    <p className="font-serif text-xl text-primary">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Fake chart */}
              <div className="sm:col-span-2 rounded-xl border border-default bg-page p-3 flex flex-col gap-2">
                <p className="text-xs text-secondary font-medium">Weekly Activity</p>
                <div className="flex items-end gap-1.5 h-16 mt-1">
                  {[30, 55, 70, 45, 85, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor:
                          i === 4
                            ? "var(--color-accent-primary)"
                            : "var(--color-bg-elevated)",
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Fake material card */}
              <div className="rounded-xl border border-default bg-page p-3">
                <p className="text-xs text-secondary font-medium mb-2">Recent Material</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-elevated flex items-center justify-center">
                    <FileText size={12} className="text-accent" />
                  </div>
                  <div>
                    <div className="h-2.5 w-20 rounded bg-elevated mb-1" />
                    <div className="h-2 w-14 rounded bg-elevated" />
                  </div>
                </div>
                <div className="h-1 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "78%",
                      backgroundColor: "var(--color-accent-primary)",
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted mt-1 text-right">78%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI chat badge */}
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -right-2 sm:right-6 bg-surface border border-default rounded-2xl px-4 py-3 shadow-lg-theme flex items-center gap-3 max-w-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <MessageCircle size={15} className="text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary leading-none mb-0.5">
              AI Tutor
            </p>
            <p className="text-[11px] text-muted leading-tight">
              "Explain this concept from chapter 3…"
            </p>
          </div>
        </div>

        {/* Floating flashcard badge */}
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -left-2 sm:left-6 bg-surface border border-default rounded-2xl px-4 py-3 shadow-lg-theme flex items-center gap-3 max-w-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Layers size={15} className="text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary leading-none mb-0.5">
              Flashcard generated
            </p>
            <p className="text-[11px] text-muted leading-tight">
              10 cards from OS lecture PDF
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Problem Section ──────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    icon: "📂",
    title: "Materials are everywhere",
    description:
      "Lecture notes scattered across Telegram groups, USB drives, and WhatsApp. Finding the right PDF before an exam wastes precious time.",
  },
  {
    icon: "📋",
    title: "Past exams are hard to access",
    description:
      "Previous exam papers are rarely organized or publicly shared. Students have no reliable way to practice with real exam questions.",
  },
  {
    icon: "🤖",
    title: "Generic AI doesn't understand your curriculum",
    description:
      "ChatGPT and similar tools give generic answers. They don't know your specific courses, textbooks, or the AASTU Software Engineering program.",
  },
];

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 bg-elevated/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            The problem
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            University students deserve better study tools
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Ethiopian students rely on disconnected resources that slow them
            down. StudAI brings everything into one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="bg-surface border border-default rounded-2xl p-6 shadow-sm-theme hover:shadow-md-theme transition-shadow"
            >
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-primary text-base mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your lecture PDFs",
    description:
      "Drop any lecture slide or textbook PDF into your course workspace. StudAI extracts and indexes every page automatically.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI processes your material",
    description:
      "Our pipeline extracts text, generates embeddings, and makes your content searchable. You get real-time status updates as it processes.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Study with intelligent tools",
    description:
      "Ask AI questions about the material, generate flashcards, take quizzes, read notes side-by-side — all from a single focused workspace.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            From PDF to understood in minutes
          </h2>
          <p className="text-secondary text-lg max-w-xl mx-auto">
            No complex setup. Upload, process, and start studying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px border-t-2 border-dashed border-default"
          />

          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center relative">
              {/* Step icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-accent-light border border-accent/20 flex items-center justify-center shadow-sm-theme mb-2">
                  <step.icon size={28} className="text-accent" strokeWidth={1.8} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-inverse text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {step.number.slice(-1)}
                </span>
              </div>
              <h3 className="font-semibold text-primary text-base mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-secondary leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI Tutor Chat",
    tag: "Ask anything",
    description:
      "Ask questions about your uploaded lecture material. The AI answers strictly from your content — no hallucinations, no irrelevant results.",
    accent: true,
  },
  {
    icon: Layers,
    title: "Auto Flashcards",
    tag: "Instant review",
    description:
      "One click turns any uploaded PDF into a set of flashcards. Flip through them, test yourself, and regenerate as needed.",
    accent: false,
  },
  {
    icon: Brain,
    title: "Practice Quizzes",
    tag: "Test yourself",
    description:
      "AI generates multiple-choice and short-answer questions from your material. Track what you got right and focus on weak areas.",
    accent: false,
  },
  {
    icon: BookMarked,
    title: "Past Exam Library",
    tag: "Exam prep",
    description:
      "Browse actual past exams from your university and department. Practice with real questions that appear year after year.",
    accent: false,
  },
  {
    icon: FileText,
    title: "Smart Notes",
    tag: "Organized",
    description:
      "A rich text note editor sits side-by-side with your PDF. Auto-save keeps your notes intact across sessions.",
    accent: false,
  },
  {
    icon: BarChart2,
    title: "Study Analytics",
    tag: "Track progress",
    description:
      "See your weekly activity, materials processed, and course enrollment at a glance. Understand where you're spending time.",
    accent: false,
  },
];

function FeaturesGrid() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-elevated/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            Everything you need to ace your exams
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            A complete study toolkit built around your course materials. No
            switching between apps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative group rounded-2xl p-6 border transition-all duration-200 hover:shadow-md-theme ${f.accent
                ? "bg-accent text-inverse border-transparent shadow-md-theme"
                : "bg-surface border-default hover:border-hover shadow-sm-theme"
                }`}
            >
              {/* Tag badge */}
              <span
                className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-4 ${f.accent
                  ? "bg-inverse/20 text-inverse"
                  : "bg-accent-light text-accent border border-accent/20"
                  }`}
              >
                {f.tag}
              </span>

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.accent ? "bg-inverse/20" : "bg-elevated"
                  }`}
              >
                <f.icon
                  size={18}
                  className={f.accent ? "text-inverse" : "text-accent"}
                  strokeWidth={1.8}
                />
              </div>

              <h3
                className={`font-semibold text-base mb-2 ${f.accent ? "text-inverse" : "text-primary"
                  }`}
              >
                {f.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${f.accent ? "text-inverse/80" : "text-secondary"
                  }`}
              >
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AI Workspace Preview ─────────────────────────────────────────────────────

function WorkspacePreview() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              The workspace
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-5 leading-tight">
              Your PDF, your notes, and your AI tutor — side by side
            </h2>
            <p className="text-secondary text-base leading-relaxed mb-8">
              Open any processed material and get a focused study environment.
              The PDF viewer sits on one side. The other side holds your AI
              chat, notes, flashcards, quizzes, and past exam practice — all
              one tab away.
            </p>

            <ul className="space-y-3">
              {[
                "Read PDFs with zoom and scroll — track your reading progress",
                "Chat with AI about specific pages or topics",
                "Take notes in a rich text editor that auto-saves",
                "Generate flashcards and quizzes without leaving the page",
                "Browse past exams and practice directly in the workspace",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-secondary">
                  <CheckCircle2
                    size={16}
                    className="text-accent mt-0.5 shrink-0"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: workspace mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-default shadow-xl-theme overflow-hidden bg-surface">
              {/* Workspace topbar */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-default bg-elevated">
                <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                  <FileText size={12} className="text-accent" />
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-40 rounded bg-elevated" />
                </div>
                <div className="flex gap-1">
                  {["Chat", "Notes", "Flashcards", "Quiz"].map((tab, i) => (
                    <div
                      key={tab}
                      className={`px-2 py-1 rounded text-[10px] font-medium ${i === 0
                        ? "bg-accent text-inverse"
                        : "text-muted bg-surface border border-default"
                        }`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workspace body */}
              <div className="flex h-64">
                {/* PDF side */}
                <div className="flex-1 border-r border-default p-4 flex flex-col gap-2">
                  <div className="h-2 w-3/4 rounded bg-elevated" />
                  <div className="h-2 w-full rounded bg-elevated" />
                  <div className="h-2 w-5/6 rounded bg-elevated" />
                  <div className="h-2 w-2/3 rounded bg-elevated" />
                  <div className="mt-2 h-2 w-full rounded bg-elevated" />
                  <div className="h-2 w-4/5 rounded bg-elevated" />
                  <div className="h-2 w-full rounded bg-elevated" />
                  <div className="h-2 w-3/5 rounded bg-elevated" />
                  <div className="mt-2 h-2 w-full rounded bg-elevated" />
                  <div className="h-2 w-5/6 rounded bg-elevated" />
                </div>

                {/* Chat side */}
                <div className="w-52 flex flex-col p-3 gap-2">
                  {/* AI message */}
                  <div className="flex gap-2 items-start">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Sparkles size={9} className="text-accent" />
                    </div>
                    <div className="bg-elevated rounded-xl rounded-tl-none p-2 flex-1">
                      <div className="h-1.5 w-full rounded bg-surface mb-1" />
                      <div className="h-1.5 w-4/5 rounded bg-surface mb-1" />
                      <div className="h-1.5 w-3/4 rounded bg-surface" />
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex gap-2 items-start justify-end">
                    <div className="bg-accent/15 rounded-xl rounded-tr-none p-2 max-w-[80%]">
                      <div className="h-1.5 w-24 rounded bg-accent/30 mb-1" />
                      <div className="h-1.5 w-16 rounded bg-accent/30" />
                    </div>
                  </div>

                  {/* AI message */}
                  <div className="flex gap-2 items-start">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Sparkles size={9} className="text-accent" />
                    </div>
                    <div className="bg-elevated rounded-xl rounded-tl-none p-2 flex-1">
                      <div className="h-1.5 w-full rounded bg-surface mb-1" />
                      <div className="h-1.5 w-3/5 rounded bg-surface" />
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="mt-auto flex items-center gap-1.5 border border-default rounded-xl p-2 bg-elevated">
                    <div className="flex-1 h-2 rounded bg-surface" />
                    <div className="w-5 h-5 rounded-lg bg-accent flex items-center justify-center">
                      <ArrowRight size={10} className="text-inverse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl -z-10 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--color-accent-primary-bg), transparent 70%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Ethiopian Student Section ────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Curriculum-aware AI",
    description:
      "StudAI is built around the actual course structures of Ethiopian universities. Select your university, department, year, and semester — and your courses are automatically configured.",
  },
  {
    icon: BookOpen,
    title: "Courses from your department",
    description:
      "Browse a catalog of courses specific to your program. Enroll in the ones you're taking this semester and organize all your PDFs and notes by course.",
  },
  {
    icon: Clock,
    title: "Schedule and event tracking",
    description:
      "Keep your study schedule, assignment deadlines, and exam dates in a built-in calendar. Never miss a due date again.",
  },
];

function ForEthiopianStudents() {
  return (
    <section id="for-you" className="py-20 sm:py-28 bg-elevated/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: benefits */}
          <div className="space-y-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-surface border border-default flex items-center justify-center shrink-0 shadow-sm-theme">
                  <b.icon size={20} className="text-accent" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1">{b.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: text */}
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
              Built for you
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-5 leading-tight">
              Designed around Ethiopian university life
            </h2>
            <p className="text-secondary text-base leading-relaxed mb-6">
              Generic AI tools aren't built for the AASTU Software Engineering
              curriculum or the specific textbooks your professors use. StudAI
              starts from your actual course structure — so every answer,
              flashcard, and quiz is relevant to what you're studying.
            </p>
            <p className="text-secondary text-base leading-relaxed mb-8">
              We're starting with AASTU and expanding to every Ethiopian
              university, department by department. Your feedback shapes what
              comes next.
            </p>

            {/* University tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-default shadow-sm-theme">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <GraduationCap size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary leading-none">
                  Currently supporting
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  AASTU · Software Engineering
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="relative rounded-3xl border border-default p-10 sm:p-14 overflow-hidden shadow-xl-theme bg-surface"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-accent-primary-bg) 0%, transparent 70%)",
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-6 shadow-sm-theme">
            <Sparkles size={24} className="text-accent" strokeWidth={1.8} />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-secondary text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Join other Ethiopian students using AI to understand their courses
            faster. Upload your first PDF and see what happens.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              id="cta-get-started"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-hover text-inverse font-semibold rounded-2xl transition-all shadow-md-theme hover:shadow-lg-theme text-base"
            >
              Create your free account
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/login"
              id="cta-signin"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-elevated border border-default hover:border-hover text-primary font-medium rounded-2xl transition-all text-base"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-10 border-t border-default">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <BookOpen size={12} className="text-inverse" />
            </div>
            <span className="font-serif font-bold text-primary text-sm">StudAI</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5 text-xs text-muted" aria-label="Footer navigation">
            <Link to="/register" className="hover:text-secondary transition-colors">
              Get started
            </Link>
            <Link to="/login" className="hover:text-secondary transition-colors">
              Sign in
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} StudAI. Built for Ethiopian students.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeaturesGrid />
        <WorkspacePreview />
        <ForEthiopianStudents />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
