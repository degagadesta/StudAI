import { Play, Sparkles, BookOpen, GraduationCap, CheckCircle2, ChevronRight, BarChart2 } from "lucide-react";

export default function DashboardMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 px-4 md:px-0 z-10">
      {/* Background glow behind dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-glow-slow"></div>

      {/* Main Glassmorphism Dashboard Container */}
      <div className="glass-card rounded-2xl overflow-hidden border border-brand-border/40 shadow-2xl flex flex-col md:flex-row text-left min-h-[520px]">
        
        {/* Sidebar Nav (Miniature SaaS navigation) */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-brand-border/20 p-5 bg-brand-bg-darker/35 flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2">
            <GraduationCap className="w-5 h-5 text-brand-primary" />
            <span className="font-display font-bold text-sm tracking-wide text-brand-text">StudAI Space</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-brand-text-muted/65 uppercase tracking-wider px-2 mb-1">Study Dashboard</span>
            {[
              { name: "Overview", icon: BookOpen, active: true },
              { name: "My Courses", icon: GraduationCap },
              { name: "Exam Analytics", icon: BarChart2 },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  item.active
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                    : "text-brand-text-muted hover:text-brand-text hover:bg-brand-border/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </div>

          <div className="mt-auto hidden md:block">
            <div className="bg-brand-dark-green/30 border border-brand-border/30 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-brand-primary text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AASTU Portal Live</span>
              </div>
              <p className="text-[10px] text-brand-text-muted leading-relaxed">
                Curriculum synchronized with Software Engineering, Year 4.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content Area */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-brand-border/10">
            <div>
              <h3 className="text-lg font-bold text-brand-text">Good morning, Abel 👋</h3>
              <p className="text-xs text-brand-text-muted">Here is your customized study status for today.</p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2 py-1 rounded-full border border-brand-primary/20">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span>
                Personalized Plan Active
              </span>
            </div>
          </div>

          {/* Grid Layout inside Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Progress & Daily Plan */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Continue Studying Card */}
              <div className="bg-brand-bg-darker/25 border border-brand-border/20 rounded-xl p-4 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">Continue Studying</span>
                    <h4 className="font-bold text-sm text-brand-text">Operating Systems (ECEg-4121)</h4>
                  </div>
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">82% Complete</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-brand-dark-green/45 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: "82%" }}
                  ></div>
                </div>
                <p className="text-[10px] text-brand-text-muted">Next up: Chapter 5 — Semaphores & Deadlock Avoidance</p>
              </div>

              {/* Today's Study Plan */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Today's Study Plan</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { duration: "45 min", topic: "Deadlock Conditions & Bank's Algorithm", desc: "Focus: Resource Allocation Graphs" },
                    { duration: "30 min", topic: "Memory Management Schemes", desc: "Focus: Page Replacement algorithms" },
                    { duration: "20 min", topic: "OS Quick Practice Exam", desc: "20 Questions • Medium difficulty" },
                  ].map((plan, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-brand-bg-darker/15 border border-brand-border/10 hover:border-brand-border/30 rounded-xl p-3 transition-colors duration-300">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-4.5 h-4.5 rounded-full border border-brand-border flex items-center justify-center text-[10px] font-bold text-brand-primary bg-brand-dark-green/10">
                          {idx + 1}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-brand-text">{plan.topic}</h5>
                          <p className="text-[10px] text-brand-text-muted">{plan.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10">{plan.duration}</span>
                        <button className="p-1.5 rounded-lg bg-brand-primary text-brand-bg hover:scale-105 transition-transform duration-200">
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Weak Topics & Exam Intelligence */}
            <div className="flex flex-col gap-5">
              {/* Weak Topics */}
              <div className="bg-brand-bg-darker/20 border border-brand-border/25 rounded-xl p-4.5">
                <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Weak Topics</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { topic: "Deadlock Detection", level: "High Workload", pct: 90, color: "bg-red-400/80" },
                    { topic: "Memory Management", level: "Medium Workload", pct: 60, color: "bg-amber-400/80" },
                    { topic: "CPU Scheduling", level: "Low Workload", pct: 30, color: "bg-brand-primary" },
                  ].map((t, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-brand-text">{t.topic}</span>
                        <span className="text-[10px] text-brand-text-muted">{t.level}</span>
                      </div>
                      <div className="w-full h-1 bg-brand-dark-green/30 rounded-full overflow-hidden">
                        <div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Intelligence Checklist */}
              <div className="bg-brand-bg-darker/20 border border-brand-border/25 rounded-xl p-4.5 flex-1">
                <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Exam Intelligence</h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { topic: "Deadlock & Bankers", relevance: "92% Relevance" },
                    { topic: "Semaphore & Mutex", relevance: "84% Relevance" },
                    { topic: "CPU Scheduling", relevance: "71% Relevance" },
                  ].map((topic, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-brand-border/10 last:border-0">
                      <span className="font-semibold text-brand-text">{topic.topic}</span>
                      <span className="text-[10px] text-brand-primary font-mono">{topic.relevance}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Floating Card 1: AI Tutor (Positioned floating around mockup, hidden on small screens) */}
      <div className="hidden lg:block absolute -left-28 top-12 w-64 glass-card rounded-xl p-4 border border-brand-primary/20 shadow-xl animate-float z-20 bg-brand-bg-darker/80">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/25">
            <Sparkles className="w-3 h-3 text-brand-primary" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">AI Tutor Session</span>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="bg-brand-border/15 p-2 rounded-lg text-[10px] text-brand-text text-left max-w-[85%] self-start border border-brand-border/10">
            <span className="font-bold block text-[9px] text-brand-text-muted mb-0.5">Student</span>
            Why does deadlock happen?
          </div>
          <div className="bg-brand-primary/5 p-2.5 rounded-lg text-[10px] text-brand-text text-left max-w-[90%] self-end border border-brand-primary/15">
            <span className="font-bold block text-[9px] text-brand-primary mb-0.5">StudAI</span>
            Deadlock occurs when four conditions exist simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.
          </div>
        </div>
      </div>

      {/* Floating Card 2: Exam Intelligence Details (Right absolute float) */}
      <div className="hidden lg:block absolute -right-28 -top-8 w-60 glass-card rounded-xl p-4 border border-brand-primary/20 shadow-xl animate-float-delayed z-20 bg-brand-bg-darker/80">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">Exam Intelligence</span>
          <span className="text-[9px] bg-brand-primary/15 text-brand-primary px-1.5 py-0.5 rounded font-bold border border-brand-primary/20">92% Relevance</span>
        </div>
        <div className="text-left">
          <h4 className="font-bold text-xs text-brand-text mb-1.5">Deadlock & Bankers</h4>
          <p className="text-[10px] text-brand-text-muted mb-3">Found in previous AASTU exams:</p>
          <div className="flex gap-1.5 flex-wrap">
            {["2021", "2022", "2023", "2024", "2025"].map((yr) => (
              <span key={yr} className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-brand-text bg-brand-dark-green/40 px-2 py-0.5 rounded border border-brand-border/30">
                <CheckCircle2 className="w-2.5 h-2.5 text-brand-primary" />
                {yr}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Card 3: AI Practice Exam (Bottom absolute float) */}
      <div className="hidden lg:block absolute -right-20 -bottom-10 w-64 glass-card rounded-xl p-4 border border-brand-primary/20 shadow-xl animate-float z-20 bg-brand-bg-darker/85">
        <div className="flex items-start justify-between mb-3 text-left">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-brand-text-muted">Practice Module</span>
            <h4 className="font-bold text-xs text-brand-text">OS Practice Exam</h4>
          </div>
          <span className="text-[9px] text-brand-primary bg-brand-primary/15 border border-brand-primary/25 px-2 py-0.5 rounded font-semibold">20 Qs</span>
        </div>
        <div className="flex justify-between items-center text-[10px] border-t border-brand-border/10 pt-3">
          <span className="text-brand-text-muted">Difficulty: <span className="text-brand-primary font-bold">Medium</span></span>
          <button className="flex items-center gap-1 font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
            Start Exam
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
