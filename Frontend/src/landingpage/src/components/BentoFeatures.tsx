import { MessageSquare, FileText, Layers, CheckSquare, Calendar, Compass } from "lucide-react";

export default function BentoFeatures() {
  const features = [
    {
      id: "ai-tutor",
      label: "AI Tutor",
      title: "Ask. Understand. Learn.",
      desc: "Get instant answers grounded in your specific university course materials and past lectures.",
      icon: MessageSquare,
      className: "md:col-span-2 row-span-1 bg-gradient-to-br from-brand-dark-green/20 via-brand-bg-darker/10 to-brand-bg-darker border-brand-border/30",
      ui: (
        <div className="flex flex-col gap-2 mt-4 bg-brand-bg-darker/60 rounded-xl p-3 border border-brand-border/10 max-w-[90%] md:max-w-[75%]">
          <div className="flex gap-2 items-start text-[10px]">
            <span className="text-brand-primary font-bold">Student:</span>
            <span className="text-brand-text-muted">Is Banker's algorithm safe?</span>
          </div>
          <div className="flex gap-2 items-start text-[10px] border-t border-brand-border/10 pt-2">
            <span className="text-brand-primary font-bold">StudAI:</span>
            <span className="text-brand-text leading-relaxed">It is safe if the system can allocate resources to each process in some order and avoid deadlock...</span>
          </div>
        </div>
      )
    },
    {
      id: "summaries",
      label: "Smart Summaries",
      title: "Turn lectures into clarity.",
      desc: "Transform long, messy lecture PDFs into organized key concepts, core formulas, and clear study notes.",
      icon: FileText,
      className: "md:col-span-1 row-span-1",
      ui: (
        <div className="flex flex-col gap-1.5 mt-4 bg-brand-bg-darker/50 rounded-xl p-3 border border-brand-border/10 text-[10px]">
          <div className="flex items-center justify-between text-brand-text font-bold pb-1 border-b border-brand-border/10">
            <span>Chapter 5 Summary</span>
            <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">PDF Synced</span>
          </div>
          <div className="text-brand-text-muted flex flex-col gap-1">
            <span>• 4 core deadlock conditions</span>
            <span>• Bankers safety state formula</span>
            <span>• Resource allocation matrix</span>
          </div>
        </div>
      )
    },
    {
      id: "flashcards",
      label: "Flashcards",
      title: "Remember what matters.",
      desc: "AI identifies key terms from your files and builds active-recall flashcard sets automatically.",
      icon: Layers,
      className: "md:col-span-1 row-span-1",
      ui: (
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[200px] aspect-[1.6] bg-brand-dark-green/30 border border-brand-primary/20 hover:border-brand-primary/45 rounded-xl p-4.5 flex flex-col justify-between text-left transition-colors duration-300">
            <span className="text-[8px] uppercase tracking-wider text-brand-primary font-bold">Flashcard #12</span>
            <span className="text-xs font-bold text-brand-text leading-snug">Mutex vs. Semaphore difference?</span>
            <span className="text-[8px] text-brand-text-muted text-right">Click to reveal answer</span>
          </div>
        </div>
      )
    },
    {
      id: "quizzes",
      label: "Quizzes",
      title: "Practice without limits.",
      desc: "Generate infinite quizzes by question count and difficulty, matching your exact course curriculum.",
      icon: CheckSquare,
      className: "md:col-span-1 row-span-1",
      ui: (
        <div className="mt-4 flex flex-col gap-2 bg-brand-bg-darker/50 rounded-xl p-3 border border-brand-border/10">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-brand-text font-bold">Quick Quiz</span>
            <span className="text-brand-primary font-bold">15/20 Correct</span>
          </div>
          <div className="w-full h-1 bg-brand-dark-green/30 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary" style={{ width: "75%" }}></div>
          </div>
          <span className="text-[8px] text-brand-text-muted text-left">Difficulty: Medium • Year 4 OS</span>
        </div>
      )
    },
    {
      id: "exams",
      label: "Previous Exams",
      title: "Your past exams, organized.",
      desc: "Stop hunting Telegram channels. Access organized previous exams filtered by course, department, and year.",
      icon: Compass,
      className: "md:col-span-1 row-span-1",
      ui: (
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {["2021 Mid", "2022 Final", "2023 Mid", "2024 Final"].map((badge, idx) => (
            <span key={idx} className="text-[9px] font-semibold text-brand-text bg-brand-dark-green/40 border border-brand-border/30 px-2.5 py-1 rounded-lg">
              {badge}
            </span>
          ))}
        </div>
      )
    },
    {
      id: "planner",
      label: "Study Planner",
      title: "Know what to study next.",
      desc: "Turn your current academic weaknesses and upcoming test schedules into a structured, daily plan.",
      icon: Calendar,
      className: "md:col-span-3 row-span-1 bg-gradient-to-br from-brand-bg-darker via-brand-bg-darker to-brand-dark-green/20 border-brand-border/30",
      ui: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { day: "Mon", task: "Deadlock Banker's", time: "45 min", status: "Done", color: "text-brand-primary" },
            { day: "Tue", task: "Page Replacement", time: "30 min", status: "Next", color: "text-brand-primary/50" },
            { day: "Wed", task: "OS Mock Final", time: "60 min", status: "Scheduled", color: "text-brand-text-muted" },
          ].map((item, idx) => (
            <div key={idx} className="bg-brand-bg-darker/60 border border-brand-border/10 p-3 rounded-lg flex items-center justify-between text-[10px]">
              <div>
                <span className="text-[8px] font-bold text-brand-text-muted uppercase block">{item.day}</span>
                <span className="font-bold text-brand-text">{item.task}</span>
              </div>
              <div className="text-right">
                <span className="block font-mono text-[9px] text-brand-text-muted">{item.time}</span>
                <span className={`font-bold ${item.color} text-[9px]`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 bg-brand-bg-darker border-b border-brand-border/20 overflow-hidden">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/3 right-1/4 w-[500px] h-[500px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Everything You Need To Study
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            One workspace. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              Your entire study system.
            </span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 min-h-[250px] text-left group ${feature.className}`}
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary mb-5 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1.5 block">
                    {feature.label}
                  </span>
                  <h3 className="text-lg font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-brand-text-muted leading-relaxed max-w-md">
                    {feature.desc}
                  </p>
                </div>

                {/* Micro-UI representation */}
                {feature.ui}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
