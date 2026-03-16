import clsx from 'clsx'
import { Circle } from 'lucide-react'

type StatusBadgeProps = {
  status: string
}

const mutedGold = 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.1)] text-[#f3d49a]'
const mutedSlate = 'border-[rgba(140,154,182,0.24)] bg-[rgba(140,154,182,0.1)] text-[#d8deea]'
const mutedGreen = 'border-[rgba(139,208,181,0.22)] bg-[rgba(139,208,181,0.1)] text-[#cfeede]'
const mutedGray = 'border-[rgba(83,88,100,0.42)] bg-white/5 text-[var(--ph-text-soft)]'
const mutedRed = 'border-[rgba(244,163,163,0.24)] bg-[rgba(244,163,163,0.1)] text-[#f8d2d2]'

const statusClass: Record<string, string> = {
  open: mutedGold,
  in_progress: mutedSlate,
  resolved: mutedGreen,
  closed: mutedGray,
  pending: mutedGold,
  paid: mutedGreen,
  approved: mutedGreen,
  overdue: mutedRed,
  partial: mutedSlate,
  awaiting_owner_approval: mutedGold,
  rejected: mutedRed,
  active: mutedGreen,
  inactive: mutedGray,
  terminated: mutedRed,
  sent: mutedGreen,
  failed: mutedRed,
  unread: mutedSlate,
  read: mutedGray,
  triaged: mutedGold,
  quote_collection: mutedSlate,
  owner_review: mutedGold,
  assigned: mutedSlate,
  scheduled: mutedSlate,
  awaiting_tenant_confirmation: mutedGold,
  completed: mutedGreen,
  cancelled: mutedGray,
  follow_up_required: mutedRed,
  emergency: mutedRed,
  urgent: mutedGold,
  standard: mutedSlate,
  green: mutedGreen,
  amber: mutedGold,
  red: mutedRed,
  unscored: mutedGray,
  verified: mutedGreen,
  submitted: mutedSlate,
  not_provided: mutedGray,
  in_review: mutedGold,
  viewing: mutedSlate,
  lease_prep: mutedGreen,
  withdrawn: mutedGray,
  pre_vacant: mutedGold,
  vacant: mutedRed,
  relisting_in_progress: mutedSlate,
  listed: mutedGreen,
  leased: mutedGreen,
  pending_approval: mutedGold,
  not_configured: mutedGray,
  queued: mutedSlate,
  published: mutedGreen,
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

