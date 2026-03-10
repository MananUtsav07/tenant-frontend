import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { fadeIn, revealUp, staggerParent, useMotionEnabled, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from './Button'
import { SectionContainer } from './SectionContainer'

type HeroAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

type HeroSectionProps = {
  badge: string
  heading: string
  subheading: string
  actions: HeroAction[]
  highlights: string[]
  sidePanel?: ReactNode
}

export function HeroSection({ badge, heading, subheading, actions, highlights, sidePanel }: HeroSectionProps) {
  const revealVariants = useMotionVariants(revealUp)
  const fadeVariants = useMotionVariants(fadeIn)
  const staggerVariants = useMotionVariants(staggerParent)
  const motionEnabled = useMotionEnabled()

  return (
    <SectionContainer className="relative overflow-hidden py-16 md:py-24" size="wide">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.6 }}
        animate={
          motionEnabled
            ? {
                opacity: [0.4, 0.7, 0.4],
              }
            : undefined
        }
        transition={
          motionEnabled
            ? {
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }
            : undefined
        }
        className="pointer-events-none absolute -left-12 top-0 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.45 }}
        animate={
          motionEnabled
            ? {
                opacity: [0.3, 0.55, 0.3],
              }
            : undefined
        }
        transition={
          motionEnabled
            ? {
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 0.6,
              }
            : undefined
        }
        className="pointer-events-none absolute -right-14 top-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"
      />

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-10 lg:grid-cols-[1.3fr_1fr]"
      >
        <motion.div variants={revealVariants}>
          <span className="inline-flex rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-900">
            {badge}
          </span>
          <h1 className="mt-6 font-[Space_Grotesk] text-4xl font-semibold leading-tight text-slate-950 md:text-6xl md:leading-[1.05]">
            {heading}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">{subheading}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <motion.div key={action.label} variants={fadeVariants} transition={{ delay: index * 0.05 }}>
                <Button
                  to={action.href}
                  variant={action.variant ?? 'primary'}
                  size="lg"
                  iconRight={index === 0 ? <ArrowRight className="h-4 w-4" /> : undefined}
                  analyticsEvent="cta_click"
                  analyticsMetadata={{ section: 'hero', action: action.label }}
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
          <ul className="mt-8 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <motion.li key={highlight} variants={fadeVariants} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{highlight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={revealVariants}
          animate={
            motionEnabled
              ? {
                  y: [0, -8, 0],
                }
              : undefined
          }
          transition={
            motionEnabled
              ? {
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }
              : undefined
          }
          className="glass-card rounded-3xl p-6 text-slate-900 shadow-[0_35px_90px_-62px_rgba(15,23,42,0.48)]"
        >
          {sidePanel}
        </motion.div>
      </motion.div>
    </SectionContainer>
  )
}


