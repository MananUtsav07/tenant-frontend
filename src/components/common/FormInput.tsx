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
      ? 'border-slate-700 bg-slate-900/90 text-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30'
      : 'border-slate-300 bg-white text-slate-900 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.35)] focus:border-blue-400 focus:ring-2 focus:ring-blue-300/50',
  )
  const labelClassName = clsx('text-sm font-medium', variant === 'dark' ? 'text-slate-300' : 'text-slate-600')
  const errorClassName = variant === 'dark' ? 'text-xs text-red-400' : 'text-xs text-red-600'

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


