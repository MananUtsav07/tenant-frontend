import { Bell, Briefcase, Building2, FileText, LayoutDashboard, LifeBuoy, MailWarning, Plug, UserCircle, Users } from 'lucide-react'
import { useState } from 'react'

import { OwnerNotificationBell } from '../components/owner/OwnerNotificationBell'
import { OwnerNotificationsProvider } from '../hooks/OwnerNotificationsProvider'
import { useOwnerNotifications } from '../hooks/useOwnerNotifications'
import { OwnerApprovalsProvider } from '../hooks/OwnerApprovalsProvider'
import { useOwnerApprovals } from '../hooks/useOwnerApprovals'
import { DashboardLayout } from './DashboardLayout'
import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { api } from '../services/api'
import { ROUTES } from '../routes/constants'

function OwnerLayoutContent() {
  const { owner, token, logout } = useOwnerAuth()
  const organizationName = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Organization'
  const { unreadCount } = useOwnerNotifications()
  const { pendingCount } = useOwnerApprovals()
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    if (!token || resendState === 'sending' || resendState === 'sent') return
    setResendState('sending')
    try {
      await api.ownerResendVerification(token)
      setResendState('sent')
    } catch {
      setResendState('error')
      setTimeout(() => setResendState('idle'), 3000)
    }
  }

  const ownerLinks = [
    { to: ROUTES.ownerDashboard, label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, badge: pendingCount > 0 ? { count: pendingCount, color: 'red' as const, tooltip: `${pendingCount} approval${pendingCount !== 1 ? 's' : ''} pending` } : undefined },
    { to: ROUTES.ownerProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
    { to: ROUTES.ownerBrokers, label: 'Brokers', icon: <Briefcase className="h-4 w-4" /> },
    { to: ROUTES.ownerTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
    { to: ROUTES.ownerDocuments, label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { to: ROUTES.ownerTickets, label: 'Tickets', icon: <LifeBuoy className="h-4 w-4" /> },
    // { to: ROUTES.ownerMaintenance, label: 'Maintenance', icon: <Hammer className="h-4 w-4" /> },
    { to: ROUTES.ownerNotifications, label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: unreadCount > 0 ? { count: unreadCount, color: 'red' as const, tooltip: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} unread` } : undefined },
    // { to: ROUTES.ownerAutomation, label: 'Automation', icon: <Bot className="h-4 w-4" /> },
    // { to: ROUTES.ownerAiSettings, label: 'AI Settings', icon: <Sparkles className="h-4 w-4" /> },
    { to: ROUTES.ownerIntegrations, label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
    { to: ROUTES.ownerProfile, label: 'Profile', icon: <UserCircle className="h-4 w-4" /> },
  ]

  const emailVerifiedBanner =
    owner && owner.email_verified === false ? (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1A1500] border-b border-[#3A3000] text-sm">
        <MailWarning className="h-4 w-4 shrink-0 text-[#FED609]" />
        <span className="text-[#C8B878] flex-1">
          {resendState === 'sent'
            ? 'Verification email sent — check your inbox.'
            : 'Please verify your email address to receive rent alerts and notifications.'}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendState === 'sending' || resendState === 'sent'}
          className="shrink-0 text-xs font-semibold text-[#FED609] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Sent' : resendState === 'error' ? 'Failed — try again' : 'Resend email'}
        </button>
      </div>
    ) : undefined

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Manage your properties, tenants, and automation"
      identityPrimary={organizationName}
      identitySecondary={owner?.email || undefined}
      navItems={ownerLinks}
      onLogout={logout}
      topBanner={emailVerifiedBanner}
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
