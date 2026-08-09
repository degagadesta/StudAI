import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

type ThemeMode = "light" | "dark" | "system";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light Mode", icon: Sun },
  { id: "dark", label: "Dark Mode", icon: Moon },
  { id: "system", label: "System Default", icon: Monitor },
];

const ACCENTS: { id: string; className: string }[] = [
  { id: "forest", className: "bg-accent dark:bg-[#7ED957]" },
  { id: "teal", className: "bg-[#1E5652] dark:bg-[#5AC8BE]" },
  { id: "sage", className: "bg-accent-secondary dark:bg-[#F2A93B]" },
];

export default function ThemeTab() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl text-primary">App Theme</h3>
        <p className="text-xs text-secondary mt-0.5">
          Customize your visual workspace interface appearance.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-primary">
          Interface Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map(({ id, label, icon: Icon }) => {
            const active = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? "border-accent bg-accent text-inverse shadow-md"
                    : "border-default bg-surface text-secondary hover:bg-surface-hover hover:border-hover"
                }`}
              >
                <Icon size={20} className={active ? "text-inverse" : "text-primary"} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label className="block text-xs font-medium text-primary">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          {ACCENTS.map(({ id, className }) => {
            const active = accentColor === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setAccentColor(id)}
                className={`w-9 h-9 rounded-full ${className} flex items-center justify-center transition-all cursor-pointer ${
                  active ? "ring-2 ring-accent ring-offset-2 ring-offset-page scale-105" : "hover:scale-105"
                }`}
              >
                {active && (
                  <Check size={16} className="text-inverse dark:text-[#0D0F0D]" />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-2">
          Note: Accent color customization coming soon. Current selection: {accentColor}
        </p>
      </div>
    </div>
  );
}
