import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { Navbar } from '../components/public/Navbar'
import { useMotionEnabled } from '../utils/motion'

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
  const motionEnabled = useMotionEnabled()

  return (
    <div className="ph-prophives-bg min-h-screen text-[var(--ph-text)]">
      {showTopNavbar ? <Navbar /> : null}
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[rgba(83,88,100,0.2)] bg-[rgba(9,13,23,0.98)] px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
          <div className="rounded-xl border border-[rgba(83,88,100,0.24)] bg-white/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#f1cb85]">Workspace</p>
            <h1 className="ph-title mt-2 text-lg font-semibold text-[var(--ph-text)]">{title}</h1>
            {subtitle ? <p className="mt-1 text-xs leading-relaxed text-[var(--ph-text-muted)]">{subtitle}</p> : null}
            <div className="mt-4 rounded-lg border border-[rgba(83,88,100,0.2)] bg-white/[0.025] px-3 py-2.5">
              <p className="text-sm font-medium text-[var(--ph-text)]">{identityPrimary}</p>
              {identitySecondary ? <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{identitySecondary}</p> : null}
            </div>
          </div>

          <nav className="mt-4 space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-[rgba(240,163,35,0.14)] bg-[rgba(240,163,35,0.06)] text-[#f4d298]'
                      : 'border-transparent text-[var(--ph-text-soft)] hover:bg-white/[0.03] hover:text-[var(--ph-text)]'
                  }`
                }
              >
                {item.icon ? <span className="text-current">{item.icon}</span> : null}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <motion.button
            type="button"
            onClick={onLogout}
            whileHover={motionEnabled ? { y: -1 } : undefined}
            className="mt-4 w-full rounded-lg border border-[rgba(83,88,100,0.24)] bg-white/[0.025] px-3 py-2.5 text-sm text-[var(--ph-text-soft)] hover:border-[rgba(240,163,35,0.14)] hover:text-[var(--ph-text)]"
          >
            Logout
          </motion.button>
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
