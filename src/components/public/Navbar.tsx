import { AnimatePresence, motion } from 'framer-motion'
import { Building2, ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from '../common/Button'

const navItems = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.features, label: 'Features' },
  { to: ROUTES.howItWorks, label: 'How It Works' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.blog, label: 'Blog' },
  { to: ROUTES.docs, label: 'Docs' },
  { to: ROUTES.contact, label: 'Contact' },
]

type ActiveSession = {
  role: 'owner' | 'tenant' | 'admin'
  name: string
  dashboardTo: string | null
  dashboardLabel: string | null
  onLogout: () => void
}

function getAvatarInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'U'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const { admin, logout: logoutAdmin } = useAdminAuth()
  const { owner, logout: logoutOwner } = useOwnerAuth()
  const { tenant, logout: logoutTenant } = useTenantAuth()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  useEffect(() => {
    if (!profileMenuOpen) {
      return
    }

    const onOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [profileMenuOpen])

  const menuVariants = useMotionVariants({
    hidden: { opacity: 0, y: -14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  })

  const activeSession: ActiveSession | null = tenant
    ? {
        role: 'tenant',
        name: tenant.full_name || tenant.email || tenant.tenant_access_id,
        dashboardTo: ROUTES.tenantDashboard,
        dashboardLabel: 'Tenant Dashboard',
        onLogout: logoutTenant,
      }
    : owner
      ? {
          role: 'owner',
          name: owner.full_name || owner.company_name || owner.email,
          dashboardTo: ROUTES.ownerDashboard,
          dashboardLabel: 'Owner Dashboard',
          onLogout: logoutOwner,
        }
      : admin
        ? {
            role: 'admin',
            name: admin.full_name || admin.email,
            dashboardTo: null,
            dashboardLabel: null,
            onLogout: logoutAdmin,
          }
        : null

  const avatarInitials = getAvatarInitials(activeSession?.name ?? '')

  const handleLogout = () => {
    if (!activeSession) {
      return
    }

    activeSession.onLogout()
    setProfileMenuOpen(false)
    setOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/88 shadow-[0_12px_40px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.home} className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white shadow-[0_12px_35px_-20px_rgba(37,99,235,0.9)]">
            TF
          </span>
          <span className="font-[Space_Grotesk] text-lg font-semibold text-slate-900">TenantFlow</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="relative px-3 py-2 text-sm font-medium">
              {({ isActive }) => (
                <>
                  <span
                    className={
                      isActive
                        ? 'text-slate-950'
                        : 'text-slate-600 transition-colors hover:text-slate-900'
                    }
                  >
                    {item.label}
                  </span>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-blue-500"
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!activeSession ? (
            <>
              <Button to={ROUTES.ownerLogin} variant="ghost" size="sm" iconLeft={<Building2 className="h-4 w-4" />}>
                Owner Login
              </Button>
              <Button
                to={ROUTES.tenantLogin}
                variant="outline"
                size="sm"
                iconLeft={<UserRound className="h-4 w-4" />}
              >
                Tenant Login
              </Button>
            </>
          ) : null}
          {activeSession?.dashboardTo && activeSession?.dashboardLabel ? (
            <Button to={activeSession.dashboardTo} variant="secondary" size="sm">
              {activeSession.dashboardLabel}
            </Button>
          ) : null}
          {activeSession ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.45)] transition hover:border-slate-300"
                onClick={() => setProfileMenuOpen((current) => !current)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold uppercase tracking-wide text-white">
                  {avatarInitials}
                </span>
                <span className="hidden max-w-[11rem] truncate text-sm font-medium text-slate-700 lg:block">
                  {activeSession.name}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {profileMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_16px_30px_-20px_rgba(15,23,42,0.55)]"
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white/85 p-2 text-slate-700 md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={menuVariants}
            viewport={viewportOnce}
            className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_20px_30px_-20px_rgba(15,23,42,0.45)] backdrop-blur md:hidden"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              {!activeSession ? (
                <>
                  <Button
                    to={ROUTES.ownerLogin}
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    iconLeft={<Building2 className="h-4 w-4" />}
                  >
                    Owner Login
                  </Button>
                  <Button
                    to={ROUTES.tenantLogin}
                    variant="outline"
                    onClick={() => setOpen(false)}
                    iconLeft={<UserRound className="h-4 w-4" />}
                  >
                    Tenant Login
                  </Button>
                </>
              ) : null}
              {activeSession?.dashboardTo && activeSession?.dashboardLabel ? (
                <Button to={activeSession.dashboardTo} variant="secondary" onClick={() => setOpen(false)}>
                  {activeSession.dashboardLabel}
                </Button>
              ) : null}
              {activeSession ? (
                <>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold uppercase tracking-wide text-white">
                      {avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{activeSession.name}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-500">{activeSession.role} session</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start"
                    iconLeft={<LogOut className="h-4 w-4" />}
                  >
                    Logout
                  </Button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
