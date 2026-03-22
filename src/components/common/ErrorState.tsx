import { AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export function ErrorState({ message, variant = 'light' }: { message: string; variant?: 'dark' | 'light' }) {
  return (
    <div
      className={clsx(
        'rounded-xl border p-4 text-sm',
        variant === 'light'
          ? 'border-red-500/30 bg-red-950/30 text-red-200 shadow-[0_12px_26px_-24px_rgba(239,68,68,0.82)]'
          : 'border-red-500/28 bg-red-950/32 text-red-200',
      )}
    >
      <p className="inline-flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  )
}
