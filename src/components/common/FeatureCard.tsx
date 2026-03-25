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
      whileHover={motionEnabled ? { y: -4 } : undefined}
      className="group h-full rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm transition-all hover:border-[rgba(254,214,9,0.3)] hover:shadow-md"
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(254,214,9,0.12)] text-[#92700A] transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="ph-title mt-4 text-lg font-bold text-[#1A1A1A]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{description}</p>
      {detail ? (
        <p className="ph-badge ph-badge-gold mt-4">
          {detail}
        </p>
      ) : null}
    </motion.article>
  )
}
