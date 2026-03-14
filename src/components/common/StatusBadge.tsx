import clsx from 'clsx'
import { Circle } from 'lucide-react'

type StatusBadgeProps = {
  status: string
}

const statusClass: Record<string, string> = {
  open: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  in_progress: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  resolved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  closed: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  pending: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  paid: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  overdue: 'border-red-500/26 bg-red-500/10 text-red-200',
  partial: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  awaiting_owner_approval: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  rejected: 'border-rose-500/26 bg-rose-500/10 text-rose-200',
  active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  inactive: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  terminated: 'border-rose-500/26 bg-rose-500/10 text-rose-200',
  sent: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  failed: 'border-red-500/26 bg-red-500/10 text-red-200',
  unread: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  read: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replaceAll('_', ' ')

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
        statusClass[status] ?? 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
      )}
    >
      <Circle className="h-2.5 w-2.5 fill-current stroke-none" />
      {label}
    </span>
  )
}

