import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, type LinkProps } from 'react-router-dom'

import { trackEvent, type AnalyticsUserType } from '../../utils/analytics'
import { useMotionEnabled } from '../../utils/motion'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'telegram' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type SharedProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  analyticsEvent?: string
  analyticsUserType?: AnalyticsUserType
  analyticsMetadata?: Record<string, unknown>
}

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never
  }

type ButtonAsLink = SharedProps &
  Omit<LinkProps, 'to' | 'className' | 'children'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    to: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

function isLinkButton(props: ButtonProps): props is ButtonAsLink {
  return typeof (props as ButtonAsLink).to === 'string'
}

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-[#FFD70B] bg-[#FED609] text-[#1A1A1A] shadow-[0_2px_8px_rgba(254,214,9,0.3)] hover:bg-[#FFD70B] hover:shadow-[0_4px_16px_rgba(254,214,9,0.35)] active:translate-y-px',
  secondary:
    'border border-[rgba(0,0,0,0.1)] bg-white text-[#1A1A1A] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[rgba(254,214,9,0.4)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
  outline:
    'border border-[#FED609] bg-transparent text-[#92700A] hover:bg-[rgba(254,214,9,0.06)] hover:text-[#1A1A1A]',
  ghost:
    'bg-transparent text-[var(--ph-text-muted)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[var(--ph-text)] active:bg-[rgba(0,0,0,0.06)]',
  whatsapp:
    'border border-[#25D366] bg-[#25D366] text-white shadow-[0_2px_8px_rgba(37,211,102,0.25)] hover:bg-[#20BD5A] active:translate-y-px',
  telegram:
    'border border-[#0088cc] bg-[#0088cc] text-white shadow-[0_2px_8px_rgba(0,136,204,0.25)] hover:bg-[#0077b5] active:translate-y-px',
  danger:
    'border border-[#EF4444] bg-transparent text-[#EF4444] hover:bg-[rgba(239,68,68,0.06)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm sm:text-base',
}

function buttonClassName(variant: Variant, size: Size, className?: string) {
  return clsx(
    'group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] ring-offset-[var(--ph-bg)] transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[rgba(254,214,9,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className,
    iconLeft,
    iconRight,
    analyticsEvent,
    analyticsUserType,
    analyticsMetadata,
    ...rawProps
  } = props

  const classes = buttonClassName(variant, size, className)
  const motionEnabled = useMotionEnabled()
  const motionProps = motionEnabled ? { whileHover: { y: -2 }, whileTap: { y: 0, scale: 0.985 } } : undefined

  const content = (
    <>
      {iconLeft ? <span className="text-current/90">{iconLeft}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="text-current/90 transition-transform group-hover:translate-x-0.5">{iconRight}</span> : null}
    </>
  )

  const recordAnalytics = () => {
    if (!analyticsEvent) {
      return
    }

    trackEvent(analyticsEvent, {
      user_type: analyticsUserType,
      metadata: analyticsMetadata,
    })
  }

  if (isLinkButton(props)) {
    const { to, ...linkProps } = rawProps as Omit<ButtonAsLink, keyof SharedProps>
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      recordAnalytics()
      linkProps.onClick?.(event)
    }

    return (
      <motion.span className="inline-flex" {...motionProps}>
        <Link to={to} className={classes} {...linkProps} onClick={handleClick}>
          {content}
        </Link>
      </motion.span>
    )
  }

  const buttonProps = rawProps as ButtonHTMLAttributes<HTMLButtonElement>
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    recordAnalytics()
    buttonProps.onClick?.(event)
  }

  return (
    <motion.span className="inline-flex" {...motionProps}>
      <button className={classes} {...buttonProps} onClick={handleClick}>
        {content}
      </button>
    </motion.span>
  )
}
