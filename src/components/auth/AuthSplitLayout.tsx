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
    <SectionContainer size="wide" className="py-12">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="ph-surface-navy ph-hex-bg rounded-[1.8rem] p-6 sm:p-7"
        >
          <span className="ph-kicker">{eyebrow}</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)]">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ph-text-soft)]">
            {highlights.map((item, index) => (
              <p key={`${eyebrow}-${index}`} className="inline-flex items-center gap-2">
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
          className="ph-surface-card-strong rounded-[1.9rem] p-7"
        >
          <h2 className="ph-title text-3xl font-semibold text-[var(--ph-text)]">{panelTitle}</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{panelDescription}</p>
          <div className="mt-5">{children}</div>
        </motion.div>
      </div>
    </SectionContainer>
  )
}
