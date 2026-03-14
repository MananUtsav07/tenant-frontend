import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import { revealScale, useMotionEnabled, useMotionVariants, viewportOnce } from '../../utils/motion'

type FeatureCardProps = {
  icon: ReactNode
  title: string
  description: string
  detail?: string
}

export function FeatureCard({ icon, title, description, detail }: FeatureCardProps) {
  const motionEnabled = useMotionEnabled()
  const revealVariants = useMotionVariants(revealScale)

  return (
    <motion.article
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      whileHover={motionEnabled ? { y: -6 } : undefined}
      className="ph-surface-card group h-full p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(240,163,35,0.58)] to-transparent opacity-85" />
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[var(--ph-text)] transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="ph-title mt-5 text-xl font-semibold text-[var(--ph-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
      {detail ? (
        <p className="mt-5 inline-flex rounded-full border border-[rgba(151,105,34,0.28)] bg-[rgba(240,163,35,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
          {detail}
        </p>
      ) : null}
    </motion.article>
  )
}

