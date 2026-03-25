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
  const { label, error, variant = 'light', ...rest } = props

  const inputClassName = clsx(
    'w-full rounded-xl border px-3 py-2.5 outline-none transition duration-150',
    variant === 'dark'
      ? 'border-[rgba(0,0,0,0.12)] bg-[#FFFAE2] text-[#1A1A1A] focus:border-[#FED609] focus:ring-2 focus:ring-[rgba(254,214,9,0.2)]'
      : 'border-[rgba(0,0,0,0.12)] bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#FED609] focus:ring-2 focus:ring-[rgba(254,214,9,0.2)]',
  )
  const labelClassName = clsx(
    'text-sm font-medium',
    variant === 'dark' ? 'text-[#4B5563]' : 'text-[#6B7280]',
  )
  const errorClassName = 'text-xs text-red-600'

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
