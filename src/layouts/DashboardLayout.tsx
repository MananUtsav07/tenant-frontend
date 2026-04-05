import { LogOut, Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change
  const handleNavClick = () => setSidebarOpen(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-2">
        <img src="/prophives-logo.png" alt="Prophives" className="h-9 w-auto object-contain" />
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#8D8D96] hover:text-white hover:bg-white/8 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
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
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'border-l-3 border-[#2251E3] bg-[rgba(34,81,227,0.1)] text-white font-semibold'
                  : 'text-[#8D8D96] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.icon ? <span className="text-current opacity-70 shrink-0">{item.icon}</span> : null}
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
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 ${
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
        onClick={() => { handleNavClick(); onLogout() }}
        className="mt-8 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#8D8D96] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </>
  )

  // Re-render sidebar content when location changes to keep active states fresh
  void location

  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#101114] border-b border-[#272839]">
        <img src="/prophives-logo.png" alt="Prophives" className="h-8 w-auto object-contain" />
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-[#8D8D96] hover:text-white hover:bg-white/8 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar — hidden on mobile unless open */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-65 bg-[#101114] border-r border-[#272839] p-5
            transform transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 lg:min-h-screen lg:block
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <SidebarContent />
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
