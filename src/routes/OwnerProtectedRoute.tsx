import { Navigate, Outlet } from 'react-router-dom'

import { useOwnerAuth } from '../hooks/useOwnerAuth'
import { ROUTES } from './constants'

export function OwnerProtectedRoute() {
  const { owner, loading } = useOwnerAuth()

  if (loading) {
    return <div className="p-6 text-slate-500">Loading owner session...</div>
  }

  if (!owner) {
    return <Navigate to={ROUTES.ownerLogin} replace />
  }

  return <Outlet />
}
