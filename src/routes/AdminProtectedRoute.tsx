import { Navigate, Outlet } from 'react-router-dom'

import { useAdminAuth } from '../hooks/useAdminAuth'
import { ROUTES } from './constants'

export function AdminProtectedRoute() {
  const { admin, loading } = useAdminAuth()

  if (loading) {
    return <div className="p-6 text-slate-500">Loading admin session...</div>
  }

  if (!admin) {
    return <Navigate to={ROUTES.adminLogin} replace />
  }

  return <Outlet />
}
