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
      ? 'border-[rgba(0,0,0,0.12)] bg-[#FFFAE2] text-[#1A1A1A] focus:border-[#FED609] focus:ring-2 focus:ring-[rgba(254,214,9,0.2)]'
      : 'border-[rgba(0,0,0,0.12)] bg-white text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#FED609] focus:ring-2 focus:ring-[rgba(254,214,9,0.2)]',
  )
  const labelClassName = clsx(
    'text-sm font-medium',
    variant === 'dark' ? 'text-[#4B5563]' : 'text-[#6B7280]',
  )
  const errorClassName = 'text-xs text-red-600'

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


