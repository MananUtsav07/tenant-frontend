import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { revealScale, useMotionEnabled, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from './Button'

type PricingCardProps = {
  name: string
  price: string
  description: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
  priceNote?: string
}

export function PricingCard({
  name,
  price,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  badge,
  priceNote,
}: PricingCardProps) {
  const motionEnabled = useMotionEnabled()
  const revealVariants = useMotionVariants(revealScale)

  return (
    <motion.article
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      whileHover={motionEnabled ? { y: -6 } : undefined}
      className={`relative overflow-hidden rounded-xl border p-7 transition-all hover:shadow-md ${
        highlighted
          ? 'border-[#2251E3] bg-[#101114] shadow-[0_8px_32px_-12px_rgba(34,81,227,0.35)] ring-2 ring-[#2251E3]'
          : 'border-[#272839] bg-[#101114] shadow-sm'
      }`}
    >
      {highlighted ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2251E3] via-[#4E79FF] to-[#2251E3]" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="ph-title text-2xl font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm text-[#8D8D96]">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-[rgba(34,81,227,0.3)] bg-[rgba(34,81,227,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4E79FF]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-7 text-4xl font-bold tracking-tight text-white">{price}</p>
      {priceNote ? <p className="mt-2 text-sm text-[#8D8D96]">{priceNote}</p> : null}
      <ul className="mt-7 space-y-3 text-sm text-[#C0C0C5]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#32C382]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button to={ctaHref} variant={highlighted ? 'primary' : 'secondary'} className="mt-8 w-full justify-center">
        {ctaLabel}
      </Button>
    </motion.article>
  )
}
