import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, Clock, Users, LogOut, MessageSquare, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PhysicianLayout() {
  const { user, signOut } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'Physician';

  const navItems = [
    { to: '/physician/home',         icon: Home,          label: 'Dashboard' },
    { to: '/physician/messages',     icon: MessageSquare, label: 'AI Assistant' },
    { to: '/physician/availability', icon: Clock,         label: 'Availability' },
    { to: '/physician/appointments', icon: Calendar,      label: 'Appointments' },
    { to: '/physician/patients',     icon: Users,         label: 'Patients' },
  ];

  return (
    <div className="physician-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">

        <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-6 px-5 py-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-2 font-extrabold text-xl tracking-tight text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
              <Stethoscope size={16} />
            </span>
            CareFlow <span className="text-emerald-600">MD</span>
          </div>

          <div className="patient-surface flex items-center gap-3 rounded-2xl p-4 border-emerald-100/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg">
              {firstName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-gray-900">{user?.fullName ?? 'Physician'}</h2>
              <p className="truncate text-xs font-semibold text-emerald-600">Clinical Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:bg-white/80 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-4">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:hidden">
            <div className="patient-surface flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                  Dr
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Clinical Portal</p>
                  <p className="text-sm font-bold text-gray-900">{user?.fullName ?? 'Physician'}</p>
                </div>
              </div>
              <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
            <nav className="mt-2 flex gap-1 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`
                  }
                >
                  <item.icon size={14} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
