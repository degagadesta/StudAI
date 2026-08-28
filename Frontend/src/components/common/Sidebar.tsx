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
  { to: "/app/analytics", label: "Analytics", icon: LayoutDashboard },
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
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-accent-light font-serif text-sm">
          S
        </div>

        <nav className="flex flex-col gap-2 bg-surface border border-default rounded-3xl p-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              title={label}
              className={({ isActive }) =>
                `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-accent text-inverse"
                    : "text-muted hover:text-secondary hover:bg-elevated"
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
                ? "bg-accent text-inverse"
                : "text-muted hover:text-secondary hover:bg-elevated"
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
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-muted hover:text-error hover:bg-error transition-colors"
        >
          <LogOut size={19} strokeWidth={1.9} />
        </button>
      </div>
    </aside>
  );
}
