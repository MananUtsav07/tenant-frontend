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
    <div className="rounded-[1.75rem] border border-dashed border-[rgba(83,88,100,0.58)] bg-[rgba(255,255,255,0.02)] p-8 text-center shadow-[0_18px_46px_-38px_rgba(0,0,0,0.72)] backdrop-blur">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[var(--ph-accent)]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="ph-title mt-4 text-lg font-semibold text-[var(--ph-text)]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--ph-text-muted)]">{description}</p>
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

