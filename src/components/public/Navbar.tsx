import { AnimatePresence, motion } from 'framer-motion'
import { Building2, ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

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
        dashboardLabel: 'Dashboard',
        onLogout: logoutTenant,
      }
    : owner
      ? {
          role: 'owner',
          name: owner.full_name || owner.company_name || owner.email,
          dashboardTo: ROUTES.ownerDashboard,
          dashboardLabel: 'Dashboard',
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
          ? 'border-b border-[rgba(0,0,0,0.06)] bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between py-3">
        {/* Logo */}
        <Link to={ROUTES.home} className="inline-flex items-center" onClick={() => setOpen(false)}>
          <img src="/prophives-logo.svg" alt="Prophives" className="h-10 w-auto object-contain" />
        </Link>

        {/* Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="relative rounded-lg px-3 py-2 text-sm font-medium">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? 'text-[#1A1A1A] font-semibold'
                      : 'text-[#6B7280] transition-colors hover:text-[#1A1A1A]'
                  }
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!activeSession ? (
            <>
              <Button to={ROUTES.ownerLogin} variant="ghost" size="sm" iconLeft={<Building2 className="h-4 w-4" />}>
                Login
              </Button>
              <Button to={ROUTES.tenantLogin} variant="primary" size="sm">
                Get Started
              </Button>
            </>
          ) : null}
          {activeSession ? (
            <Button to={activeSession.dashboardTo} variant="primary" size="sm">
              {activeSession.dashboardLabel}
            </Button>
          ) : null}
          {activeSession ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-2 py-1 shadow-sm transition hover:border-[rgba(254,214,9,0.4)]"
                onClick={() => setProfileMenuOpen((current) => !current)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(254,214,9,0.15)] text-xs font-semibold uppercase text-[#92700A]">
                  {avatarInitials}
                </span>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-[#1A1A1A] lg:block">
                  {activeSession.name}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#6B7280] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {profileMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-1 shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] transition hover:bg-[rgba(0,0,0,0.03)] hover:text-[#1A1A1A]"
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

        {/* Mobile Toggle */}
        <button
          type="button"
          className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-2 text-[#1A1A1A] md:hidden"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={menuVariants}
            viewport={viewportOnce}
            className="border-t border-[rgba(0,0,0,0.06)] bg-white px-4 py-4 shadow-lg md:hidden"
          >
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-2.5 text-sm ${
                      isActive
                        ? 'bg-[rgba(254,214,9,0.1)] font-semibold text-[#1A1A1A]'
                        : 'text-[#6B7280] hover:bg-[rgba(0,0,0,0.02)] hover:text-[#1A1A1A]'
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
                    Login
                  </Button>
                  <Button
                    to={ROUTES.tenantLogin}
                    variant="primary"
                    onClick={() => setOpen(false)}
                  >
                    Get Started
                  </Button>
                </>
              ) : null}
              {activeSession ? (
                <>
                  <Button to={activeSession.dashboardTo} variant="primary" onClick={() => setOpen(false)}>
                    {activeSession.dashboardLabel}
                  </Button>
                  <div className="mt-1 inline-flex items-center gap-3 rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FEFAEF] px-4 py-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(254,214,9,0.15)] text-xs font-semibold uppercase text-[#92700A]">
                      {avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1A1A1A]">{activeSession.name}</p>
                      <p className="text-xs text-[#6B7280] capitalize">{activeSession.role}</p>
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
