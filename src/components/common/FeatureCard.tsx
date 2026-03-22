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
      whileHover={motionEnabled ? { y: -3 } : undefined}
      className="ph-surface-card group h-full p-6 sm:p-7"
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(240,163,35,0.16)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-text)] transition-transform duration-200 group-hover:scale-[1.03]">
        {icon}
      </div>
      <h3 className="ph-title mt-6 text-xl font-semibold text-[var(--ph-text)]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
      {detail ? (
        <p className="mt-6 inline-flex rounded-full border border-[rgba(83,88,100,0.3)] bg-white/[0.025] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
          {detail}
        </p>
      ) : null}
    </motion.article>
  )
}

