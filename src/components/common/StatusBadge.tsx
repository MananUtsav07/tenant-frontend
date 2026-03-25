import clsx from 'clsx'
import { Circle } from 'lucide-react'

type StatusBadgeProps = {
  status: string
}

const statusClass: Record<string, string> = {
  open: 'border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.08)] text-[#92750A]',
  in_progress: 'border-sky-500/20 bg-sky-50 text-sky-700',
  resolved: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  closed: 'border-[rgba(0,0,0,0.08)] bg-gray-50 text-[#6B7280]',
  pending: 'border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.08)] text-[#92750A]',
  paid: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  approved: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  overdue: 'border-red-200 bg-red-50 text-red-700',
  partial: 'border-sky-500/20 bg-sky-50 text-sky-700',
  awaiting_owner_approval: 'border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.08)] text-[#92750A]',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  active: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  inactive: 'border-[rgba(0,0,0,0.08)] bg-gray-50 text-[#6B7280]',
  terminated: 'border-rose-200 bg-rose-50 text-rose-700',
  sent: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
  unread: 'border-sky-500/20 bg-sky-50 text-sky-700',
  read: 'border-[rgba(0,0,0,0.08)] bg-gray-50 text-[#6B7280]',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replaceAll('_', ' ')

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
        statusClass[status] ?? 'border-[rgba(0,0,0,0.08)] bg-gray-50 text-[#6B7280]',
      )}
    >
      <Circle className="h-2.5 w-2.5 fill-current stroke-none" />
      {label}
    </span>
  )
}

