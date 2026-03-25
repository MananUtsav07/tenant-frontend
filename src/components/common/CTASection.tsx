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
  eyebrow = 'Get Started',
  title,
  description,
  primaryAction,
  secondaryAction,
}: CTASectionProps) {
  const revealVariants = useMotionVariants(revealUp)

  return (
    <SectionContainer className="py-10 md:py-14" tone="gold">
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative grid gap-8 lg:grid-cols-[1.15fr_auto] lg:items-end"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,0,0,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
            {eyebrow}
          </span>
          <h2 className="ph-title mt-5 text-3xl font-bold text-[#1A1A1A] md:text-4xl">{title}</h2>
          <div className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(0,0,0,0.6)]">{description}</div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Button
            to={primaryAction.href}
            variant="secondary"
            size="lg"
            className="!bg-[#1A1A1A] !text-white !border-[#1A1A1A] hover:!bg-[#333]"
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
              className="!border-[#1A1A1A] !text-[#1A1A1A] hover:!bg-[rgba(0,0,0,0.06)]"
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
