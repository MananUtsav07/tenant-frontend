import clsx from 'clsx'
import type { LabelHTMLAttributes, ReactNode } from 'react'

type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  hidden?: boolean
  required?: boolean
}

type FormFieldProps = {
  label?: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  hideLabel?: boolean
  className?: string
  children: ReactNode
}

export function FormLabel({ children, hidden = false, required = false, className, ...props }: FormLabelProps) {
  return (
    <label
      className={clsx(
        hidden
          ? 'sr-only'
          : 'text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[var(--ph-text-muted)]',
        className,
      )}
      {...props}
    >
      {children}
      {required && !hidden ? <span className="ml-1 text-[var(--ph-accent)]">*</span> : null}
    </label>
  )
}

export function FormHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx('text-xs leading-relaxed text-[var(--ph-text-muted)]', className)}>{children}</p>
}

export function FormError({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx('text-xs leading-relaxed text-red-200', className)}>{children}</p>
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  hideLabel = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={clsx('grid gap-2.5', className)}>
      {label ? (
        <FormLabel htmlFor={htmlFor} hidden={hideLabel} required={required}>
          {label}
        </FormLabel>
      ) : null}
      {children}
      {hint ? <FormHint>{hint}</FormHint> : null}
      {error ? <FormError>{error}</FormError> : null}
    </div>
  )
}
