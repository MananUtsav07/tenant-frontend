import clsx from 'clsx'
import { Circle } from 'lucide-react'

type StatusBadgeProps = {
  status: string
}

const statusClass: Record<string, string> = {
  open: 'border-[rgba(235,207,66,0.3)] bg-[rgba(235,207,66,0.08)] text-[#EBCF42]',
  in_progress: 'border-[rgba(78,121,255,0.3)] bg-[rgba(78,121,255,0.08)] text-[#4E79FF]',
  resolved: 'border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] text-[#32C382]',
  closed: 'border-[#272839] bg-[rgba(141,141,150,0.08)] text-[#8D8D96]',
  pending: 'border-[rgba(235,207,66,0.3)] bg-[rgba(235,207,66,0.08)] text-[#EBCF42]',
  paid: 'border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] text-[#32C382]',
  approved: 'border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] text-[#32C382]',
  overdue: 'border-[rgba(242,84,97,0.3)] bg-[rgba(242,84,97,0.08)] text-[#F25461]',
  partial: 'border-[rgba(78,121,255,0.3)] bg-[rgba(78,121,255,0.08)] text-[#4E79FF]',
  awaiting_owner_approval: 'border-[rgba(235,207,66,0.3)] bg-[rgba(235,207,66,0.08)] text-[#EBCF42]',
  rejected: 'border-[rgba(242,84,97,0.3)] bg-[rgba(242,84,97,0.08)] text-[#F25461]',
  active: 'border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] text-[#32C382]',
  inactive: 'border-[#272839] bg-[rgba(141,141,150,0.08)] text-[#8D8D96]',
  terminated: 'border-[rgba(242,84,97,0.3)] bg-[rgba(242,84,97,0.08)] text-[#F25461]',
  sent: 'border-[rgba(50,195,130,0.3)] bg-[rgba(50,195,130,0.08)] text-[#32C382]',
  failed: 'border-[rgba(242,84,97,0.3)] bg-[rgba(242,84,97,0.08)] text-[#F25461]',
  unread: 'border-[rgba(78,121,255,0.3)] bg-[rgba(78,121,255,0.08)] text-[#4E79FF]',
  read: 'border-[#272839] bg-[rgba(141,141,150,0.08)] text-[#8D8D96]',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.replaceAll('_', ' ')

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
        statusClass[status] ?? 'border-[#272839] bg-[rgba(141,141,150,0.08)] text-[#8D8D96]',
      )}
    >
      <Circle className="h-2.5 w-2.5 fill-current stroke-none" />
      {label}
    </span>
  )
}

