import { useState } from "react";
import { TrendingUp } from "lucide-react";

export default function ExamIntelligence() {
  const [selectedTopic, setSelectedTopic] = useState(0);

  const topics = [
    { name: "Deadlock & Bankers", importance: 92, count: 9, trend: "Highly Recurrent", years: ["2021", "2022", "2023", "2024", "2025"], desc: "Appears consistently in Part II short answers and problem-solving questions. Usually carries 15-20% of exam weight." },
    { name: "Semaphores & Mutex", importance: 84, count: 7, trend: "Frequent", years: ["2021", "2023", "2024", "2025"], desc: "Typically tested under process synchronization, focusing on producer-consumer or dining philosophers implementations." },
    { name: "CPU Scheduling Algorithms", importance: 80, count: 6, trend: "Consistent", years: ["2022", "2023", "2025"], desc: "Practical calculations on Turnaround Time (TAT) and Waiting Time (WT) using Gantt charts are highly standard." },
    { name: "Page Replacement (LRU/FIFO)", importance: 71, count: 5, trend: "Moderate", years: ["2021", "2022", "2024"], desc: "Focuses on page faults computation and virtual memory mapping. Easy scoring section if practice is complete." },
    { name: "Memory Allocation & Paging", importance: 65, count: 4, trend: "Stable", years: ["2022", "2024", "2025"], desc: "Definitions of internal/external fragmentation and dynamic partition schemes (First-Fit, Best-Fit)." },
  ];

  return (
    <section id="exam-intelligence" className="relative py-24 md:py-32 bg-brand-bg overflow-hidden border-b border-brand-border/20">
      {/* Background glow behind dashboard */}
      <div className="glow-bg glow-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-15 pointer-events-none -z-10 animate-pulse-glow"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Exam Intelligence™
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Stop guessing what <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">will be on the exam.</span>
          </h2>
          <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed max-w-2xl">
            StudAI analyzes previous exams to identify repeated topics, difficulty curves, question patterns, and weighting — helping you focus your preparation where it matters most.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Side: Topic breakdown selector */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Most Important Topics</h3>
              <span className="text-[10px] text-brand-primary font-mono bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/10">Operating Systems</span>
            </div>

            <div className="flex flex-col gap-3">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTopic(idx)}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    selectedTopic === idx
                      ? "bg-brand-dark-green/30 border-brand-primary/45 shadow-lg shadow-brand-primary/5"
                      : "bg-brand-bg-darker/20 border-brand-border/15 hover:border-brand-border/40 hover:bg-brand-bg-darker/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand-text-muted/65">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text leading-tight">{t.name}</h4>
                      <span className="text-[9px] text-brand-primary font-semibold">{t.trend}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-brand-primary">{t.importance}%</span>
                    <span className="text-[9px] text-brand-text-muted block">Relevance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Visual Analytics Dashboard */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 border border-brand-border/30 flex flex-col justify-between bg-brand-bg-darker/25">
            
            {/* Header bar of statistics */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border/15">
                <div>
                  <h4 className="text-sm font-bold text-brand-text">Topic Deep-Dive</h4>
                  <p className="text-[10px] text-brand-text-muted">Selected topic relevance & occurrence metrics</p>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded border border-brand-primary/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Topic Weight</span>
                </div>
              </div>

              {/* Topic Description details */}
              <div className="text-left mb-6">
                <h5 className="font-bold text-base text-brand-text mb-2">{topics[selectedTopic].name}</h5>
                <p className="text-xs text-brand-text-muted leading-relaxed mb-4">
                  {topics[selectedTopic].desc}
                </p>

                {/* Occurrence History Badges */}
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted/80 block mb-2.5">
                  Exam Occurrence History
                </span>
                <div className="flex gap-2 flex-wrap">
                  {["2021", "2022", "2023", "2024", "2025"].map((year) => {
                    const exists = topics[selectedTopic].years.includes(year);
                    return (
                      <span
                        key={year}
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-3 py-1 rounded-full border transition-all duration-300 ${
                          exists
                            ? "bg-brand-primary/15 text-brand-primary border-brand-primary/30"
                            : "bg-brand-bg-darker/40 text-brand-text-muted/40 border-brand-border/10"
                        }`}
                      >
                        {exists ? "✓" : "✗"} {year}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Graph showing topic frequency */}
            <div className="mt-4 pt-4 border-t border-brand-border/15">
              <div className="flex justify-between items-center text-[10px] mb-3 text-brand-text-muted uppercase tracking-wider font-bold">
                <span>Occurrence Frequency</span>
                <span>Max occurrences: 10</span>
              </div>
              <div className="relative h-20 w-full flex items-end justify-between px-2 pt-2">
                
                {/* Horizontal bars inside chart */}
                {topics.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedTopic(idx)}>
                    <div className="relative w-8 bg-brand-dark-green/30 rounded-t overflow-hidden border border-brand-border/20 transition-all duration-300 group-hover:border-brand-primary/40 h-14">
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500 ${
                          selectedTopic === idx ? "bg-brand-primary shadow-[0_0_8px_rgba(152,201,135,0.4)]" : "bg-brand-primary/45"
                        }`}
                        style={{ height: `${(t.count / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-[8px] font-bold ${selectedTopic === idx ? "text-brand-primary" : "text-brand-text-muted"}`}>
                      T0{idx + 1}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* Visual communication footer tagline */}
            <div className="mt-6 text-center text-[10px] text-brand-text-muted bg-brand-primary/5 border border-brand-primary/10 rounded-lg p-2.5">
              💡 **StudAI doesn't just help you study.** It highlights exact patterns to help you prepare with safety.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
