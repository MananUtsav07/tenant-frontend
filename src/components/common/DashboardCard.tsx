import type { ReactNode } from 'react'

type DashboardCardProps = {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export function DashboardCard({ label, value, hint }: DashboardCardProps) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-sm font-medium text-[var(--ph-text-muted)]">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[var(--ph-text)]">{value}</p>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-[var(--ph-text-muted)]">{hint}</p> : null}
    </div>
  )
}
