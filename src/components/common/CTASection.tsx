import { motion } from 'framer-motion'

import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from './Button'
import { SectionContainer } from './SectionContainer'

type CTASectionProps = {
  title: string
  description: string
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
}

export function CTASection({ title, description, primaryAction, secondaryAction }: CTASectionProps) {
  const revealVariants = useMotionVariants(revealUp)

  return (
    <SectionContainer>
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="premium-border rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-8 shadow-[0_28px_75px_-52px_rgba(37,99,235,0.62)] md:p-11"
      >
        <h2 className="font-[Space_Grotesk] text-3xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            to={primaryAction.href}
            variant="primary"
            size="lg"
            analyticsEvent="cta_click"
            analyticsMetadata={{ section: title, action: primaryAction.label }}
          >
            {primaryAction.label}
          </Button>
          {secondaryAction ? (
            <Button
              to={secondaryAction.href}
              variant="outline"
              size="lg"
              analyticsEvent="cta_click"
              analyticsMetadata={{ section: title, action: secondaryAction.label }}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      </motion.div>
    </SectionContainer>
  )
}

