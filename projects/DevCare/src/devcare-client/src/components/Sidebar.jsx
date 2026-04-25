import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/Devcare-logo.png'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  MessageSquareMore, 
  UserPlus, 
  LogOut,
  ChevronRight
} from 'lucide-react'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const ROLE_KEY = 'devcare_role'

function Sidebar() {
  const navigate = useNavigate()
  const role = localStorage.getItem(ROLE_KEY)
  const username = localStorage.getItem('devcare_username')

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem('devcare_refresh_token')
    localStorage.removeItem('devcare_username')
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  const doctorLinks = [
    { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
    { label: 'Assign Therapy', href: '/doctor/assign', icon: ClipboardList },
    { label: 'Feedback', href: '/doctor/feedback', icon: MessageSquareMore },
    { label: 'Connect', href: '/doctor/share', icon: UserPlus },
  ]

  const patientLinks = [
    { label: 'My Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
  ]

  const navLinks = role === 'doctor' ? doctorLinks : patientLinks

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[var(--color-border)] bg-white p-6 flex flex-col z-50">
      <div className="mb-12 px-2 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="DevCare Logo" className="h-9 w-auto" />
        </Link>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto">
        <section>
          <nav className="space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[var(--color-secondary)]'
                  }`
                }
              >
                {({ isActive: linkIsActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <link.icon size={18} strokeWidth={linkIsActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                      <span>{link.label}</span>
                    </div>
                    {linkIsActive && <ChevronRight size={14} className="opacity-50" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </section>
        
      </div>

      <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-2 mb-6 group cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-[var(--color-primary-soft)] flex items-center justify-center font-bold text-[var(--color-primary)] shadow-sm group-hover:scale-105 transition-transform">
            {username ? username[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-[var(--color-secondary)] truncate">{username || 'User'}</p>
            <p className="text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider">{role}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:gap-4"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
