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
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[296px_minmax(0,1fr)] xl:grid-cols-[316px_minmax(0,1fr)]">
        <aside className="border-b border-[rgba(83,88,100,0.28)] bg-[linear-gradient(180deg,rgba(9,13,23,0.98),rgba(9,14,24,0.96))] px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="rounded-[1.45rem] border border-[rgba(83,88,100,0.34)] bg-[linear-gradient(180deg,rgba(19,25,39,0.88),rgba(11,16,27,0.96))] p-5 shadow-[0_22px_48px_-38px_rgba(0,0,0,0.8)]">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f1cb85]">Workspace</p>
            <h1 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{subtitle}</p> : null}
            <div className="mt-6 rounded-[1.05rem] border border-[rgba(83,88,100,0.32)] bg-white/[0.025] px-4 py-3">
              <p className="text-sm font-medium text-[var(--ph-text)]">{identityPrimary}</p>
              {identitySecondary ? <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{identitySecondary}</p> : null}
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] text-[#f4d298] shadow-[0_16px_32px_-26px_rgba(240,163,35,0.24)]'
                      : 'border-transparent text-[var(--ph-text-soft)] hover:border-[rgba(83,88,100,0.26)] hover:bg-white/[0.025] hover:text-[var(--ph-text)]'
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
            className="mt-6 w-full rounded-full border border-[rgba(83,88,100,0.36)] bg-white/[0.025] px-4 py-3 text-sm text-[var(--ph-text-soft)] shadow-[0_12px_28px_-24px_rgba(0,0,0,0.68)] hover:border-[rgba(240,163,35,0.18)] hover:text-[var(--ph-text)]"
          >
            Logout
          </motion.button>
        </aside>

        <main className="relative min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
            <div className="mx-auto w-full max-w-[1480px] py-6 sm:py-8 lg:py-10">
              {headerActions ? (
                <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(83,88,100,0.24)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Workspace snapshot</p>
                    <p className="mt-1 text-base font-medium text-[var(--ph-text)]">{title}</p>
                    <p className="mt-1 max-w-2xl text-sm text-[var(--ph-text-muted)]">
                      {subtitle ?? identityPrimary}
                    </p>
                  </div>
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

