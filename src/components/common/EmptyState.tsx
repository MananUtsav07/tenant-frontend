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
    <div className="rounded-xl border border-dashed border-[rgba(0,0,0,0.12)] bg-white p-8 text-center shadow-sm">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(254,214,9,0.25)] bg-[rgba(254,214,9,0.1)] text-[#D4A800]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="mt-4 text-lg font-semibold text-[#1A1A1A]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#6B7280]">{description}</p>
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
