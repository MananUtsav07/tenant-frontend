import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { Footer } from '../components/public/Footer'
import { Navbar } from '../components/public/Navbar'
import { useTenantAuth } from '../hooks/useTenantAuth'
import { ROUTES } from '../routes/constants'
import { useMotionEnabled } from '../utils/motion'

export function PublicLayout() {
  const location = useLocation()
  const motionEnabled = useMotionEnabled()
  const { tenant, loading } = useTenantAuth()

  if (loading) {
    return <div className="p-6 text-slate-500">Loading tenant session...</div>
  }

  if (tenant) {
    return <Navigate to={ROUTES.tenantDashboard} replace />
  }

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />
      <main className="saas-grid-bg relative isolate overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={motionEnabled ? { opacity: 0, y: 10 } : undefined}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            exit={motionEnabled ? { opacity: 0, y: -10 } : undefined}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
