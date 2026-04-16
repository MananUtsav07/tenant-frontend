import { Bell, Briefcase, Building2, Crown, FileText, Headphones, LayoutDashboard, LifeBuoy, MailWarning, Plug, Sparkles, UserCircle, Users, AlertTriangle, CreditCard, Clock, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { OwnerNotificationBell } from '../components/owner/OwnerNotificationBell'
import { OwnerNotificationsProvider } from '../hooks/OwnerNotificationsProvider'
import { useOwnerNotifications } from '../hooks/useOwnerNotifications'
import { OwnerApprovalsProvider } from '../hooks/OwnerApprovalsProvider'
import { useOwnerApprovals } from '../hooks/useOwnerApprovals'
import { DashboardLayout } from './DashboardLayout'
import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { api } from '../services/api'
import { ROUTES } from '../routes/constants'
import type { BillingState } from '../types/api'

function OwnerLayoutContent() {
  const { owner, token, logout } = useOwnerAuth()
  const organizationName = owner?.full_name || owner?.email || 'Owner'
  const { unreadCount } = useOwnerNotifications()
  const { pendingCount } = useOwnerApprovals()
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [billing, setBilling] = useState<BillingState | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!token) return
    api.getBillingState(token)
      .then(res => setBilling(res.billing))
      .catch(() => {})
  }, [token])

  // Hard lock: redirect to billing if trial expired and not already on billing page
  useEffect(() => {
    if (billing?.isTrialExpired && location.pathname !== ROUTES.ownerBilling) {
      navigate(ROUTES.ownerBilling, { replace: true })
    }
  }, [billing, location.pathname, navigate])

  const handleResend = async () => {
    if (!token || resendState === 'sending' || resendState === 'sent') return
    setResendState('sending')
    try {
      await api.ownerResendVerification(token)
      setResendState('sent')
    } catch {
      setResendState('error')
      setTimeout(() => setResendState('idle'), 8000)
    }
  }

  const ownerLinks = [
    { to: ROUTES.ownerDashboard, label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, badge: pendingCount > 0 ? { count: pendingCount, color: 'red' as const, tooltip: `${pendingCount} approval${pendingCount !== 1 ? 's' : ''} pending` } : undefined },
    { to: ROUTES.ownerProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
    { to: ROUTES.ownerBrokers, label: 'Brokers', icon: <Briefcase className="h-4 w-4" /> },
    { to: ROUTES.ownerTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
    { to: ROUTES.ownerDocuments, label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { to: ROUTES.ownerTickets, label: 'Tickets', icon: <LifeBuoy className="h-4 w-4" /> },
    { to: ROUTES.ownerAnalytics, label: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
    // { to: ROUTES.ownerMaintenance, label: 'Maintenance', icon: <Hammer className="h-4 w-4" /> },
    { to: ROUTES.ownerNotifications, label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: unreadCount > 0 ? { count: unreadCount, color: 'red' as const, tooltip: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} unread` } : undefined },
    // { to: ROUTES.ownerAutomation, label: 'Automation', icon: <Bot className="h-4 w-4" /> },
    { to: ROUTES.ownerAiSettings, label: 'AI Settings', icon: <Sparkles className="h-4 w-4" /> },
    { to: ROUTES.ownerIntegrations, label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
    { to: ROUTES.ownerProfile, label: 'Profile', icon: <UserCircle className="h-4 w-4" /> },
    { to: ROUTES.ownerBilling, label: 'Billing & Plan', icon: <CreditCard className="h-4 w-4" /> },
    { to: ROUTES.ownerContact, label: 'Contact Support', icon: <Headphones className="h-4 w-4" /> },
  ]

  const planBadge = billing ? (() => {
    if (billing.status === 'trialing' && !billing.isTrialExpired) {
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-amber-950/60 border border-amber-800/40 px-2 py-1">
          <Clock className="h-3 w-3 text-amber-400 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-300 leading-none">
            {billing.daysLeftInTrial !== null
              ? `Trial · ${billing.daysLeftInTrial} day${billing.daysLeftInTrial !== 1 ? 's' : ''} left`
              : 'Free Trial Active'}
          </span>
        </div>
      )
    }
    if (billing.status === 'active' && billing.planCode) {
      const isHighTier = billing.planCode === 'standard' || billing.planCode === 'plus' || billing.planCode === 'beyond'
      return (
        <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 border ${isHighTier ? 'bg-[rgba(34,81,227,0.15)] border-[#2251E3]/30' : 'bg-white/5 border-white/10'}`}>
          {isHighTier && <Crown className="h-3 w-3 text-[#4E79FF] shrink-0" />}
          <span className={`text-[10px] font-semibold leading-none ${isHighTier ? 'text-[#4E79FF]' : 'text-[#8D8D96]'}`}>
            {billing.planDisplayName}
          </span>
        </div>
      )
    }
    return null
  })() : null

  const trialBanner = billing?.status === 'trialing' && !billing.isTrialExpired && billing.daysLeftInTrial !== null && billing.daysLeftInTrial <= 5 ? (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-950/60 border-b border-amber-800/40 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <span className="text-amber-200 flex-1">
        Your free trial ends in <span className="font-bold">{billing.daysLeftInTrial} day{billing.daysLeftInTrial !== 1 ? 's' : ''}</span>.
        Choose a plan to keep your data and access.
      </span>
      <button
        type="button"
        onClick={() => navigate(ROUTES.ownerBilling)}
        className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-100 transition-colors cursor-pointer"
      >
        <CreditCard className="h-3.5 w-3.5" />
        Choose Plan
      </button>
    </div>
  ) : undefined

  const emailVerifiedBanner =
    owner && owner.email_verified === false ? (
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b text-sm transition-colors ${
        resendState === 'error'
          ? 'bg-red-950/60 border-red-800/40'
          : resendState === 'sent'
          ? 'bg-green-950/60 border-green-800/40'
          : 'bg-[#1A1500] border-[#3A3000]'
      }`}>
        <MailWarning className={`h-4 w-4 shrink-0 ${resendState === 'error' ? 'text-red-400' : resendState === 'sent' ? 'text-green-400' : 'text-[#FED609]'}`} />
        <span className={`flex-1 ${resendState === 'error' ? 'text-red-300' : resendState === 'sent' ? 'text-green-300' : 'text-[#C8B878]'}`}>
          {resendState === 'sent'
            ? 'Verification email sent — check your inbox (and spam folder).'
            : resendState === 'error'
            ? 'Failed to send email. Check your internet connection or try again later.'
            : 'Please verify your email address to receive rent alerts and notifications.'}
        </span>
        {resendState !== 'sent' && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === 'sending'}
            className={`shrink-0 text-xs font-bold px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              resendState === 'error'
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-[#FED609] text-[#1A1A1A] hover:bg-[#FFD70B]'
            }`}
          >
            {resendState === 'sending' ? 'Sending…' : resendState === 'error' ? 'Retry' : 'Resend email'}
          </button>
        )}
      </div>
    ) : undefined

  const topBanner = trialBanner ?? emailVerifiedBanner

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Manage your properties, tenants, and automation"
      identityPrimary={organizationName}
      identitySecondary={owner?.email || undefined}
      identityBadge={planBadge}
      navItems={ownerLinks}
      onLogout={logout}
      topBanner={topBanner}
      headerActions={
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-[rgba(83,88,100,0.36)] bg-white/[0.03] px-3 py-1 text-xs text-[var(--ph-text-muted)] sm:block">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All clear'}
          </div>
          <OwnerNotificationBell />
        </div>
      }
    />
  )
}

export function OwnerLayout() {
  return (
    <OwnerNotificationsProvider>
      <OwnerApprovalsProvider>
        <OwnerLayoutContent />
      </OwnerApprovalsProvider>
    </OwnerNotificationsProvider>
  )
}
