import { AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export function ErrorState({ message, variant = 'light' }: { message: string; variant?: 'dark' | 'light' }) {
  return (
    <div
      className={clsx(
        'rounded-xl border p-4 text-sm',
        variant === 'light'
          ? 'border-red-200 bg-red-50 text-red-700 shadow-sm'
          : 'border-red-200 bg-red-50/80 text-red-700',
      )}
    >
      <p className="inline-flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  )
}
