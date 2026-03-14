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
}

export function DashboardLayout({
  title,
  subtitle,
  identityPrimary,
  identitySecondary,
  navItems,
  onLogout,
  showTopNavbar = true,
}: DashboardLayoutProps) {
  const motionEnabled = useMotionEnabled()

  return (
    <div className="min-h-screen bg-[var(--ph-bg-deep)] text-[var(--ph-text)]">
      {showTopNavbar ? <Navbar /> : null}
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-[rgba(83,88,100,0.34)] bg-[linear-gradient(180deg,rgba(10,14,24,0.98),rgba(10,15,27,0.96))] p-5 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r lg:border-[rgba(83,88,100,0.34)] lg:p-6">
          <div className="ph-surface-card-strong p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f1cb85]">Workspace</p>
            <h1 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{subtitle}</p> : null}
            <div className="mt-5 rounded-[1.2rem] border border-[rgba(83,88,100,0.4)] bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-[var(--ph-text)]">{identityPrimary}</p>
              {identitySecondary ? <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{identitySecondary}</p> : null}
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.08)] text-[#f4d298] shadow-[0_20px_40px_-30px_rgba(240,163,35,0.32)]'
                      : 'border-transparent text-[var(--ph-text-soft)] hover:border-[rgba(83,88,100,0.34)] hover:bg-white/[0.03] hover:text-[var(--ph-text)]'
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
            className="mt-8 w-full rounded-full border border-[rgba(83,88,100,0.48)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--ph-text-soft)] shadow-[0_12px_28px_-24px_rgba(0,0,0,0.72)] hover:border-[rgba(240,163,35,0.22)] hover:text-[var(--ph-text)]"
          >
            Logout
          </motion.button>
        </aside>

        <main className="saas-grid-bg ph-hex-bg relative min-w-0 overflow-hidden">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
            <div className="mx-auto w-full max-w-[1400px] py-6 lg:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

