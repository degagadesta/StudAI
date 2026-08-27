import { FileUp, BrainCircuit, MessageSquare, Flame, BarChart3, Target } from "lucide-react";

export default function StudyLoop() {
  const steps = [
    {
      no: "01",
      name: "Upload",
      subtitle: "Lecture PDF",
      icon: FileUp,
      desc: "Upload slides, syllabus, or notes in any format.",
    },
    {
      no: "02",
      name: "Understand",
      subtitle: "AI Summary",
      icon: BrainCircuit,
      desc: "StudAI extracts definitions, formulas, and concepts.",
    },
    {
      no: "03",
      name: "Ask",
      subtitle: "AI Tutor",
      icon: MessageSquare,
      desc: "Ask questions grounded in the context of your files.",
    },
    {
      no: "04",
      name: "Practice",
      subtitle: "Flashcards + Quizzes",
      icon: Flame,
      desc: "Generate active recall questions on key items.",
    },
    {
      no: "05",
      name: "Analyze",
      subtitle: "Exam Intelligence",
      icon: BarChart3,
      desc: "Highlight highly recurrent topics across past exams.",
    },
    {
      no: "06",
      name: "Improve",
      subtitle: "Personalized Plan",
      icon: Target,
      desc: "Cover weak areas and hit your GPA targets.",
    },
  ];

  return (
    <section id="how-it-works-timeline" className="relative py-24 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/2 right-1/4 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            The Study Loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-brand-text tracking-tight">
            How StudAI prepares you.
          </h2>
          <p className="text-sm text-brand-text-muted max-w-lg leading-relaxed">
            A complete loop from raw files to total confidence before you step into the exam hall.
          </p>
        </div>

        {/* Process Loop: Desktop (Horizontal with SVG Paths) */}
        <div className="hidden lg:block relative py-12">
          
          {/* Animated Connecting SVG Path */}
          <svg className="absolute top-[76px] left-[8%] right-[8%] w-[84%] h-[20px] pointer-events-none z-0" overflow="visible">
            <path
              d="M 0 10 L 1000 10"
              stroke="rgba(152, 201, 135, 0.15)"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M 0 10 L 1000 10"
              stroke="var(--color-brand-primary)"
              strokeWidth="2.5"
              strokeDasharray="12 24"
              fill="none"
              className="path-line opacity-65"
            />
          </svg>

          {/* Steps Grid */}
          <div className="grid grid-cols-6 gap-4 relative z-10">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center group text-center px-2">
                  
                  {/* Step Bubble Icon */}
                  <div className="relative w-16 h-16 rounded-full bg-brand-bg border-2 border-brand-border/40 group-hover:border-brand-primary/60 flex items-center justify-center text-brand-text transition-all duration-300 shadow-md group-hover:scale-105 z-10">
                    <div className="absolute inset-0 bg-brand-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <IconComp className="w-6.5 h-6.5 group-hover:text-brand-primary transition-colors duration-300" />
                    
                    {/* Step No badge */}
                    <span className="absolute -top-1 -right-1 bg-brand-primary text-brand-bg font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-brand-bg">
                      {step.no}
                    </span>
                  </div>

                  {/* Copy */}
                  <h4 className="font-bold text-sm text-brand-text mt-5 mb-1 group-hover:text-brand-primary transition-colors duration-300">
                    {step.name}
                  </h4>
                  <span className="text-[10px] text-brand-primary font-semibold mb-2.5 block">
                    {step.subtitle}
                  </span>
                  <p className="text-[10.5px] text-brand-text-muted leading-relaxed px-1">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Process Loop: Mobile/Tablet (Vertical Timeline) */}
        <div className="lg:hidden flex flex-col gap-6 relative pl-8 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-brand-border/30">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center gap-4 text-left group">
                
                {/* Connector dot */}
                <div className="absolute -left-[28px] top-1.5 w-4 h-4 rounded-full bg-brand-bg border-2 border-brand-border/60 group-hover:border-brand-primary flex items-center justify-center z-10 transition-colors duration-300">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Inner card style */}
                <div className="flex-1 glass-card p-4 rounded-xl border border-brand-border/20 flex gap-4 items-start bg-brand-bg-darker/15">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono text-brand-primary bg-brand-primary/10 px-1.5 py-0.2 rounded font-bold">
                        Step {step.no}
                      </span>
                      <h4 className="font-bold text-sm text-brand-text">{step.name}</h4>
                    </div>
                    <span className="text-[10px] text-brand-primary font-medium block mb-2">{step.subtitle}</span>
                    <p className="text-xs text-brand-text-muted leading-relaxed">{step.desc}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
