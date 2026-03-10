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
    'border border-blue-600 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_18px_36px_-20px_rgba(37,99,235,0.72)] hover:border-blue-500 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-700',
  secondary:
    'border border-slate-300 bg-gradient-to-b from-white to-slate-50 text-slate-700 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.3)] hover:border-slate-400 hover:from-slate-50 hover:to-slate-100 active:from-slate-100 active:to-slate-100',
  outline:
    'border border-blue-200 bg-white text-blue-700 shadow-[0_10px_24px_-22px_rgba(37,99,235,0.45)] hover:border-blue-300 hover:bg-blue-50/80 active:bg-blue-100/80',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

function buttonClassName(variant: Variant, size: Size, className?: string) {
  return clsx(
    'group inline-flex items-center justify-center gap-2 rounded-xl font-semibold ring-offset-white transition duration-200 focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
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

