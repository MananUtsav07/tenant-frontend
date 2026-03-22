import clsx from 'clsx'
import type { ReactNode } from 'react'

type FormToggleProps = {
  label: ReactNode
  description?: ReactNode
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
}

export function FormToggle({
  label,
  description,
  checked,
  onToggle,
  disabled = false,
  className,
}: FormToggleProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-[rgba(83,88,100,0.42)] bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_16px_36px_-30px_rgba(0,0,0,0.72)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--ph-text)]">{label}</p>
          {description ? <p className="text-xs leading-relaxed text-[var(--ph-text-muted)]">{description}</p> : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={onToggle}
          disabled={disabled}
          className={clsx(
            'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(240,163,35,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ph-bg-deep)]',
            checked
              ? 'border-[rgba(240,163,35,0.42)] bg-[linear-gradient(180deg,rgba(240,163,35,0.34),rgba(151,105,34,0.82))] shadow-[0_12px_24px_-18px_rgba(240,163,35,0.52)]'
              : 'border-[rgba(83,88,100,0.52)] bg-[rgba(11,22,51,0.72)]',
            disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-[rgba(151,105,34,0.42)]',
          )}
        >
          <span
            className={clsx(
              'inline-block h-5 w-5 transform rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(238,239,240,0.96),rgba(197,203,213,0.9))] shadow-[0_10px_22px_-16px_rgba(0,0,0,0.92)] transition duration-200',
              checked ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>
    </div>
  )
}
