import { NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  CheckSquare,
  Home,
  LogOut,
  MessageCircle,
  MessageSquare,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

export default function PatientLayout() {
  const { user, signOut } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "Patient";

  const navItems = [
    { to: "/patient/home", icon: Home, label: "Today" },
    { to: "/patient/messages", icon: MessageSquare, label: "Messages" },
    { to: "/patient/tasks", icon: CheckSquare, label: "Care Tasks" },
    { to: "/patient/medications", icon: Pill, label: "Medications" },
    { to: "/patient/appointments", icon: Calendar, label: "Visits" },
  ];

  return (
    <div className="patient-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col px-6 pb-6 pt-6 gap-6">
          {/* App Logo */}
          <div className="px-2 flex items-center gap-2 font-extrabold text-xl tracking-tight text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md shadow-blue-500/30">
              <ShieldCheck size={18} />
            </span>
            CareFlow <span className="text-blue-600">AI</span>
          </div>

          {/* User Profile Widget */}
          <div className="patient-surface flex items-center gap-3 rounded-2xl p-4 shadow-sm border border-blue-100/50">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100/80 text-blue-700 font-bold text-lg">
              {user?.fullName?.charAt(0) || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-gray-900">
                {user?.fullName || "Patient User"}
              </h2>
              <p className="truncate text-xs font-semibold text-blue-600">
                Active care plan
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-[var(--color-primary-700)] shadow-sm border border-gray-100"
                      : "text-gray-500 hover:bg-white/80 hover:text-gray-900"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-3">
            <div className="patient-surface rounded-2xl p-4 text-xs font-medium text-gray-500 leading-relaxed">
              <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                <ShieldCheck size={16} className="text-emerald-500" />
                Trusted Care Team
              </div>
              Message your care team any time for guidance, refills, or follow-ups.
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full justify-start text-[var(--color-primary-700)] border-blue-100 bg-white"
                as="a"
                href="/patient/messages"
              >
                <MessageCircle size={16} />
                Send a message
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header - Mobile & Tablet Only */}
          <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:hidden">
            <div className="patient-surface flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-base font-semibold text-white">
                  {user?.fullName?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    CareFlow AI
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    Welcome, {firstName}
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href="/patient/appointments"
                >
                  Schedule visit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={signOut}
                >
                  <LogOut size={16} />
                </Button>
              </div>
              <button onClick={signOut} className="sm:hidden text-gray-500 hover:text-gray-900">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="patient-surface fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 lg:hidden">
        <div className="mx-auto flex max-w-[520px] items-center justify-between px-4 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "text-[var(--color-primary-700)]"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
