import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative w-11 h-11 rounded-full bg-surface border border-default flex items-center justify-center text-secondary hover:bg-elevated transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Sun Icon - visible in dark mode */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-0 -rotate-180"
        }`}
      >
        <Sun
          size={17}
          strokeWidth={1.9}
          className="text-accent group-hover:text-accent-hover transition-colors"
        />
      </div>

      {/* Moon Icon - visible in light mode */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark
            ? "opacity-0 scale-0 rotate-180"
            : "opacity-100 scale-100 rotate-0"
        }`}
      >
        <Moon
          size={17}
          strokeWidth={1.9}
          className="text-secondary group-hover:text-primary transition-colors"
        />
      </div>

      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-full bg-accent/10 scale-0 group-active:scale-100 transition-transform duration-200" />
    </button>
  );
}
