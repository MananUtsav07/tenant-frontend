import { LayoutDashboard, LifeBuoy, MessageSquare } from 'lucide-react'

import { DashboardLayout } from './DashboardLayout'
import { useTenantAuth } from '../hooks/useTenantAuth'
import { ROUTES } from '../routes/constants'

const tenantLinks = [
  { to: ROUTES.tenantDashboard, label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: ROUTES.tenantTickets, label: 'Tickets', icon: <MessageSquare className="h-4 w-4" /> },
  { to: ROUTES.tenantSupport, label: 'Support', icon: <LifeBuoy className="h-4 w-4" /> },
]

export function TenantLayout() {
  const { tenant, logout } = useTenantAuth()
  const organizationName = tenant?.organization?.name || 'Organization'

  return (
    <DashboardLayout
      title="Resident Workspace"
      subtitle="Stay ahead of rent, support, and property updates"
      identityPrimary={organizationName}
      identitySecondary={tenant?.tenant_access_id || undefined}
      navItems={tenantLinks}
      onLogout={logout}
      showTopNavbar={false}
    />
  )
}
