import { ArrowRight, Play, Sparkles } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-brand-bg-darker overflow-hidden text-center z-10">
      {/* Background atmospheric glows */}
      <div className="glow-bg glow-green absolute top-0 left-1/4 w-[500px] h-[500px] -translate-y-1/2 opacity-20 animate-pulse-glow"></div>
      <div className="glow-bg glow-green absolute top-[30%] right-10 w-[450px] h-[450px] opacity-15 animate-pulse-glow-slow"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Top small Pill */}
        <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/25 rounded-full px-4 py-1.5 mb-8 text-brand-primary text-xs font-semibold tracking-wide animate-pulse-glow shadow-[0_0_15px_-3px_rgba(152,201,135,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-powered studying for Ethiopian universities</span>
        </div>

        {/* Headlines */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-brand-text tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Study smarter. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary">
            Prepare with intelligence.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-lg md:text-xl text-brand-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          StudAI understands your university, your courses, your lecture materials, and your past exams — giving you one intelligent workspace to learn, practice, and prepare.
        </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4.5 justify-center mb-6">
            <a
              href="/login"
              className="group flex items-center gap-2 bg-brand-primary text-brand-bg hover:bg-brand-primary-hover font-bold px-7 py-3.5 rounded-full shadow-[0_8px_30px_-5px_rgba(152,201,135,0.45)] hover:shadow-[0_8px_35px_-2px_rgba(152,201,135,0.6)] hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto justify-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 border border-brand-border bg-brand-card hover:bg-brand-border/10 text-brand-text font-bold px-7 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4 fill-current text-brand-primary" />
              See How It Works
            </a>
          </div>

        {/* Trust badge */}
        <div className="text-xs font-semibold tracking-wider text-brand-text-muted/75 flex items-center justify-center gap-2 py-4 mb-4">
          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping"></span>
          <span>Built for university students • Starting with AASTU</span>
        </div>

        {/* Hero Product Visual Mockup */}
        <DashboardMockup />
      </div>
    </section>
  );
}
