
export default function Footer() {
  const columns = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "AI Tutor", href: "#features" },
        { name: "Exam Intelligence", href: "#exam-intelligence" },
        { name: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "How It Works", href: "#how-it-works" },
        { name: "Previous Exams", href: "#how-it-works" },
        { name: "Study Tools", href: "#features" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
        { name: "Privacy", href: "#privacy" },
        { name: "Terms", href: "#terms" },
      ],
    },
  ];

  return (
    <footer className="bg-brand-bg-darker border-t border-brand-border/20 py-16 text-left relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-brand-border/10">
          
          {/* Logo and Tagline */}
          <div className="md:col-span-5 flex flex-col gap-4 max-w-sm">
            <a href="#" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-brand-border bg-brand-card flex items-center justify-center text-brand-primary">
                <svg
                  className="w-4.5 h-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-brand-text">
                StudAI
              </span>
            </a>
            <p className="text-xs text-brand-text-muted leading-relaxed">
              AI-powered academic companion for Ethiopian university students. Syncing lecture materials and historical exams into one workspace.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  {col.title}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.href}
                      className="text-xs text-brand-text-muted hover:text-brand-text transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[11px] text-brand-text-muted">
          <span>© 2026 StudAI. Built for the future of learning.</span>
          <div className="flex gap-4">
            <span className="hover:text-brand-text cursor-pointer">Built starting with AASTU</span>
            <span>•</span>
            <span className="hover:text-brand-text cursor-pointer">Ethiopian EdTech Initiative</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
