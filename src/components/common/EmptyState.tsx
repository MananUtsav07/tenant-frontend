import type { ReactNode } from 'react'

import { Inbox } from 'lucide-react'

import { Button } from './Button'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ title, description, icon, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#272839] bg-[#101114] p-8 text-center shadow-sm">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4E79FF]/25 bg-[#4E79FF]/10 text-[#4E79FF]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="mt-4 text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#8D8D96]">{description}</p>
      {actionLabel && actionHref ? (
        <Button to={actionHref} variant="outline" size="sm" className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button type="button" onClick={onAction} variant="outline" size="sm" className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
