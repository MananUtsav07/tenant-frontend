import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { SectionContainer } from '../common/SectionContainer'
import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'

type AuthSplitLayoutProps = {
  eyebrow: string
  title: string
  description: string
  highlights: Array<{
    icon: ReactNode
    text: string
  }>
  panelTitle: string
  panelDescription: string
  children: ReactNode
}

export function AuthSplitLayout({
  eyebrow,
  title,
  description,
  highlights,
  panelTitle,
  panelDescription,
  children,
}: AuthSplitLayoutProps) {
  const revealVariants = useMotionVariants(revealUp)

  return (
    <SectionContainer size="wide">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.02fr] lg:gap-8">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="ph-surface-navy ph-hex-bg rounded-xl p-6 sm:p-7 lg:p-8"
        >
          <span className="ph-kicker">{eyebrow}</span>
          <h1 className="ph-title mt-6 max-w-xl text-4xl font-semibold text-[var(--ph-text)]">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
          <div className="mt-7 space-y-3 text-sm text-[var(--ph-text-soft)]">
            {highlights.map((item, index) => (
              <p key={`${eyebrow}-${index}`} className="inline-flex items-center gap-2.5">
                <span className="text-[var(--ph-accent)]">{item.icon}</span>
                {item.text}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8"
        >
          <h2 className="ph-title text-3xl font-semibold text-[var(--ph-text)]">{panelTitle}</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{panelDescription}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </SectionContainer>
  )
}
