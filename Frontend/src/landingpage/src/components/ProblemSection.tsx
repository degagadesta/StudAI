import { useState } from "react";
import { FileText, Send, Scroll, FileEdit, HelpCircle, Sparkles } from "lucide-react";

export default function ProblemSection() {
  const [activeStep, setActiveStep] = useState(0);

  const scatteredItems = [
    { name: "Lecture PDFs", icon: FileText, desc: "Downloaded files in folders", color: "from-red-500/20 to-red-900/10 border-red-500/30" },
    { name: "Telegram Groups", icon: Send, desc: "Channels filled with files", color: "from-blue-500/20 to-blue-900/10 border-blue-500/30" },
    { name: "Past Exams", icon: Scroll, desc: "Scattered blurry images", color: "from-amber-500/20 to-amber-900/10 border-amber-500/30" },
    { name: "Random Notes", icon: FileEdit, desc: "Handwritten notebooks", color: "from-purple-500/20 to-purple-900/10 border-purple-500/30" },
    { name: "Generic AI", icon: HelpCircle, desc: "Chatbots that lack context", color: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30" },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-brand-bg border-y border-brand-border/20 overflow-hidden">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/2 left-1/3 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Wording & Explanations */}
          <div className="lg:col-span-5 text-left flex flex-col gap-5">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25 self-start">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text leading-tight">
              Your study materials <br />are everywhere. <br />
              <span className="text-brand-primary font-light">Your preparation shouldn't be.</span>
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              Stop jumping between PDFs, old exams, notes, and generic AI tools. StudAI brings your entire study process into one intelligent workspace.
            </p>
            
            {/* Interactive Timeline Toggle description */}
            <div className="flex flex-col gap-3 mt-4">
              <div 
                onClick={() => setActiveStep(0)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeStep === 0 
                    ? "bg-brand-primary/5 border-brand-primary/30 text-brand-text" 
                    : "border-transparent text-brand-text-muted hover:text-brand-text"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${activeStep === 0 ? "bg-brand-primary animate-pulse" : "bg-brand-text-muted"}`}></div>
                  <h4 className="text-sm font-bold">Phase 1: Scattered Materials</h4>
                </div>
                <p className="text-xs">Files are lost in local drives and chaotic Telegram groups, detached from exam guides.</p>
              </div>

              <div 
                onClick={() => setActiveStep(1)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeStep === 1 
                    ? "bg-brand-primary/5 border-brand-primary/30 text-brand-text" 
                    : "border-transparent text-brand-text-muted hover:text-brand-text"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${activeStep === 1 ? "bg-brand-primary animate-pulse" : "bg-brand-text-muted"}`}></div>
                  <h4 className="text-sm font-bold">Phase 2: Unified Workspace</h4>
                </div>
                <p className="text-xs">All lecture slides, past exams, and AI tutors unite inside StudAI to sync with AASTU courses.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual converging animation */}
          <div className="lg:col-span-7 h-[420px] md:h-[480px] relative flex items-center justify-center bg-brand-bg-darker/40 border border-brand-border/20 rounded-2xl p-6 overflow-hidden">
            
            {/* Interactive State Toggle button inside graphic */}
            <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-brand-bg-darker border border-brand-border p-1 rounded-full">
              <button 
                onClick={() => setActiveStep(0)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${activeStep === 0 ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted"}`}
              >
                Scattered
              </button>
              <button 
                onClick={() => setActiveStep(1)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${activeStep === 1 ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-muted"}`}
              >
                Unified
              </button>
            </div>

            {/* Background elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`absolute w-72 h-72 rounded-full border border-brand-border/10 transition-transform duration-1000 ${activeStep === 1 ? "scale-50 opacity-10" : "scale-100 opacity-30"}`}></div>
              <div className={`absolute w-44 h-44 rounded-full border border-brand-border/10 transition-transform duration-1000 ${activeStep === 1 ? "scale-50 opacity-5" : "scale-100 opacity-20"}`}></div>
            </div>

            {/* Connecting paths (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-brand-border)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {activeStep === 1 && (
                <>
                  <path d="M 120 100 Q 200 120 330 220" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" className="path-line" />
                  <path d="M 520 100 Q 420 120 330 220" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" className="path-line" />
                  <path d="M 100 280 Q 200 270 330 220" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" className="path-line" />
                  <path d="M 540 280 Q 440 270 330 220" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" className="path-line" />
                  <path d="M 330 360 L 330 220" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" className="path-line" />
                </>
              )}
            </svg>

            {/* Central StudAI Card */}
            <div className={`absolute z-10 w-44 glass-card p-4 rounded-xl border border-brand-primary/30 flex flex-col items-center justify-center text-center shadow-xl transition-all duration-700 ${
              activeStep === 1 ? "scale-110 shadow-brand-primary/10 border-brand-primary" : "opacity-35 scale-90"
            }`}>
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2.5 border border-brand-primary/20">
                <Sparkles className="w-5 h-5 text-brand-primary" />
              </div>
              <h5 className="font-bold text-xs text-brand-text mb-1">StudAI Workspace</h5>
              <span className="text-[9px] text-brand-primary font-mono bg-brand-primary/10 px-2 py-0.5 rounded">All In One Sync</span>
            </div>

            {/* Scattered Cards */}
            {scatteredItems.map((item, idx) => {
              // Calculate custom positions for scattered phase
              const positions = [
                // Top Left
                { scattered: "top-14 left-10 md:left-16", unified: "top-1/2 left-1/2 -translate-x-[110%] -translate-y-[130%]" },
                // Top Right
                { scattered: "top-14 right-10 md:right-16", unified: "top-1/2 left-1/2 translate-x-[10%] -translate-y-[130%]" },
                // Mid Left
                { scattered: "top-[230px] left-6 md:left-10", unified: "top-1/2 left-1/2 -translate-x-[130%] -translate-y-[20%]" },
                // Mid Right
                { scattered: "top-[230px] right-6 md:right-10", unified: "top-1/2 left-1/2 translate-x-[30%] -translate-y-[20%]" },
                // Bottom
                { scattered: "bottom-10 left-1/2 -translate-x-1/2", unified: "top-1/2 left-1/2 -translate-x-1/2 translate-x-0 translate-y-[60%]" },
              ];

              const currentPos = activeStep === 1 ? positions[idx].unified : positions[idx].scattered;

              return (
                <div
                  key={idx}
                  className={`absolute p-3 rounded-xl border glass-card flex items-center gap-3 w-44 z-10 transition-all duration-700 shadow-md ${currentPos} ${
                    activeStep === 1 
                      ? "opacity-90 scale-90 border-brand-primary/30" 
                      : "scale-100"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.color} border flex items-center justify-center`}>
                    <item.icon className="w-4 h-4 text-brand-text" />
                  </div>
                  <div className="text-left">
                    <h6 className="text-[10px] font-bold text-brand-text">{item.name}</h6>
                    <p className="text-[9px] text-brand-text-muted leading-tight truncate">{activeStep === 1 ? "Integrated" : item.desc}</p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </div>
    </section>
  );
}
