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
}

export function PricingCard({ name, price, description, features, ctaLabel, ctaHref, highlighted = false }: PricingCardProps) {
  const motionEnabled = useMotionEnabled()
  const revealVariants = useMotionVariants(revealScale)

  return (
    <motion.article
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      whileHover={motionEnabled ? { y: -6 } : undefined}
      className={`relative overflow-hidden rounded-2xl border p-7 ${
        highlighted
          ? 'border-blue-300 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_30px_75px_-42px_rgba(37,99,235,0.78)]'
          : 'border-slate-200 bg-white text-slate-900 shadow-[0_22px_55px_-45px_rgba(15,23,42,0.4)]'
      }`}
    >
      {highlighted ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-300 via-blue-500 to-sky-300" />
      ) : null}
      <h3 className="font-[Space_Grotesk] text-2xl font-semibold">{name}</h3>
      <p className={`mt-2 text-sm ${highlighted ? 'text-blue-100' : 'text-slate-600'}`}>{description}</p>
      <p className="mt-6 text-4xl font-bold">{price}</p>
      <ul className={`mt-6 space-y-3 text-sm ${highlighted ? 'text-blue-50' : 'text-slate-700'}`}>
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? 'text-white' : 'text-blue-700'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button to={ctaHref} variant={highlighted ? 'secondary' : 'outline'} className="mt-7 w-full justify-center">
        {ctaLabel}
      </Button>
    </motion.article>
  )
}

