import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

import { FormField } from './FormField'
import { getDashboardControlClassName } from './formTheme'

type BaseProps = {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  hideLabel?: boolean
  variant?: 'default' | 'light'
  leadingIcon?: ReactNode
  trailingAdornment?: ReactNode
  wrapperClassName?: string
}

type InputProps = BaseProps & {
  as?: 'input'
} & InputHTMLAttributes<HTMLInputElement>

type TextareaProps = BaseProps & {
  as: 'textarea'
} & TextareaHTMLAttributes<HTMLTextAreaElement>

type FormInputProps = InputProps | TextareaProps

export function FormInput(props: FormInputProps) {
  const {
    label,
    hint,
    error,
    hideLabel = false,
    variant = 'default',
    leadingIcon,
    trailingAdornment,
    wrapperClassName,
    id,
    required,
    ...rest
  } = props

  const hasLeadingIcon = Boolean(leadingIcon)
  const hasTrailingAdornment = Boolean(trailingAdornment)

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
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-[var(--ph-text-muted)]">
            {leadingIcon}
          </span>
        ) : null}

        {props.as === 'textarea' ? (
          <textarea
            id={id}
            required={required}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={getDashboardControlClassName(
              'ph-form-textarea',
              (rest as TextareaHTMLAttributes<HTMLTextAreaElement>).className,
              {
                variant,
                hasLeadingIcon,
                hasTrailingAdornment,
              },
            )}
          />
        ) : (
          <input
            id={id}
            required={required}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            className={getDashboardControlClassName(
              'ph-form-control',
              (rest as InputHTMLAttributes<HTMLInputElement>).className,
              {
                variant,
                hasLeadingIcon,
                hasTrailingAdornment,
              },
            )}
          />
        )}

        {trailingAdornment ? (
          <span className="absolute inset-y-0 right-4 inline-flex items-center text-[var(--ph-text-muted)]">
            {trailingAdornment}
          </span>
        ) : null}
      </div>
    </FormField>
  )
}

type FormTextareaProps = Omit<TextareaProps, 'as'>

export function FormTextarea(props: FormTextareaProps) {
  return <FormInput as="textarea" {...props} />
}
