import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

type DashboardNavItem = {
  to: string
  label: string
  icon?: ReactNode
  badge?: { count: number; color?: 'red' | 'yellow'; tooltip?: string }
}

type DashboardLayoutProps = {
  title: string
  subtitle?: string
  identityPrimary: string
  identitySecondary?: string
  navItems: DashboardNavItem[]
  onLogout: () => void
  showTopNavbar?: boolean
  headerActions?: ReactNode
}

export function DashboardLayout({
  identityPrimary,
  identitySecondary,
  navItems,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="border-b border-[#272839] bg-[#101114] p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-[#272839] lg:p-5">
          {/* Logo */}
          <div className="flex items-center px-2">
            <img src="/prophives-logo.png" alt="Prophives" className="h-9 w-auto object-contain" />
          </div>

          {/* User Info */}
          <div className="mt-5 rounded-xl bg-[#141519] border border-[#272839] p-3.5">
            <p className="text-sm font-semibold text-white">{identityPrimary}</p>
            {identitySecondary ? <p className="mt-0.5 text-xs text-[#8D8D96]">{identitySecondary}</p> : null}
          </div>

          {/* Navigation */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split('/').length <= 3}
                className={({ isActive }) =>
                  `group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'border-l-3 border-[#2251E3] bg-[rgba(34,81,227,0.1)] text-white font-semibold'
                      : 'text-[#8D8D96] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon ? <span className="text-current opacity-70 flex-shrink-0">{item.icon}</span> : null}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge.count > 0 ? (
                      <span className="text-[9px] text-[#F25461] font-semibold leading-none truncate">
                        {item.badge.tooltip}
                      </span>
                    ) : null}
                  </div>
                </div>
                {item.badge && item.badge.count > 0 ? (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0 ${
                      item.badge.color === 'yellow' ? 'bg-[#EBCF42]' : 'bg-[#F25461]'
                    }`}
                  >
                    {item.badge.count > 9 ? '9+' : item.badge.count}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="mt-8 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#8D8D96] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 overflow-hidden">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1200px] py-6 lg:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
