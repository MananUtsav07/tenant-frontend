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
  triaged: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  quote_collection: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  owner_review: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  assigned: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  scheduled: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  awaiting_tenant_confirmation: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  completed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  cancelled: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  follow_up_required: 'border-rose-500/26 bg-rose-500/10 text-rose-200',
  emergency: 'border-red-500/26 bg-red-500/10 text-red-200',
  urgent: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  standard: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  amber: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  red: 'border-red-500/26 bg-red-500/10 text-red-200',
  unscored: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  verified: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  submitted: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  not_provided: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  in_review: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  viewing: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  lease_prep: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  withdrawn: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  pre_vacant: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  vacant: 'border-rose-500/26 bg-rose-500/10 text-rose-200',
  relisting_in_progress: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  listed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  leased: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  pending_approval: 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]',
  not_configured: 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]',
  queued: 'border-sky-400/18 bg-sky-400/10 text-sky-200',
  published: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
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

