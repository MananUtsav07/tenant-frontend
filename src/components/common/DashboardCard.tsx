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
      className="tf-panel p-5"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-3xl font-semibold text-[var(--ph-text)]">{value}</p>
        {icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[var(--ph-accent)]">
            {icon}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{hint}</p> : null}
    </motion.div>
  )
}

