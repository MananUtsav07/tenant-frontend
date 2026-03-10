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
    <div className="min-h-screen text-slate-900">
      {showTopNavbar ? <Navbar /> : null}
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[278px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-50/75 p-5 backdrop-blur">
          <h1 className="font-[Space_Grotesk] text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-blue-700">{subtitle}</p> : null}
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{identityPrimary}</p>
            {identitySecondary ? <p className="mt-1 text-xs text-slate-500">{identitySecondary}</p> : null}
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_20px_40px_-30px_rgba(37,99,235,0.9)]'
                      : 'text-slate-700 hover:bg-slate-200/80'
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
            className="mt-8 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:border-blue-300"
          >
            Logout
          </motion.button>
        </aside>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

