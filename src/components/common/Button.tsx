import clsx from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, type LinkProps } from 'react-router-dom'

import { trackEvent, type AnalyticsUserType } from '../../utils/analytics'
import { useMotionEnabled } from '../../utils/motion'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'
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
    'border border-[rgba(240,163,35,0.28)] bg-[linear-gradient(180deg,#f3ae35_0%,#e39b1d_100%)] text-[#191108] shadow-[0_4px_12px_rgba(240,163,35,0.3)] hover:border-[#f6c26f] hover:shadow-[0_6px_16px_rgba(240,163,35,0.35)] active:translate-y-px',
  secondary:
    'border border-[rgba(83,88,100,0.38)] bg-[rgba(26,34,56,0.95)] text-[var(--ph-text)] shadow-[0_1px_3px_rgba(0,0,0,0.24)] hover:border-[rgba(151,105,34,0.38)] hover:bg-[rgba(31,40,66,0.95)]',
  outline:
    'border border-[rgba(240,163,35,0.28)] bg-[rgba(240,163,35,0.06)] text-[#f6d9a1] hover:bg-[rgba(240,163,35,0.1)] hover:text-[#fff1d5]',
  ghost: 'bg-transparent text-[var(--ph-text-muted)] hover:bg-white/5 hover:text-[var(--ph-text)] active:bg-white/[0.07]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm sm:text-base',
}

function buttonClassName(variant: Variant, size: Size, className?: string) {
  return clsx(
    'group inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[0.01em] ring-offset-[var(--ph-bg)] transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[rgba(240,163,35,0.72)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
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
  const motionProps = motionEnabled ? { whileHover: { y: -1 }, whileTap: { y: 0, scale: 0.99 } } : undefined

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

