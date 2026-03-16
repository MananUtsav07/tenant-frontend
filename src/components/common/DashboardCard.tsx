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
      whileHover={motionEnabled ? { y: -2 } : undefined}
      className="tf-panel p-5 sm:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ph-text-muted)]">{label}</p>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--ph-text)] sm:text-[2.1rem]">{value}</p>
          {hint ? <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-[var(--ph-text-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
            {icon}
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}

