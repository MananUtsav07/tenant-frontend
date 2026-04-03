import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

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
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.15)] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
            {eyebrow}
          </span>
          <h2 className="ph-title mt-5 text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <div className="mt-4 max-w-2xl text-base leading-relaxed text-[rgba(255,255,255,0.75)]">{description}</div>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link
            to={primaryAction.href}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-[0.01em] text-[#2251E3] transition duration-200 ease-out hover:bg-[rgba(255,255,255,0.9)] sm:text-base"
          >
            {primaryAction.label}
          </Link>
          {secondaryAction ? (
            <Button
              to={secondaryAction.href}
              variant="outline"
              size="lg"
              className="!border-white/40 !text-white hover:!bg-[rgba(255,255,255,0.1)]"
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
