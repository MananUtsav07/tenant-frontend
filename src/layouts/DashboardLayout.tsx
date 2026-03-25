import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

type DashboardNavItem = {
  to: string
  label: string
  icon?: ReactNode
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
  title,
  subtitle,
  identityPrimary,
  identitySecondary,
  navItems,
  onLogout,
  showTopNavbar = true,
  headerActions,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FEFAEF] text-[#1A1A1A]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="border-b border-[rgba(0,0,0,0.06)] bg-white p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-[rgba(0,0,0,0.06)] lg:p-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FED609]">
              <span className="ph-title text-sm font-bold text-[#1A1A1A]">P</span>
            </span>
            <span className="ph-title text-base font-bold text-[#1A1A1A]">Prophives</span>
          </div>

          {/* User Info */}
          <div className="mt-5 rounded-xl bg-[#FEFAEF] p-3.5">
            <p className="text-sm font-semibold text-[#1A1A1A]">{identityPrimary}</p>
            {identitySecondary ? <p className="mt-0.5 text-xs text-[#6B7280]">{identitySecondary}</p> : null}
          </div>

          {/* Navigation */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split('/').length <= 3}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'border-l-3 border-[#FED609] bg-[rgba(254,214,9,0.1)] text-[#1A1A1A] font-semibold'
                      : 'text-[#6B7280] hover:bg-[rgba(0,0,0,0.02)] hover:text-[#1A1A1A]'
                  }`
                }
              >
                {item.icon ? <span className="text-current opacity-70">{item.icon}</span> : null}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="mt-8 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition hover:bg-[rgba(0,0,0,0.02)] hover:text-[#1A1A1A]"
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
