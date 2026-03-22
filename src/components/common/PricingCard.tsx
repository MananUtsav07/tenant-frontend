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
      className={`relative overflow-hidden rounded-xl border p-7 ${
        highlighted
          ? 'border-[rgba(240,163,35,0.28)] bg-[linear-gradient(160deg,rgba(31,40,66,0.98),rgba(11,22,51,0.94),rgba(18,21,32,0.98))] text-[var(--ph-text)] shadow-[0_28px_72px_-44px_rgba(240,163,35,0.34)]'
          : 'border-[rgba(83,88,100,0.56)] bg-[linear-gradient(180deg,rgba(19,24,38,0.96),rgba(14,18,30,0.98))] text-[var(--ph-text)] shadow-[0_24px_60px_-48px_rgba(0,0,0,0.74)]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(240,163,35,0.62)] to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="ph-title text-2xl font-semibold">{name}</h3>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f3d49a]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-7 text-4xl font-bold tracking-tight text-[var(--ph-text)]">{price}</p>
      {priceNote ? <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{priceNote}</p> : null}
      <ul className="mt-7 space-y-3 text-sm text-[var(--ph-text-soft)]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ph-accent)]" />
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

