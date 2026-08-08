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
    <aside className="w-56 border-r border-[#DCD2B4]/60 bg-[#F9F6EE] p-6 flex flex-col justify-between shrink-0">
      <div>
        <h2 className="font-serif text-xl text-[#253D31] mb-6">Settings</h2>
        <nav className="space-y-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-[#253D31] text-[#F6F1E3]"
                  : "text-[#5B6156] hover:bg-[#EFE8D4] hover:text-[#253D31]"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <p className="text-xs text-[#A9A18A]">StudAI Preferences v1.0</p>
    </aside>
  );
}
