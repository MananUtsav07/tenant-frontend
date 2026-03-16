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
    <div className="rounded-[1.6rem] border border-[rgba(83,88,100,0.38)] bg-[linear-gradient(180deg,rgba(17,22,35,0.88),rgba(11,16,27,0.94))] p-8 text-center shadow-[0_16px_38px_-34px_rgba(0,0,0,0.72)] backdrop-blur sm:p-10">
      <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="ph-title mt-5 text-lg font-semibold text-[var(--ph-text)]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--ph-text-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Button to={actionHref} variant="outline" size="sm" className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button type="button" onClick={onAction} variant="outline" size="sm" className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

