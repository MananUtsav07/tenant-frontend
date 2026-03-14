import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from './Button'
import { SectionContainer } from './SectionContainer'

type CTASectionProps = {
  eyebrow?: string
  title: ReactNode
  description: ReactNode
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
}

export function CTASection({
  eyebrow = 'Next Move',
  title,
  description,
  primaryAction,
  secondaryAction,
}: CTASectionProps) {
  const revealVariants = useMotionVariants(revealUp)

  return (
    <SectionContainer className="premium-border py-10 md:py-14" tone="panel">
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative grid gap-6 lg:grid-cols-[1.2fr_auto] lg:items-end"
      >
        <div>
          <span className="ph-kicker">{eyebrow}</span>
          <h2 className="ph-title mt-5 text-3xl font-semibold text-[var(--ph-text)] md:text-4xl">{title}</h2>
          <div className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ph-text-muted)]">{description}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            to={primaryAction.href}
            variant="primary"
            size="lg"
            analyticsEvent="cta_click"
            analyticsMetadata={{ section: typeof title === 'string' ? title : 'cta', action: primaryAction.label }}
          >
            {primaryAction.label}
          </Button>
          {secondaryAction ? (
            <Button
              to={secondaryAction.href}
              variant="outline"
              size="lg"
              analyticsEvent="cta_click"
              analyticsMetadata={{
                section: typeof title === 'string' ? title : 'cta',
                action: secondaryAction.label,
              }}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      </motion.div>
    </SectionContainer>
  )
}
