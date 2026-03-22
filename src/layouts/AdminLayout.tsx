import { Bot, Building2, ClipboardList, LayoutDashboard, Mail, MessageSquare, Users } from 'lucide-react'

import { useAdminAuth } from '../hooks/useAdminAuth'
import { ROUTES } from '../routes/constants'
import { DashboardLayout } from './DashboardLayout'

const adminLinks = [
  { to: ROUTES.adminDashboard, label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: ROUTES.adminOrganizations, label: 'Organizations', icon: <Building2 className="h-4 w-4" /> },
  { to: ROUTES.adminOwners, label: 'Owners', icon: <Users className="h-4 w-4" /> },
  { to: ROUTES.adminTenants, label: 'Tenants', icon: <Users className="h-4 w-4" /> },
  { to: ROUTES.adminProperties, label: 'Properties', icon: <Building2 className="h-4 w-4" /> },
  { to: ROUTES.adminTickets, label: 'Tickets', icon: <MessageSquare className="h-4 w-4" /> },
  { to: ROUTES.adminAutomations, label: 'Automations', icon: <Bot className="h-4 w-4" /> },
  { to: ROUTES.adminContactMessages, label: 'Contacts', icon: <Mail className="h-4 w-4" /> },
  { to: ROUTES.adminBlog, label: 'Blog', icon: <ClipboardList className="h-4 w-4" /> },
]

export function AdminLayout() {
  const { admin, logout } = useAdminAuth()

  return (
    <DashboardLayout
      title="Admin Observatory"
      subtitle="Platform oversight, health, and portfolio intelligence"
      identityPrimary={admin?.full_name || admin?.email || 'Platform Admin'}
      identitySecondary={admin?.email || undefined}
      navItems={adminLinks}
      onLogout={logout}
    />
  )
}
