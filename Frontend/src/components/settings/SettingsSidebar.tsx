import { User, CreditCard, BookOpen, Palette } from "lucide-react";

export type TabType = "profile" | "plan" | "course" | "theme";

const NAV_ITEMS: { id: TabType; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "plan", label: "Plan", icon: CreditCard },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "theme", label: "App Theme", icon: Palette },
];

interface SettingsSidebarProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function SettingsSidebar({
  activeTab,
  onChange,
}: SettingsSidebarProps) {
  return (
    <aside className="w-56 border-r border-default/60 bg-surface-hover p-6 flex flex-col justify-between shrink-0">
      <div>
        <h2 className="font-serif text-xl text-primary mb-6">Settings</h2>
        <nav className="space-y-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === id
                  ? "bg-accent text-inverse shadow-sm"
                  : "text-secondary hover:bg-elevated hover:text-primary"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <p className="text-xs text-muted">StudAI Preferences v1.0</p>
    </aside>
  );
}
