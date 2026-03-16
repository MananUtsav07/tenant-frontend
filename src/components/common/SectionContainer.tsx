import clsx from 'clsx'
import type { ReactNode } from 'react'

type SectionContainerProps = {
  as?: 'section' | 'div'
  children: ReactNode
  className?: string
  contentClassName?: string
  id?: string
  size?: 'narrow' | 'default' | 'wide'
  padded?: boolean
  tone?: 'default' | 'panel' | 'hero' | 'navy'
}

const containerWidths: Record<NonNullable<SectionContainerProps['size']>, string> = {
  narrow: 'max-w-[1040px]',
  default: 'max-w-[1320px]',
  wide: 'max-w-[1440px]',
}

export function SectionContainer({
  as = 'section',
  children,
  className,
  contentClassName,
  id,
  size = 'default',
  padded = true,
  tone = 'default',
}: SectionContainerProps) {
  const Tag = as

  const toneClassName =
    tone === 'panel'
      ? 'ph-section-shell ph-surface-panel'
      : tone === 'hero'
        ? 'ph-section-shell ph-surface-hero ph-hex-bg'
        : tone === 'navy'
          ? 'ph-section-shell ph-surface-navy'
          : undefined

  return (
    <Tag id={id} className={clsx('w-full', toneClassName, className)}>
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div
          className={clsx(
            'mx-auto w-full',
            containerWidths[size],
            padded ? 'py-18 md:py-24 lg:py-28' : undefined,
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </Tag>
  )
}
