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
    <div className="py-16 text-center">
      <div className="mx-auto inline-flex h-8 w-8 items-center justify-center text-[var(--ph-text-muted)]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="ph-title mt-4 text-base font-semibold text-[var(--ph-text)]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
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
