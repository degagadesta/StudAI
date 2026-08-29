import { FileCheck2 } from "lucide-react";
import aiChat from "../assets/aichat.png";

export default function AITutorSection() {
  return (
    <section className="relative py-24 md:py-32 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">
      {/* Background radial glow */}
      <div className="glow-bg glow-green absolute bottom-0 right-1/4 w-[500px] h-[500px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Side: Copy */}
          <div className="lg:col-span-5 text-left flex flex-col gap-5">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25 self-start">
              AI Tutor
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text leading-tight">
              Finally, an AI that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">knows your course.</span>
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              Ask questions and get answers grounded in your actual lecture materials, course syllabus, and previous exams. No more generic search templates.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              {[
                "Verifies citations directly from your lecture slides",
                "Applies local academic grading parameters (e.g. AASTU systems)",
                "Generates immediate context-aware examples",
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-brand-text">
                  <div className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary shrink-0">
                    <FileCheck2 className="w-3 h-3" />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Chat Mockup Image */}
          <div className="lg:col-span-7 relative rounded-2xl border border-white/10 bg-brand-bg-darker/60 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-500 hover:border-brand-primary/20 group">
            {/* Browser header controls */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <div className="ml-4 flex items-center bg-white/5 rounded px-3 py-1 text-[11px] text-brand-text-muted/80 w-60 border border-white/5">
                <span className="truncate">studai.app/tutor/operating-systems</span>
              </div>
            </div>

            {/* Image wrapper */}
            <div className="overflow-hidden rounded-xl border border-white/5">
              <img
                src={aiChat}
                alt="StudAI AI Tutor Chat"
                className="block w-[65%] h-auto object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
