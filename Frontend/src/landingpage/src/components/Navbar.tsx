import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Exam Intelligence", href: "#exam-intelligence" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-bg/85 border-b border-brand-border/50 backdrop-blur-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border bg-brand-card">
            <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg
              className="relative w-5 h-5 text-brand-primary"
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
          <span className="font-display font-bold text-xl tracking-tight text-brand-text group-hover:text-brand-primary transition-colors duration-300">
            StudAI
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-semibold text-brand-text-muted hover:text-brand-text transition-colors duration-200"
          >
            Log In
          </a>
          <a
            href="/login"
            className="flex items-center gap-1.5 bg-brand-primary text-brand-bg hover:bg-brand-primary-hover font-semibold text-sm px-4.5 py-2 rounded-full transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(152,201,135,0.4)]"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-brand-text hover:text-brand-primary transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-card mx-4 mt-2 p-6 rounded-2xl flex flex-col gap-5 border border-brand-border bg-brand-bg/95 z-55">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-brand-text-muted hover:text-brand-text transition-colors duration-200 py-1"
              >
                {link.name}
              </a>
            ))}
          </div>
          <hr className="border-brand-border/40" />
          <div className="flex flex-col gap-3">
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center font-semibold text-brand-text-muted hover:text-brand-text py-2 transition-colors duration-200"
            >
              Log In
            </a>
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-brand-primary text-brand-bg font-semibold py-2.5 rounded-full hover:bg-brand-primary-hover transition-colors duration-300"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
