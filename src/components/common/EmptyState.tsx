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
    <div className="rounded-xl border border-[rgba(83,88,100,0.24)] bg-[rgba(17,22,35,0.88)] p-8 text-center sm:p-10">
      <div className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(240,163,35,0.14)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
        {icon ?? <Inbox className="h-4 w-4" />}
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
