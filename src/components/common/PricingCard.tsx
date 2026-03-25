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
          ? 'border-[#FED609] bg-white shadow-[0_8px_32px_-12px_rgba(254,214,9,0.25)] ring-2 ring-[#FED609]'
          : 'border-[rgba(0,0,0,0.06)] bg-white shadow-sm'
      }`}
    >
      {highlighted ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FED609] via-[#FFD70B] to-[#FED609]" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="ph-title text-2xl font-semibold text-[#1A1A1A]">{name}</h3>
          <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#92700A]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-7 text-4xl font-bold tracking-tight text-[#1A1A1A]">{price}</p>
      {priceNote ? <p className="mt-2 text-sm text-[#6B7280]">{priceNote}</p> : null}
      <ul className="mt-7 space-y-3 text-sm text-[#4B5563]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#92700A]" />
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
