import { Bell, Bot, Briefcase, Building2, Hammer, LayoutDashboard, LifeBuoy, Sparkles, Users } from 'lucide-react'

import { OwnerNotificationBell } from '../components/owner/OwnerNotificationBell'
import { OwnerNotificationsProvider } from '../hooks/OwnerNotificationsProvider'
import { useOwnerNotifications } from '../hooks/useOwnerNotifications'
import { DashboardLayout } from './DashboardLayout'
import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { ROUTES } from '../routes/constants'

const ownerLinks = [
  { to: ROUTES.ownerDashboard, label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: ROUTES.ownerProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
  { to: ROUTES.ownerBrokers, label: 'Brokers', icon: <Briefcase className="h-4 w-4" /> },
  { to: ROUTES.ownerTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
  { to: ROUTES.ownerTickets, label: 'Tickets', icon: <LifeBuoy className="h-4 w-4" /> },
  { to: ROUTES.ownerMaintenance, label: 'Maintenance', icon: <Hammer className="h-4 w-4" /> },
  { to: ROUTES.ownerNotifications, label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { to: ROUTES.ownerAutomation, label: 'Automation', icon: <Bot className="h-4 w-4" /> },
  { to: ROUTES.ownerAiSettings, label: 'AI Settings', icon: <Sparkles className="h-4 w-4" /> },
]

function OwnerLayoutContent() {
  const { owner, logout } = useOwnerAuth()
  const organizationName = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Organization'
  const { unreadCount } = useOwnerNotifications()

  return (
    <DashboardLayout
      title="Prophives"
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
      <OwnerLayoutContent />
    </OwnerNotificationsProvider>
  )
}
