import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { Navbar } from '../components/public/Navbar'

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
    <div className="ph-prophives-bg min-h-screen text-[var(--ph-text)]">
      {showTopNavbar ? <Navbar /> : null}
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[rgba(83,88,100,0.14)] bg-[rgba(9,13,21,0.98)] px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
          <div className="mb-7">
            <h1 className="font-heading text-base font-semibold text-[var(--ph-text)]">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{subtitle}</p> : null}
            <div className="mt-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[rgba(240,163,35,0.1)] text-[10px] font-bold uppercase text-[var(--ph-accent)]">
                {identityPrimary.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--ph-text)]">{identityPrimary}</p>
                {identitySecondary ? <p className="truncate text-xs text-[var(--ph-text-muted)]">{identitySecondary}</p> : null}
              </div>
            </div>
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.06] text-[var(--ph-text)]'
                      : 'text-[var(--ph-text-muted)] hover:bg-white/[0.04] hover:text-[var(--ph-text-soft)]'
                  }`
                }
              >
                {item.icon ? <span className="text-current opacity-70">{item.icon}</span> : null}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="mt-6 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ph-text-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--ph-text-soft)]"
          >
            Logout
          </button>
        </aside>

        <main className="relative min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="mx-auto w-full max-w-[1400px] py-6 sm:py-8 lg:py-10">
              {headerActions ? (
                <div className="mb-6 flex flex-col gap-3 border-b border-[rgba(83,88,100,0.18)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0" />
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">{headerActions}</div>
                </div>
              ) : null}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
