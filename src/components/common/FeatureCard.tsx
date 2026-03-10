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
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_56px_-42px_rgba(15,23,42,0.3)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-sky-300 opacity-75" />
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="mt-4 font-[Space_Grotesk] text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      {detail ? <p className="mt-4 text-sm font-medium text-slate-700">{detail}</p> : null}
    </motion.article>
  )
}

