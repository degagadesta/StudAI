import { NavLink, useNavigate } from "react-router-dom";
import {
  Rocket,
  LayoutDashboard,
  BookOpen,
  Calendar,
  LogOut,
  User,
} from "lucide-react";
import { logout } from "../../api/authApi";

const NAV_ITEMS = [
  { to: "/app/start-studying", label: "Start Studying", icon: Rocket },
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/courses", label: "Courses", icon: BookOpen },
  { to: "/app/schedule", label: "Schedule", icon: Calendar },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-20 shrink-0 flex flex-col items-center justify-between py-6 h-screen sticky top-0">
      <div className="flex flex-col items-center gap-6">
        <div className="w-9 h-9 rounded-lg bg-[#2F4A3D] flex items-center justify-center text-[#C7D3B9] font-serif text-sm">
          S
        </div>

        <nav className="flex flex-col gap-2 bg-[#FFFDF7] border border-[#DCD2B4] rounded-3xl p-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              title={label}
              className={({ isActive }) =>
                `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-[#253D31] text-[#F6F1E3]"
                    : "text-[#A9A18A] hover:text-[#5B6156] hover:bg-[#EFE8D4]"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2">
        <NavLink
          to="/app/profile"
          aria-label="Profile"
          title="Profile"
          className={({ isActive }) =>
            `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
              isActive
                ? "bg-[#253D31] text-[#F6F1E3]"
                : "text-[#A9A18A] hover:text-[#5B6156] hover:bg-[#EFE8D4]"
            }`
          }
        >
          <User size={19} strokeWidth={1.9} />
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#A9A18A] hover:text-[#8B3A3A] hover:bg-[#F7E8E8] transition-colors"
        >
          <LogOut size={19} strokeWidth={1.9} />
        </button>
      </div>
    </aside>
  );
}
