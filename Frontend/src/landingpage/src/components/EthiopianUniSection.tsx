import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function EthiopianUniSection() {
  const [activeNode, setActiveNode] = useState(0);

  const listNodes = [
    { label: "University", value: "AASTU", details: "Directly synchronized with Addis Ababa Science & Technology University schedules and calendars." },
    { label: "Department", value: "Software Engineering", details: "Tailored for the Department of Software Engineering, School of EECS." },
    { label: "Curriculum", value: "Course Catalog 2026", details: "Structured around course guides, lecture hours, and academic weights." },
    { label: "Academic Year", value: "Year 4", details: "Focuses on senior year specialized modules." },
    { label: "Semester", value: "Semester I", details: "Filters out unrelated semester requirements." },
    { label: "Course", value: "Operating Systems", details: "Contains full chapter files, homework sets, and lecture records." },
    { label: "Study Workspace", value: "StudAI Workspace", details: "Your personalized exam trainer grounded in the previous 6 layers." },
  ];

  return (
    <section id="about" className="relative py-24 md:py-32 bg-brand-bg overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/2 left-1/4 w-[600px] h-[600px] opacity-10 pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Copy & University status list */}
          <div className="lg:col-span-5 text-left flex flex-col gap-5">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25 self-start">
              Built for Ethiopian Students
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text leading-tight">
              Built around <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">your university.</span>
            </h2>
            
            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              StudAI doesn't treat every student the same. Your university, department, curriculum, semester, and courses shape your entire study experience.
            </p>

            {/* University checklist */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3 p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-bg flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Active Support: AASTU</h4>
                  <p className="text-[10px] text-brand-text-muted">Full curriculum, slides, and exam integration.</p>
                </div>
              </div>
              
              {[
                { name: "Addis Ababa University (AAU)", time: "Coming soon" },
                { name: "Adama Science & Tech (ASTU)", time: "Coming soon" },
              ].map((uni, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-brand-border/15 rounded-xl bg-brand-bg-darker/10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-brand-border/30 text-brand-text-muted flex items-center justify-center font-bold text-xs shrink-0">
                      •
                    </div>
                    <span className="text-xs font-bold text-brand-text-muted">{uni.name}</span>
                  </div>
                  <span className="text-[9px] font-semibold text-brand-text-muted/60 bg-brand-border/10 px-2 py-0.5 rounded border border-brand-border/20">{uni.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Hierarchy Flow + Minimal Ethiopia Map Graphic */}
          <div className="lg:col-span-7 bg-brand-bg-darker/40 border border-brand-border/20 rounded-2xl p-6 md:p-8 min-h-[480px] relative flex flex-col justify-between overflow-hidden">
            
            {/* Minimal SVG Graphic representation of Ethiopia map outline in background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center">
              <svg className="w-[85%] h-[85%] text-brand-primary/10" viewBox="0 0 500 400" fill="none" stroke="currentColor" strokeWidth="1.2">
                {/* Abstract shape representing general map outline of Ethiopia */}
                <path d="M120 80 L180 50 L260 40 L340 70 L420 120 L450 200 L440 280 L380 340 L300 370 L220 380 L150 350 L80 310 L50 250 L60 180 L80 130 Z" />
                {/* Glowing Addis pin coordinates */}
                <circle cx="210" cy="200" r="4" fill="currentColor" className="animate-ping" />
                <circle cx="210" cy="200" r="2.5" fill="var(--color-brand-primary)" />
                <text x="220" y="204" fill="var(--color-brand-text)" fontSize="8" fontWeight="bold">AASTU Sync</text>
              </svg>
            </div>

            {/* Title Bar */}
            <div className="z-10 flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Curriculum Mapping Hierarchy</span>
              <span className="text-[9px] text-brand-primary font-mono">Sync State: Connected</span>
            </div>

            {/* Vertical Flow Diagram Nodes */}
            <div className="z-10 flex flex-col gap-2 relative">
              
              {/* Vertical connector line */}
              <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-brand-primary/40 to-brand-secondary/10 pointer-events-none"></div>

              {listNodes.map((node, idx) => {
                const isActive = activeNode === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveNode(idx)}
                    className="flex gap-4 items-center cursor-pointer group"
                  >
                    {/* Node Dot */}
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                      isActive 
                        ? "bg-brand-primary text-brand-bg border-brand-primary shadow-lg shadow-brand-primary/20 scale-105" 
                        : "bg-brand-bg border-brand-border/40 text-brand-text-muted group-hover:border-brand-primary/50 group-hover:text-brand-text"
                    }`}>
                      <span className="font-mono font-bold text-xs">0{idx + 1}</span>
                    </div>

                    {/* Node Details inside row */}
                    <div className="flex-1 text-left flex justify-between items-center bg-brand-bg-darker/35 border border-brand-border/10 hover:border-brand-border/30 rounded-xl px-4 py-2.5 transition-colors">
                      <div>
                        <span className={`text-[8px] uppercase font-bold block ${isActive ? "text-brand-primary" : "text-brand-text-muted/65"}`}>
                          {node.label}
                        </span>
                        <span className="text-xs font-bold text-brand-text leading-tight">{node.value}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? "text-brand-primary translate-x-1" : "text-brand-text-muted/30"}`} />
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Tooltip Description Panel of Active Node */}
            <div className="z-10 mt-6 bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-3.5 text-left text-xs animate-pulse-glow-slow">
              <span className="font-bold text-brand-primary block mb-1">
                {listNodes[activeNode].label} Layer Detail:
              </span>
              <p className="text-brand-text-muted text-[11px] leading-relaxed">
                {listNodes[activeNode].details}
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
