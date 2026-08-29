import DashboardImg from "../assets/dashboard.png";

export default function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 md:px-0 z-10">
      {/* Background glow behind dashboard */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[90%] h-[80%] bg-brand-primary/10 rounded-full blur-[100px] 
        pointer-events-none -z-10 animate-pulse-glow-slow"
      />

      {/* Browser mockup wrapper */}
      <div className="relative rounded-2xl border border-white/10 bg-brand-bg-darker/60 p-2 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-500 hover:border-brand-primary/20 group">
        {/* Browser header controls */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <div className="ml-4 flex items-center bg-white/5 rounded px-3 py-1 text-[11px] text-brand-text-muted/80 w-60 border border-white/5">
            <span className="truncate">studai.app/workspace/operating-systems</span>
          </div>
        </div>
        
        {/* Image wrapper */}
        <div className="overflow-hidden rounded-xl border border-white/5">
          <img
            src={DashboardImg}
            alt="StudAI workspace dashboard"
            className="block w-full h-auto object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
          />
        </div>
      </div>
    </div>
  );
}
