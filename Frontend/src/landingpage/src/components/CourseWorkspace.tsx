import { useState } from "react";
import { Folder, Layers, BookOpen, GraduationCap, ChevronRight, MessageSquare, ShieldCheck, Flame, PieChart, Sparkles } from "lucide-react";

export default function CourseWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    { name: "Overview", icon: BookOpen },
    { name: "Materials", icon: Folder },
    { name: "Past Exams", icon: GraduationCap },
    { name: "Practice", icon: Flame },
    { name: "Notes", icon: Layers },
    { name: "Flashcards", icon: ShieldCheck },
    { name: "AI Chat", icon: MessageSquare },
    { name: "Statistics", icon: PieChart },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute bottom-1/3 left-10 w-[550px] h-[550px] opacity-15 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Course Workspace
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Everything for one course.
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Switch tabs to inspect how StudAI structures, filters, and manages your single course preparation workspace.
          </p>
        </div>

        {/* Major Mockup Shell */}
        <div className="glass-card rounded-2xl border border-brand-border/40 overflow-hidden shadow-2xl flex flex-col min-h-[500px] text-left bg-brand-bg/40">
          
          {/* Header Bar */}
          <div className="bg-brand-bg-darker/60 border-b border-brand-border/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-text">Operating Systems</h3>
                <p className="text-[10px] text-brand-text-muted">AASTU • Software Engineering • Semester I • ECEg-4121</p>
              </div>
            </div>
            
            {/* Progress indicators */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-brand-text-muted font-bold">Course Completion</span>
                <span className="text-sm font-bold text-brand-primary">78%</span>
              </div>
              <div className="w-32 h-2 bg-brand-dark-green/45 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="bg-brand-bg-darker/25 border-b border-brand-border/10 flex overflow-x-auto whitespace-nowrap scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-5 py-4 border-b-2 font-semibold text-xs transition-all duration-300 ${
                    activeTab === tab.name
                      ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                      : "border-transparent text-brand-text-muted hover:text-brand-text hover:bg-brand-border/5"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Panel Body Content */}
          <div className="p-6 md:p-8 flex-1 bg-brand-bg-darker/10">
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse-glow-slow">
                
                {/* Stats Dashboard */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Syllabus Lectures", value: "12 Lectures", color: "text-brand-primary" },
                    { label: "Previous Exams Indexed", value: "8 Exams", color: "text-brand-primary" },
                    { label: "Active Flashcards", value: "120 Cards", color: "text-brand-primary" },
                    { label: "Mock Practice Exams", value: "4 Exams", color: "text-brand-primary" },
                    { label: "AI Tutor Sessions", value: "17 Sessions", color: "text-brand-primary" },
                    { label: "Core Study Notes", value: "6 Guides", color: "text-brand-primary" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-brand-bg-darker/35 border border-brand-border/15 p-4.5 rounded-xl hover:border-brand-border/40 transition-colors duration-300">
                      <span className="text-[9px] uppercase tracking-wider text-brand-text-muted font-bold block mb-1.5">{stat.label}</span>
                      <span className={`text-sm md:text-base font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Task Summary */}
                <div className="bg-brand-bg-darker/20 border border-brand-border/20 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-3">Recent Study Activity</h4>
                    <div className="flex flex-col gap-3">
                      {[
                        { time: "2 hours ago", desc: "Summarized Lecture 8 slides" },
                        { time: "Yesterday", desc: "Completed 2024 Exam Practice" },
                        { time: "3 days ago", desc: "Flagged Deadlock as weak topic" },
                      ].map((log, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="text-[9px] text-brand-primary font-mono block">{log.time}</span>
                          <span className="text-brand-text font-medium">{log.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="w-full text-center bg-brand-primary text-brand-bg text-xs font-bold py-2 rounded-lg hover:bg-brand-primary-hover transition-colors mt-6 flex items-center justify-center gap-1.5">
                    Start Next Session
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {activeTab === "Materials" && (
              <div className="flex flex-col gap-3 animate-pulse-glow-slow">
                <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">Uploaded Slides & Material</h4>
                {[
                  { name: "Lecture 08 — Deadlock Conditions.pdf", size: "2.4 MB", status: "Summarized ✓" },
                  { name: "Lecture 09 — Banker's Algorithm & Recovery.pdf", size: "3.1 MB", status: "Summarized ✓" },
                  { name: "Lecture 10 — Memory Management Scheme.pdf", size: "1.8 MB", status: "Ready for AI summary" },
                ].map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-brand-bg-darker/25 border border-brand-border/10 rounded-xl p-4 hover:border-brand-border/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 text-brand-primary">
                        <Folder className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-text">{file.name}</h5>
                        <span className="text-[9px] text-brand-text-muted">{file.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/15">{file.status}</span>
                      <button className="text-[10px] font-bold text-brand-text border border-brand-border hover:bg-brand-border/10 px-3 py-1.5 rounded-lg transition-colors">
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Past Exams" && (
              <div className="flex flex-col gap-3 animate-pulse-glow-slow">
                <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-wider mb-1">Previous Academic Exams</h4>
                {[
                  { name: "AASTU OS Midterm Exam 2024.pdf", type: "Midterm", year: "2024", relevance: "High" },
                  { name: "AASTU OS Final Exam 2023.pdf", type: "Final Exam", year: "2023", relevance: "High" },
                  { name: "AASTU OS Final Exam 2022.pdf", type: "Final Exam", year: "2022", relevance: "Medium" },
                ].map((exam, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-brand-bg-darker/25 border border-brand-border/10 rounded-xl p-4 hover:border-brand-border/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 text-brand-primary">
                        <GraduationCap className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-text">{exam.name}</h5>
                        <span className="text-[9px] text-brand-text-muted">{exam.type} • Year {exam.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/15">Relevance: {exam.relevance}</span>
                      <button className="text-[10px] font-bold bg-brand-primary text-brand-bg px-3 py-1.5 rounded-lg hover:bg-brand-primary-hover transition-colors">
                        Solve with AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab !== "Overview" && activeTab !== "Materials" && activeTab !== "Past Exams" && (
              <div className="h-44 flex flex-col items-center justify-center text-center animate-pulse-glow-slow">
                <Sparkles className="w-8 h-8 text-brand-primary mb-3 animate-pulse" />
                <h4 className="text-xs font-bold text-brand-text">Active Simulation Sync</h4>
                <p className="text-[10px] text-brand-text-muted mt-1 max-w-xs">
                  This panel displays real-time custom summaries, flashcards, or AI chats grounded in the loaded {activeTab} workspace files.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
