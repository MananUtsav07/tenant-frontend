import { useReducedMotion, type Variants } from 'framer-motion'

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const viewportOnce = { once: true, amount: 0.2 }

const noMotion: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: easeOut },
  },
}

export const revealScale: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
}

export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.08,
    },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
}

export function useMotionVariants(variants: Variants): Variants {
  const reducedMotion = useReducedMotion()
  return reducedMotion ? noMotion : variants
}

export function useMotionEnabled(): boolean {
  const reducedMotion = useReducedMotion()
  return !reducedMotion
}

