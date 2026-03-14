import { ChevronDown } from 'lucide-react'
import type { ReactNode, SelectHTMLAttributes } from 'react'

import { FormField } from './FormField'
import { getDashboardControlClassName } from './formTheme'

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  hideLabel?: boolean
  wrapperClassName?: string
}

export function FormSelect({
  label,
  hint,
  error,
  hideLabel = false,
  wrapperClassName,
  className,
  id,
  required,
  children,
  ...rest
}: FormSelectProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={id}
          required={required}
          className={getDashboardControlClassName('ph-form-select', className, {
            hasTrailingAdornment: true,
          })}
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[var(--ph-text-muted)]">
          <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    </FormField>
  )
}
