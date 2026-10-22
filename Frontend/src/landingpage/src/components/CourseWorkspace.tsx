import { useState } from "react";
import {
  Layers,
  BookOpen,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Flame,
} from "lucide-react";
import DashboardImg from "../assets/dashboard.png";
import summary from "../assets/summary.png";
import pastExam from "../assets/pastExam.png";
import quiz from "../assets/quiz.png";
import flashCard from "../assets/flashcard.png";
import aiChat from "../assets/aichat.png";

export default function CourseWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = [
    {
      name: "Overview",
      icon: BookOpen,
      image: DashboardImg,
      desc: "Get a bird's eye view of your course. Your PDF handouts, smart study notes, and the AI Tutor chat run in parallel to keep you in sync.",
      badge: "Full Workspace",
    },
    {
      name: "Smart Summaries",
      icon: Layers,
      image: summary,
      desc: "Condense massive lecture slide decks and PDFs into structured summaries, outlining key definitions and formulas in seconds.",
      badge: "Document Summaries",
    },
    {
      name: "Past Exams",
      icon: GraduationCap,
      image: pastExam,
      desc: "View and solve archives of past university exam sheets. Receive granular, step-by-step guidance on complex calculations.",
      badge: "Exam Archives",
    },
    {
      name: "AI Quiz",
      icon: Flame,
      image: quiz,
      desc: "Create dynamic practice tests from any chapter. Customize difficulty, format, and size to self-assess your preparation.",
      badge: "Active Testing",
    },
    {
      name: "Flashcards",
      icon: ShieldCheck,
      image: flashCard,
      desc: "Convert summaries into structured recall flashcards. Review randomized decks to build solid long-term memory.",
      badge: "Spaced Repetition",
    },
    {
      name: "AI Tutor",
      icon: MessageSquare,
      image: aiChat,
      desc: "Ask the StudAI Tutor specific questions about any page or highlighted paragraph. No generic templates, completely grounded in your slide context.",
      badge: "Academic AI Chat",
    },
  ];

  const currentTab = tabs.find((t) => t.name === activeTab) || tabs[0];

  return (
    <section className="relative py-24 md:py-32 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute bottom-1/3 left-10 w-[550px] h-[550px] opacity-15 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Interactive Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Explore the Workspace.
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Click on the tabs below to preview the actual interface, features, and tools available in your StudAI course system.
          </p>
        </div>

        {/* Tab Buttons bar */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-thin border-b border-white/5 scrollbar-thumb-brand-dark-green scrollbar-track-transparent">
          <div className="flex mx-auto min-w-max px-2 gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-brand-primary/10 border-brand-primary/40 text-brand-text shadow-lg shadow-brand-primary/5"
                      : "bg-brand-bg-darker/35 border-brand-border/10 text-brand-text-muted hover:border-brand-border/30 hover:text-brand-text"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? "text-brand-primary" : "text-brand-text-muted"}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Description Panel */}
        <div className="max-w-3xl mx-auto text-center mb-10 animate-fade-in">
          <span className="inline-block text-[10px] font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-2.5 py-0.5 rounded border border-brand-primary/15 mb-2">
            {currentTab.badge}
          </span>
          <p className="text-sm sm:text-base text-brand-text font-medium px-4 leading-relaxed">
            {currentTab.desc}
          </p>
        </div>

        {/* Major Mockup Shell */}
        <div className="relative rounded-2xl border border-white/10 bg-brand-bg-darker/60 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-500 hover:border-brand-primary/20 group max-w-5xl mx-auto">
          {/* Browser header controls */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <div className="ml-4 flex items-center bg-white/5 rounded px-3 py-1 text-[11px] text-brand-text-muted/80 w-60 border border-white/5">
              <span className="truncate">studai.app/workspace/intro-to-networks</span>
            </div>
          </div>

          {/* Actual Platform Screenshot */}
          <div className="overflow-hidden rounded-xl border border-white/5 bg-brand-bg-darker">
            <img
              src={currentTab.image}
              alt={`StudAI workspace - ${currentTab.name}`}
              className="block w-full h-auto max-h-[550px] object-cover object-top transition-all duration-500 group-hover:scale-[1.005]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
