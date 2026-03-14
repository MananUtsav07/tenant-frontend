import clsx from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  error?: string
  variant?: 'dark' | 'light'
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
      ? 'border-[rgba(83,88,100,0.56)] bg-[rgba(11,22,51,0.62)] text-[var(--ph-text)] focus:border-[rgba(240,163,35,0.72)] focus:ring-2 focus:ring-[rgba(240,163,35,0.18)]'
      : 'border-[rgba(83,88,100,0.56)] bg-[rgba(255,255,255,0.03)] text-[var(--ph-text)] shadow-[0_10px_24px_-22px_rgba(0,0,0,0.45)] focus:border-[rgba(240,163,35,0.72)] focus:ring-2 focus:ring-[rgba(240,163,35,0.18)]',
  )
  const labelClassName = clsx(
    'text-sm font-medium',
    variant === 'dark' ? 'text-[var(--ph-text-soft)]' : 'text-[var(--ph-text-muted)]',
  )
  const errorClassName = 'text-xs text-red-300'

  return (
    <label className="block space-y-2">
      <span className={labelClassName}>{label}</span>
      {props.as === 'textarea' ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={clsx(inputClassName, (rest as TextareaHTMLAttributes<HTMLTextAreaElement>).className)}
        />
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          className={clsx(inputClassName, (rest as InputHTMLAttributes<HTMLInputElement>).className)}
        />
      )}
      {error ? <span className={errorClassName}>{error}</span> : null}
    </label>
  )
}


