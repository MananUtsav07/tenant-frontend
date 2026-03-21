import { AnimatePresence, motion } from 'framer-motion'
import { Building2, ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from '../common/Button'

const navItems = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.features, label: 'Platform' },
  { to: ROUTES.howItWorks, label: 'Workflow' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.blog, label: 'Insights' },
  { to: ROUTES.docs, label: 'Docs' },
  { to: ROUTES.contact, label: 'Contact' },
]

type ActiveSession = {
  role: 'owner' | 'tenant'
  name: string
  dashboardTo: string
  dashboardLabel: string
  onLogout: () => void
}

function getAvatarInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'P'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

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
        dashboardLabel: 'Tenant Workspace',
        onLogout: logoutTenant,
      }
    : owner
      ? {
          role: 'owner',
          name: owner.full_name || owner.company_name || owner.email,
          dashboardTo: ROUTES.ownerDashboard,
          dashboardLabel: 'Owner Workspace',
          onLogout: logoutOwner,
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
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[rgba(83,88,100,0.28)] bg-[rgba(9,13,24,0.84)] shadow-[0_16px_42px_-32px_rgba(0,0,0,0.78)] backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 py-3.5">
          <Link to={ROUTES.home} className="inline-flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(240,163,35,0.24)] bg-[linear-gradient(135deg,rgba(240,163,35,0.16),rgba(11,22,51,0.92))] shadow-[0_16px_34px_-22px_rgba(240,163,35,0.28)]">
              <span className="absolute inset-[5px] rounded-[0.85rem] border border-white/8 bg-[rgba(11,22,51,0.58)]" />
              <span className="ph-title relative z-10 text-base font-semibold text-[var(--ph-accent)]">P</span>
            </span>
            <span>
              <span className="ph-title block text-base font-semibold text-[var(--ph-text)] sm:text-lg">Prophives</span>
              <span className="text-[11px] uppercase tracking-[0.24em] text-[var(--ph-text-muted)]">AI Real Estate Ops</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.04] text-[var(--ph-text)] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.52)]'
                      : 'text-[var(--ph-text-muted)] hover:bg-white/[0.025] hover:text-[var(--ph-text)]'
                  }`
                }
              >
                {item.label}
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
                  variant="secondary"
                  size="sm"
                  iconLeft={<UserRound className="h-4 w-4" />}
                >
                  Tenant Login
                </Button>
              </>
            ) : null}
            {activeSession ? (
              <Button to={activeSession.dashboardTo} variant="secondary" size="sm">
                {activeSession.dashboardLabel}
              </Button>
            ) : null}
            {activeSession ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(83,88,100,0.34)] bg-white/[0.03] px-2 py-1 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.68)] transition hover:border-[rgba(151,105,34,0.28)]"
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-xs font-semibold uppercase tracking-wide text-[#f3d49a]">
                    {avatarInitials}
                  </span>
                  <span className="hidden max-w-[11rem] truncate text-sm font-medium text-[var(--ph-text)] lg:block">
                    {activeSession.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--ph-text-muted)] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {profileMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg border border-[rgba(83,88,100,0.38)] bg-[linear-gradient(180deg,rgba(20,26,40,0.98),rgba(11,16,27,1))] p-1.5 shadow-[0_18px_34px_-22px_rgba(0,0,0,0.82)]"
                    >
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--ph-text-soft)] transition hover:bg-white/[0.05] hover:text-[var(--ph-text)]"
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
            className="rounded-full border border-[rgba(83,88,100,0.34)] bg-white/[0.03] p-2 text-[var(--ph-text)] md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={menuVariants}
            viewport={viewportOnce}
            className="border-t border-[rgba(83,88,100,0.3)] bg-[rgba(9,13,24,0.96)] px-4 py-4 shadow-[0_20px_30px_-20px_rgba(0,0,0,0.72)] backdrop-blur md:hidden"
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-sm ${
                      isActive
                        ? 'border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] text-[#f4d298]'
                        : 'text-[var(--ph-text-soft)] hover:bg-white/[0.03] hover:text-[var(--ph-text)]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 grid gap-2">
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
                    variant="secondary"
                    onClick={() => setOpen(false)}
                    iconLeft={<UserRound className="h-4 w-4" />}
                  >
                    Tenant Login
                  </Button>
                </>
              ) : null}
              {activeSession ? (
                <>
                  <Button to={activeSession.dashboardTo} variant="secondary" onClick={() => setOpen(false)}>
                    {activeSession.dashboardLabel}
                  </Button>
                  <div className="mt-1 inline-flex items-center gap-3 rounded-lg border border-[rgba(83,88,100,0.32)] bg-white/[0.025] px-4 py-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.12)] text-xs font-semibold uppercase tracking-wide text-[#f3d49a]">
                      {avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--ph-text)]">{activeSession.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
                        {activeSession.role} session
                      </p>
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
