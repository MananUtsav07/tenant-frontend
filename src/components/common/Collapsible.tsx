import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

import { useMotionEnabled } from '../../utils/motion'

type CollapsibleProps = {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}

export function Collapsible({ title, isOpen, onToggle, children, className }: CollapsibleProps) {
  const motionEnabled = useMotionEnabled()

  return (
    <div className={clsx('rounded-xl border border-[rgba(83,88,100,0.18)] bg-[var(--ph-surface)]', className)}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <span className="text-sm font-semibold text-[var(--ph-text)]">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={motionEnabled ? { duration: 0.2 } : { duration: 0 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--ph-text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={motionEnabled ? { height: 0, opacity: 0 } : undefined}
            animate={{ height: 'auto', opacity: 1 }}
            exit={motionEnabled ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgba(83,88,100,0.12)] px-5 py-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
