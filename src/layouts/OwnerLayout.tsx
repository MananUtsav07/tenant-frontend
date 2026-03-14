import { Bell, Building2, LayoutDashboard, LifeBuoy, Sparkles, Users } from 'lucide-react'

import { DashboardLayout } from './DashboardLayout'
import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { ROUTES } from '../routes/constants'

const ownerLinks = [
  { to: ROUTES.ownerDashboard, label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: ROUTES.ownerProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
  { to: ROUTES.ownerTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
  { to: ROUTES.ownerTickets, label: 'Tickets', icon: <LifeBuoy className="h-4 w-4" /> },
  { to: ROUTES.ownerNotifications, label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { to: ROUTES.ownerAiSettings, label: 'AI Settings', icon: <Sparkles className="h-4 w-4" /> },
]

export function OwnerLayout() {
  const { owner, logout } = useOwnerAuth()
  const organizationName = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Organization'

  return (
    <DashboardLayout
      title="Owner Command Center"
      subtitle="Luxury operations control for properties, residents, and automation"
      identityPrimary={organizationName}
      identitySecondary={owner?.email || undefined}
      navItems={ownerLinks}
      onLogout={logout}
    />
  )
}
