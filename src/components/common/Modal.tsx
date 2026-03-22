import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import clsx from 'clsx'

import { useMotionEnabled } from '../../utils/motion'

type ModalSize = 'sm' | 'md' | 'lg'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: ModalSize
  children: ReactNode
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export function Modal({ isOpen, onClose, title, size = 'md', children, className }: ModalProps) {
  const motionEnabled = useMotionEnabled()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  const content = (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[8vh]">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
            initial={motionEnabled ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            exit={motionEnabled ? { opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
          />

          {/* Panel */}
          <motion.div
            className={clsx(
              'relative w-full rounded-xl border border-[rgba(83,88,100,0.18)] bg-[var(--ph-surface)] shadow-xl',
              sizeClasses[size],
              className,
            )}
            initial={motionEnabled ? { opacity: 0, scale: 0.97, y: 8 } : undefined}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={motionEnabled ? { opacity: 0, scale: 0.97, y: 8 } : undefined}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(83,88,100,0.18)] px-6 py-4">
              <h2 className="text-base font-semibold text-[var(--ph-text)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--ph-text-muted)] transition hover:bg-white/5 hover:text-[var(--ph-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
