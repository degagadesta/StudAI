import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";

export default function PersonalizedSection() {
  const [seconds, setSeconds] = useState(2700); // 45 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [activePlanIdx, setActivePlanIdx] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const weakTopics = [
    { name: "Deadlock", priority: "High Priority", width: "95%", color: "bg-red-400/80" },
    { name: "Memory Management", priority: "Medium Priority", width: "65%", color: "bg-amber-400/80" },
    { name: "CPU Scheduling", priority: "Low Priority", width: "35%", color: "bg-brand-primary" },
  ];

  const dailyPlans = [
    { duration: "45 min", topic: "Deadlock Recovery & Prevention", type: "Tutor Reading" },
    { duration: "30 min", topic: "Memory Segmentation vs Paging", type: "Active Recall" },
    { duration: "20 min", topic: "OS Past Exam Questions", type: "Practice Exam" },
  ];

  const handleStartPlan = () => {
    setIsRunning(!isRunning);
  };

  return (
    <section className="relative py-24 md:py-32 bg-brand-bg overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/2 right-10 w-[500px] h-[500px] opacity-10 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Weakness tracking list */}
          <div className="lg:col-span-5 text-left flex flex-col gap-5">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25 self-start">
              Personalized Study
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text leading-tight">
              StudAI learns <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">where you're weak.</span>
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              Every practice session, quiz, and AI chat shapes your academic model. StudAI maps your gaps and creates a focused daily plan to protect your grades.
            </p>

            <div className="bg-brand-bg-darker/35 border border-brand-border/20 rounded-xl p-5 flex flex-col gap-4 mt-4">
              <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Your Weak Topics</h4>
              
              <div className="flex flex-col gap-4.5">
                {weakTopics.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-text">{item.name}</span>
                      <span className="text-brand-primary text-[10px] uppercase font-mono">{item.priority}</span>
                    </div>
                    <div className="w-full h-2 bg-brand-dark-green/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                        style={{ width: item.width }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Active study planner/timer */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6 items-stretch">
            
            {/* Today's schedule list */}
            <div className="flex-1 bg-brand-bg-darker/20 border border-brand-border/20 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Today's Active Plan</span>
              
              <div className="flex flex-col gap-2.5">
                {dailyPlans.map((plan, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePlanIdx(idx);
                      setSeconds(idx === 0 ? 2700 : idx === 1 ? 1800 : 1200);
                      setIsRunning(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                      activePlanIdx === idx
                        ? "bg-brand-primary/10 border-brand-primary/40 text-brand-text shadow-lg shadow-brand-primary/5"
                        : "bg-brand-bg-darker/10 border-brand-border/10 text-brand-text-muted hover:border-brand-border/30 hover:bg-brand-bg-darker/20"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-brand-primary">{plan.type}</span>
                      <span className="text-[10px] font-mono text-brand-text font-bold">{plan.duration}</span>
                    </div>
                    <h4 className="text-xs font-bold">{plan.topic}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer mockup card */}
            <div className="w-full md:w-64 bg-brand-bg-darker/40 border border-brand-border/35 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-primary/5 opacity-40 pointer-events-none"></div>
              
              <div className="flex items-center gap-1 bg-brand-primary/15 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-primary/25 mb-4 z-10">
                <Sparkles className="w-3 h-3 animate-spin [animation-duration:4s]" />
                <span>Session Live</span>
              </div>

              <div className="z-10 flex flex-col gap-1.5 my-2">
                <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">Active Timer</span>
                <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-brand-text drop-shadow-[0_4px_12px_rgba(152,201,135,0.2)]">
                  {formatTime(seconds)}
                </span>
                <span className="text-[10px] font-bold text-brand-primary italic max-w-[150px] mx-auto leading-relaxed mt-1">
                  "{dailyPlans[activePlanIdx].topic}"
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-6 z-10 w-full">
                <button
                  onClick={handleStartPlan}
                  className="flex-1 bg-brand-primary text-brand-bg hover:bg-brand-primary-hover font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_-3px_rgba(152,201,135,0.3)] transition-colors"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Start Today's Plan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setSeconds(activePlanIdx === 0 ? 2700 : activePlanIdx === 1 ? 1800 : 1200);
                  }}
                  className="p-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-brand-border/10 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
