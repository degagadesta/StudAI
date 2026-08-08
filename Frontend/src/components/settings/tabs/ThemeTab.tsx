import { Sun, Moon, Monitor, Check } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const MODES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light Mode", icon: Sun },
  { id: "dark", label: "Dark Mode", icon: Moon },
  { id: "system", label: "System Default", icon: Monitor },
];

const ACCENTS: { id: string; className: string }[] = [
  { id: "forest", className: "bg-[#253D31]" },
  { id: "teal", className: "bg-[#1E5652]" },
  { id: "sage", className: "bg-[#8CA37E]" },
];

interface ThemeTabProps {
  selectedTheme: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  accentColor: string;
  onChangeAccent: (color: string) => void;
}

export default function ThemeTab({
  selectedTheme,
  onChangeTheme,
  accentColor,
  onChangeAccent,
}: ThemeTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl text-[#253D31]">App Theme</h3>
        <p className="text-xs text-[#5B6156] mt-0.5">
          Customize your visual workspace interface appearance.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#253D31]">
          Interface Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map(({ id, label, icon: Icon }) => {
            const active = selectedTheme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTheme(id)}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? id === "dark"
                      ? "border-[#253D31] bg-[#253D31] text-[#F6F1E3]"
                      : "border-[#253D31] bg-[#EFE8D4] text-[#253D31]"
                    : "border-[#DCD2B4] bg-[#FFFDF7] text-[#5B6156] hover:bg-[#F9F6EE]"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active && id === "dark"
                      ? "text-[#C7D3B9]"
                      : "text-[#2F4A3D]"
                  }
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label className="block text-xs font-medium text-[#253D31]">
          Accent Color
        </label>
        <div className="flex items-center gap-3">
          {ACCENTS.map(({ id, className }) => {
            const active = accentColor === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeAccent(id)}
                className={`w-9 h-9 rounded-full ${className} flex items-center justify-center transition-transform cursor-pointer ${
                  active ? "ring-2 ring-offset-2 scale-105" : ""
                }`}
                style={active ? { boxShadow: "none" } : undefined}
              >
                {active && (
                  <Check
                    size={16}
                    className={
                      id === "sage" ? "text-[#FFFDF7]" : "text-[#F6F1E3]"
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
