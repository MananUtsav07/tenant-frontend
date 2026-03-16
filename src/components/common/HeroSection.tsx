import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

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
  heading: ReactNode
  subheading: ReactNode
  actions: HeroAction[]
  highlights: string[]
  sidePanel?: ReactNode
  fullViewport?: boolean
}

export function HeroSection({
  badge,
  heading,
  subheading,
  actions,
  highlights,
  sidePanel,
  fullViewport = false,
}: HeroSectionProps) {
  const revealVariants = useMotionVariants(revealUp)
  const fadeVariants = useMotionVariants(fadeIn)
  const staggerVariants = useMotionVariants(staggerParent)
  const motionEnabled = useMotionEnabled()
  const hasSidePanel = Boolean(sidePanel)
  const layoutClassName = hasSidePanel ? 'grid gap-12 lg:grid-cols-[1.15fr_0.85fr]' : 'grid gap-12'

  return (
    <SectionContainer
      className="relative"
      contentClassName={
        fullViewport
          ? 'flex min-h-[calc(100svh-5rem)] flex-col justify-center py-10 md:py-14'
          : 'py-16 md:py-20 lg:py-24'
      }
      padded={false}
      size="wide"
      tone="hero"
    >
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
        className="pointer-events-none absolute -left-16 top-0 h-60 w-60 rounded-full bg-[rgba(240,163,35,0.18)] blur-3xl"
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
        className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-[rgba(11,22,51,0.52)] blur-3xl"
      />

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className={clsx(layoutClassName, fullViewport && 'min-h-full lg:items-stretch')}
      >
        <motion.div variants={revealVariants} className={clsx('relative z-10', fullViewport && 'flex flex-col justify-center')}>
          <span className="ph-kicker">
            {badge}
          </span>
          <h1 className="ph-title mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] text-[var(--ph-text)] sm:text-5xl lg:text-6xl xl:text-[4.6rem]">
            {heading}
          </h1>
          <div className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">{subheading}</div>
          <div className="mt-9 flex flex-wrap gap-3">
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
          <ul className="mt-10 grid gap-2.5 text-sm text-[var(--ph-text-soft)] sm:grid-cols-2">
            {highlights.map((highlight) => (
              <motion.li
                key={highlight}
                variants={fadeVariants}
                className="flex items-start gap-3 rounded-[1.2rem] border border-[rgba(83,88,100,0.3)] bg-white/[0.025] px-4 py-3 backdrop-blur"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ph-accent)] shadow-[0_0_0_4px_rgba(240,163,35,0.1)]" />
                <span>{highlight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {sidePanel ? (
          <motion.div
            variants={revealVariants}
            animate={
              motionEnabled
                ? {
                    y: [0, -7, 0],
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
            className={clsx('relative', fullViewport && 'h-full')}
          >
            <div
              className={clsx(
                'ph-surface-card-strong ph-hex-bg h-full p-6 text-[var(--ph-text)] shadow-[0_32px_82px_-60px_rgba(0,0,0,0.72)] sm:p-7 lg:p-8',
                fullViewport && 'min-h-[420px] lg:min-h-0',
              )}
            >
              {sidePanel}
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </SectionContainer>
  )
}
