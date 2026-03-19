import type { ReactNode } from 'react'

type DashboardCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function DashboardCard({ label, value, hint, icon }: DashboardCardProps) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">{label}</p>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ph-text)] sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-[var(--ph-text-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(240,163,35,0.14)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  )
}
