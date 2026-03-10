import { Navigate, Outlet } from 'react-router-dom'

import { useTenantAuth } from '../hooks/useTenantAuth'
import { ROUTES } from './constants'

export function TenantProtectedRoute() {
  const { tenant, loading } = useTenantAuth()

  if (loading) {
    return <div className="p-6 text-slate-500">Loading tenant session...</div>
  }

  if (!tenant) {
    return <Navigate to={ROUTES.tenantLogin} replace />
  }

  return <Outlet />
}
