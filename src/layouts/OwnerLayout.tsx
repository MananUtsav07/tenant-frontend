import { Bell, Briefcase, Building2, LayoutDashboard, LifeBuoy, Plug, UserCircle, Users } from 'lucide-react'

import { OwnerNotificationBell } from '../components/owner/OwnerNotificationBell'
import { OwnerNotificationsProvider } from '../hooks/OwnerNotificationsProvider'
import { useOwnerNotifications } from '../hooks/useOwnerNotifications'
import { OwnerApprovalsProvider } from '../hooks/OwnerApprovalsProvider'
import { useOwnerApprovals } from '../hooks/useOwnerApprovals'
import { DashboardLayout } from './DashboardLayout'
import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { ROUTES } from '../routes/constants'

function OwnerLayoutContent() {
  const { owner, logout } = useOwnerAuth()
  const organizationName = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Organization'
  const { unreadCount } = useOwnerNotifications()
  const { pendingCount } = useOwnerApprovals()

  const ownerLinks = [
    { to: ROUTES.ownerDashboard, label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, badge: pendingCount > 0 ? { count: pendingCount, color: 'red' as const, tooltip: `${pendingCount} approval${pendingCount !== 1 ? 's' : ''} pending` } : undefined },
    { to: ROUTES.ownerProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
    { to: ROUTES.ownerBrokers, label: 'Brokers', icon: <Briefcase className="h-4 w-4" /> },
    { to: ROUTES.ownerTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
    { to: ROUTES.ownerTickets, label: 'Tickets', icon: <LifeBuoy className="h-4 w-4" /> },
    // { to: ROUTES.ownerMaintenance, label: 'Maintenance', icon: <Hammer className="h-4 w-4" /> },
    { to: ROUTES.ownerNotifications, label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: unreadCount > 0 ? { count: unreadCount, color: 'red' as const, tooltip: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} unread` } : undefined },
    // { to: ROUTES.ownerAutomation, label: 'Automation', icon: <Bot className="h-4 w-4" /> },
    // { to: ROUTES.ownerAiSettings, label: 'AI Settings', icon: <Sparkles className="h-4 w-4" /> },
    { to: ROUTES.ownerIntegrations, label: 'Integrations', icon: <Plug className="h-4 w-4" /> },
    { to: ROUTES.ownerProfile, label: 'Profile', icon: <UserCircle className="h-4 w-4" /> },
  ]

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Manage your properties, tenants, and automation"
      identityPrimary={organizationName}
      identitySecondary={owner?.email || undefined}
      navItems={ownerLinks}
      onLogout={logout}
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
