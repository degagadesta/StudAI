import { useState, useEffect, useRef } from "react";
import { Sparkles, FileCheck2, User } from "lucide-react";

interface Message {
  sender: "student" | "studai";
  text: string;
  sources?: string[];
}

export default function AITutorSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "student",
      text: "Explain deadlock like I'm preparing for my exam.",
    },
    {
      sender: "studai",
      text: "Deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process. Think of it like a four-way traffic gridlock where no car can move forward because each is waiting for the next to clear.",
      sources: ["Operating Systems · Chapter 5", "Lecture 08 · Page 14"],
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { text: "Give me an example", reply: "Here's a classic example: Process A holds Printer 1 and requests Scanner 2. Process B holds Scanner 2 and requests Printer 1. Neither can proceed, resulting in a permanent halt.", sources: ["Operating Systems · Chapter 5", "Homework 3 · Problem 2"] },
    { text: "Create flashcards", reply: "Here are 3 flashcards generated for Deadlock:\n\n1. Front: What are the 4 conditions of deadlock?\nBack: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.\n\n2. Front: What is Banker's Algorithm used for?\nBack: Deadlock avoidance by analyzing state safety.", sources: ["Exam prep study set", "Lecture 09 · Page 3"] },
    { text: "Test me on this", reply: "Let's test you! Here is a question:\n\nIf one of the four deadlock conditions is prevented, can deadlock occur? (A) Yes (B) No.\n\nType your answer to check!", sources: ["Midterm Exam 2024 · Q14"] },
    { text: "Explain circular wait", reply: "Circular wait is the condition where process P0 waits for a resource held by P1, P1 waits for P2, and Pn waits for P0, forming a closed loop of dependency.", sources: ["Operating Systems · Chapter 5"] },
  ];

  const handleSuggestionClick = (sug: typeof suggestions[0]) => {
    if (isTyping) return;
    
    // Add student message
    setMessages((prev) => [...prev, { sender: "student", text: sug.text }]);
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "studai",
          text: sug.reply,
          sources: sug.sources,
        },
      ]);
    }, 1500);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

          {/* Right Side: Interactive Chat Mockup */}
          <div className="lg:col-span-7 flex flex-col h-[480px] bg-brand-bg/40 border border-brand-border/20 rounded-2xl p-5 shadow-2xl relative z-10 overflow-hidden backdrop-blur-md">
            
            {/* Header bar of Chat mockup */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/15 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7.5 h-7.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">StudAI Companion</h4>
                  <p className="text-[9px] text-brand-primary font-mono">Grounded: Operating Systems (4121)</p>
                </div>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-primary/40"></span>
                <span className="w-2 h-2 rounded-full bg-brand-primary/40"></span>
                <span className="w-2 h-2 rounded-full bg-brand-primary/40"></span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 max-w-[85%] ${
                    msg.sender === "student" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  {/* Bubble content */}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed text-left border ${
                      msg.sender === "student"
                        ? "bg-brand-secondary/15 border-brand-secondary/20 text-brand-text rounded-tr-none"
                        : "bg-brand-bg-darker/65 border-brand-border/30 text-brand-text rounded-tl-none"
                    }`}
                  >
                    {msg.sender === "student" ? (
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-brand-text-muted">
                        <User className="w-3 h-3" />
                        <span>Abel</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-brand-primary">
                        <Sparkles className="w-3 h-3" />
                        <span>StudAI Tutor</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Message Sources (Citations) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex gap-2.5 flex-wrap px-1">
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 text-[9px] text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10"
                        >
                          <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="self-start flex flex-col gap-1.5 max-w-[80%] items-start">
                  <div className="p-3.5 bg-brand-bg-darker/65 border border-brand-border/30 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Follow-ups */}
            <div className="flex flex-col gap-2 border-t border-brand-border/10 pt-3 text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-brand-text-muted">Suggested prompts:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    disabled={isTyping}
                    className="flex-shrink-0 text-[10px] font-semibold text-brand-text bg-brand-dark-green/30 border border-brand-border/25 hover:border-brand-primary/40 hover:bg-brand-primary/5 px-3 py-1.5 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sug.text}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
