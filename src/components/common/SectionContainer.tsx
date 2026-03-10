import clsx from 'clsx'
import type { ReactNode } from 'react'

type SectionContainerProps = {
  as?: 'section' | 'div'
  children: ReactNode
  className?: string
  id?: string
  size?: 'narrow' | 'default' | 'wide'
  padded?: boolean
}

const containerWidths: Record<NonNullable<SectionContainerProps['size']>, string> = {
  narrow: 'max-w-5xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

export function SectionContainer({
  as = 'section',
  children,
  className,
  id,
  size = 'default',
  padded = true,
}: SectionContainerProps) {
  const Tag = as
  return (
    <Tag
      id={id}
      className={clsx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        containerWidths[size],
        padded ? 'py-16 md:py-24' : undefined,
        className,
      )}
    >
      {children}
    </Tag>
  )
}
