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
  tone?: 'default' | 'panel' | 'hero' | 'navy' | 'cream' | 'ivory' | 'gold'
}

const containerWidths: Record<NonNullable<SectionContainerProps['size']>, string> = {
  narrow: 'max-w-[1120px]',
  default: 'max-w-[1280px]',
  wide: 'max-w-[1400px]',
}

const toneClassNames: Record<string, string> = {
  panel: 'bg-white',
  hero: 'bg-[#FEFAEF]',
  navy: 'bg-[#1A1A1A] text-white',
  cream: 'bg-[#FEFAEF]',
  ivory: 'bg-[#FFFAE2]',
  gold: 'bg-[#FED609]',
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

  return (
    <Tag id={id} className={clsx('w-full', toneClassNames[tone], className)}>
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        <div
          className={clsx(
            'mx-auto w-full',
            containerWidths[size],
            padded ? 'py-16 md:py-24' : undefined,
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </Tag>
  )
}
