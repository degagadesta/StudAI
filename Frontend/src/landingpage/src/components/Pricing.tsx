import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "0 ETB",
      desc: "For students getting started.",
      features: [
        "1 active course workspace",
        "Limited AI tutor chat (50 msgs/mo)",
        "Basic flashcards builder",
        "Basic daily study planner",
      ],
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Premium",
      price: isAnnual ? "69 ETB" : "99 ETB",
      suffix: "/ month",
      billing: isAnnual ? "Billed annually (828 ETB/yr) • Save 30%" : "Billed monthly",
      desc: "For serious exam preparation.",
      features: [
        "Unlimited active courses",
        "Unlimited AI tutor chat & summaries",
        "Unlimited practice quizzes",
        "Full Exam Intelligence™ database",
        "Access to previous exams solved",
        "Personalized study planner & timer",
        "Weakness tracking & analytics dashboard",
      ],
      cta: "Start Premium",
      highlight: true,
    },
    {
      name: "Institution",
      price: "Custom",
      desc: "For universities & departments.",
      features: [
        "Bulk student enrollment access",
        "Instructor & tutor dashboards",
        "Department-level study analytics",
        "Custom AASTU portal integrations",
        "Dedicated institution support manager",
      ],
      cta: "Contact Us",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-brand-bg overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/3 left-1/3 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Start studying smarter today.
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Get started for free or upgrade to unlock unlimited AI tools, mock finals, and detailed exam relevance analysis.
          </p>

          {/* Monthly/Annual billing Toggle */}
          <div className="flex items-center gap-3 bg-brand-bg-darker border border-brand-border p-1.5 rounded-full mt-6">
            <button
              onClick={() => setIsAnnual(false)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
                !isAnnual ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isAnnual ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              Annually
              <span className="text-[9px] bg-brand-primary text-brand-bg font-bold px-1.5 py-0.5 rounded-full border border-brand-bg">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch mt-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card rounded-2xl p-6 md:p-8 border flex flex-col justify-between text-left transition-all duration-300 ${
                plan.highlight
                  ? "border-brand-primary bg-brand-dark-green/10 shadow-[0_10px_40px_rgba(152,201,135,0.1)] relative scale-105"
                  : "border-brand-border/25"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-brand-bg text-[10px] font-bold px-3 py-1 rounded-full border-2 border-brand-bg-darker flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" />
                  <span>RECOMMENDED FOR EXAMS</span>
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-brand-text mb-1">{plan.name}</h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed">{plan.desc}</p>
                </div>

                <div className="mb-6 flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-display font-extrabold text-brand-text tracking-tight">
                      {plan.price}
                    </span>
                    {plan.suffix && <span className="text-sm text-brand-text-muted font-medium">{plan.suffix}</span>}
                  </div>
                  {plan.billing && <span className="text-[10px] font-semibold text-brand-primary mt-1.5 block">{plan.billing}</span>}
                </div>

                <hr className="border-brand-border/10 mb-6" />

                {/* Features List */}
                <ul className="flex flex-col gap-3.5 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-brand-text-muted">
                      <div className="w-4 h-4 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-[1.01] ${
                  plan.highlight
                    ? "bg-brand-primary text-brand-bg hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/25"
                    : "border border-brand-border bg-brand-card hover:bg-brand-border/15 text-brand-text"
                }`}
              >
                {plan.cta}
                {plan.highlight && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
