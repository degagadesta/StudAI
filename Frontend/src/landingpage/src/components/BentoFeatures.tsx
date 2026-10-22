import {
  Sparkles,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Layers,
  ShieldCheck,
} from "lucide-react";
import DashboardImg1 from "../assets/dashboard1.png";
import summary from "../assets/summary.png";
import pastExam from "../assets/pastExam.png";
import quiz from "../assets/quiz.png";
import flashCard from "../assets/flashcard.png";
import aiChat from "../assets/aichat.png";

export default function BentoFeatures() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-brand-border/20 bg-brand-bg-darker py-24 md:py-32"
    >
      {/* Background glow */}
      <div className="glow-bg glow-green pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 opacity-10" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto mb-20 flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-brand-primary/25 bg-brand-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-primary">
            Everything You Need To Study
          </span>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl md:text-5xl">
            One workspace. <br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Your entire study system.
            </span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Unified Workspace (Full Row) */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col gap-6 md:col-span-2 lg:col-span-3 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group">
            {/* Ambient lighting inside card */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-brand-primary" />
                </span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  THE WORKSPACE
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                Your Unified Study Hub
              </h3>
              <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                Your lecture materials, dynamic study notes editor, and context-aware AI assistant are mapped side-by-side. Everything stays in context, helping you enter the ultimate flow state.
              </p>
            </div>

            {/* Browser Mockup Frame */}
            <div className="relative rounded-2xl border border-white/10 bg-brand-bg-darker/60 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden mt-2 transition-all duration-500 group-hover:border-brand-primary/25">
              {/* Window Controls */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <div className="mx-auto flex items-center bg-white/5 rounded px-3 py-0.5 text-[9px] text-brand-text-muted/60 w-44 md:w-60 border border-white/5">
                  <span className="truncate">studai.app/workspace/operating-systems</span>
                </div>
              </div>
              {/* Actual Platform Screenshot */}
              <div className="overflow-hidden rounded-xl border border-white/5">
                <img
                  src={DashboardImg1}
                  alt="StudAI workspace dashboard"
                  className="block h-auto w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: AI Tutor Chat */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between gap-6 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group md:col-span-1 lg:col-span-1">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                </span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  AI ASSISTANT
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                Context-Aware AI Tutor
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Chat directly with StudAI about your notes or slides. The assistant reads what you highlight, explaining complex topics instantly.
              </p>
            </div>

            {/* Chat Screenshot Mockup Frame */}
            <div className="relative rounded-2xl border border-white/5 bg-brand-bg-darker/60 p-1 shadow-lg overflow-hidden transition-all duration-500 group-hover:border-brand-primary/20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
              </div>
              <div className="h-64 overflow-y-auto">
                <img
                  src={aiChat}
                  alt="AI Chat assistant"
                  className="w-full h-auto block rounded-b-xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Smart Summaries */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between gap-6 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group md:col-span-1 lg:col-span-1">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-brand-primary" />
                </span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  DOCUMENT SUMMARIES
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                Instant Smart Summaries
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Transform massive PDFs and academic chapters into concise, clean summaries highlighting key formulas, definitions, and concepts.
              </p>
            </div>

            {/* Summarizer Screenshot Mockup Frame */}
            <div className="relative rounded-2xl border border-white/5 bg-brand-bg-darker/60 p-1 shadow-lg overflow-hidden transition-all duration-500 group-hover:border-brand-primary/20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
              </div>
              <div className="h-64 overflow-y-auto">
                <img
                  src={summary}
                  alt="Document Summary"
                  className="w-full h-auto block rounded-b-xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: AI Quiz Generator */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between gap-6 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group md:col-span-1 lg:col-span-1">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                </span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  QUIZ GENERATOR
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                Dynamic Practice Quizzes
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Generate practice exams with varying difficulty levels and sizes. Test your knowledge on exactly what will be graded.
              </p>
            </div>

            {/* Quiz Screenshot Mockup Frame */}
            <div className="relative rounded-2xl border border-white/5 bg-brand-bg-darker/60 p-1 shadow-lg overflow-hidden transition-all duration-500 group-hover:border-brand-primary/20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
              </div>
              <div className="h-64 overflow-y-auto">
                <img
                  src={quiz}
                  alt="AI Quiz generator"
                  className="w-full h-auto block rounded-b-xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Past Exams (Spans 2 columns) */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row justify-between gap-6 md:col-span-2 lg:col-span-2 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group">
            {/* Background blur */}
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex-1 flex flex-col justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-brand-primary" />
                  </span>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                    EXAM PREPARATION
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                  Past Exam Intelligence
                </h3>
                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                  Practice past exams inside our interactive viewer. Compare your answers with precise grading guidelines and previous university exam sheets.
                </p>
              </div>
              
              <div className="flex flex-col gap-2.5 mt-2">
                {[
                  "Grounded in real university exam archives",
                  "Identify recurring questions and topics",
                  "Get step-by-step solutions for calculation problems",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-brand-text">
                    <span className="text-brand-primary font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Screenshot Mockup Frame */}
            <div className="flex-1 relative rounded-2xl border border-white/5 bg-brand-bg-darker/60 p-1 shadow-lg overflow-hidden transition-all duration-500 group-hover:border-brand-primary/20 md:max-w-xs self-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
              </div>
              <div className="h-64 overflow-y-auto">
                <img
                  src={pastExam}
                  alt="Past Exams Practice"
                  className="w-full h-auto block rounded-b-xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Flashcards */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between gap-6 text-left bg-brand-bg/40 shadow-2xl relative overflow-hidden group md:col-span-1 lg:col-span-1">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                </span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  FLASHCARDS
                </span>
              </div>
              <h3 className="text-lg font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                Smart Active Recall
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Convert your summaries or selected lecture concepts into study flashcard decks. Retain information longer with randomized active recall tests.
              </p>
            </div>

            {/* Flashcard Screenshot Mockup Frame */}
            <div className="relative rounded-2xl border border-white/5 bg-brand-bg-darker/60 p-1 shadow-lg overflow-hidden transition-all duration-500 group-hover:border-brand-primary/20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
                <div className="w-2 h-2 rounded-full bg-brand-primary/30" />
              </div>
              <div className="h-64 overflow-y-auto">
                <img
                  src={flashCard}
                  alt="AI Flashcards"
                  className="w-full h-auto block rounded-b-xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
