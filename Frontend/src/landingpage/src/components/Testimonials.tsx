import { Quote } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Bethel Solomon",
      university: "AASTU · Software Engineering",
      quote: "I finally stopped searching through Telegram channels for old exams. Everything I need is indexed in one place. Saving 10+ hours of exam prep time every semester.",
    },
    {
      name: "Yared Kebede",
      university: "Addis Ababa University · Electrical",
      quote: "The Exam Intelligence feature pointed out that Deadlock appeared in the last 4 finals. It was exactly right, and I scored an A in Operating Systems.",
    },
    {
      name: "Kalkidan Tesfaye",
      university: "AASTU · Civil Engineering",
      quote: "Studying from 100-page lecture PDFs used to be overwhelming. The Smart Summaries extract core concepts in minutes, making study sessions highly focused.",
    },
    {
      name: "Henok Alemu",
      university: "AASTU · Computer Science",
      quote: "I ask the AI Tutor questions late at night when I'm stuck, and the answers are grounded in our exact course slides. It feels like having a personal teaching assistant.",
    },
    {
      name: "Selam Gidey",
      university: "ASTU · Mechanical Engineering",
      quote: "The personalized daily plan keeps me on track. I just click Start Today's Plan and focus on my weakest topics. My GPA went from 3.2 to 3.75.",
    },
    {
      name: "Abel Girma",
      university: "AASTU · Software Engineering",
      quote: "StudAI is the best companion for exam prep. It understands our department's exact grading system, question counts, and historical exam styles.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-brand-bg-darker overflow-hidden border-b border-brand-border/20">
      {/* Background glow */}
      <div className="glow-bg glow-green absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-10 pointer-events-none -z-10 animate-pulse-glow"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-4">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/25">
            Students
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Built for students who <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">want to study smarter.</span>
          </h2>
        </div>

        {/* Testimonials Masonry/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border border-brand-border/20 text-left flex flex-col justify-between min-h-[200px] group transition-all duration-300"
            >
              <div>
                {/* Quote Icon */}
                <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary/40 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all duration-300 mb-4">
                  <Quote className="w-4.5 h-4.5" />
                </div>
                
                {/* Quote Copy */}
                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed italic mb-6">
                  "{rev.quote}"
                </p>
              </div>

              {/* Student Profile Info */}
              <div className="flex items-center gap-3 border-t border-brand-border/10 pt-4">
                <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center text-brand-primary font-bold text-xs">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">{rev.name}</h4>
                  <span className="text-[10px] text-brand-primary font-semibold">{rev.university}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
