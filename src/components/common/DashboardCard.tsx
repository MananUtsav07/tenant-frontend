import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import { revealScale, useMotionEnabled, useMotionVariants, viewportOnce } from '../../utils/motion'

type DashboardCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function DashboardCard({ label, value, hint, icon }: DashboardCardProps) {
  const revealVariants = useMotionVariants(revealScale)
  const motionEnabled = useMotionEnabled()

  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      whileHover={motionEnabled ? { y: -3 } : undefined}
      className="tf-panel p-4"
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
        {icon ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
            {icon}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </motion.div>
  )
}

