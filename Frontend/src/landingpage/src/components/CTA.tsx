import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section id="get-started" className="relative py-24 md:py-32 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">

      {/* Immersive radial glows */}
      <div className="glow-bg glow-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-25 pointer-events-none -z-10 animate-pulse-glow"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Glowing Box */}
        <div className="relative glass-card border border-brand-primary/25 rounded-3xl p-8 md:p-14 overflow-hidden text-center shadow-2xl flex flex-col items-center bg-gradient-to-br from-brand-dark-green/30 to-brand-bg/5 backdrop-blur-xl">

          {/* Subtle floating visual items inside box */}
          <div className="absolute top-4 left-6 opacity-30 animate-float hidden md:block">
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="absolute bottom-6 right-8 opacity-25 animate-float-delayed hidden md:block">
            <Sparkles className="w-5 h-5 text-brand-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight mb-5 leading-tight max-w-2xl">
            Your next exam <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary">
              starts here.
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed max-w-xl mb-9">
            Stop searching through chaos. Stop guessing what topics matter. Start studying with an AI that understands your department curriculum.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto">
            <a
              href="/login"
              className="group flex items-center justify-center gap-2 bg-brand-primary text-brand-bg hover:bg-brand-primary-hover font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-[0_6px_25px_-5px_rgba(152,201,135,0.4)] hover:scale-[1.01] w-full sm:w-auto"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#features"
              className="flex items-center justify-center border border-brand-border bg-brand-card hover:bg-brand-border/10 text-brand-text font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all duration-300 w-full sm:w-auto"
            >
              Explore StudAI
            </a>
          </div>

          {/* Trust badge indicator */}
          <span className="text-[10px] uppercase font-bold text-brand-primary mt-8 block tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/15 animate-pulse">
            Course Portal Active
          </span>

        </div>

      </div>
    </section>
  );
}
