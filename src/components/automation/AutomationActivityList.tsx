import type { ReactNode } from 'react'

import { AutomationStatusBadge, type AutomationDisplayStatus } from './AutomationStatusBadge'

export function AutomationActivityList({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string
  description: string
  items: Array<{
    id: string
    title: string
    summary: string
    timestamp: string
    meta?: ReactNode
    status?: AutomationDisplayStatus
    statusLabel?: string
  }>
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <article className="ph-form-panel rounded-xl p-5 sm:p-6">
      <div>
        <h3 className="text-xl font-semibold text-[var(--ph-text)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-[rgba(83,88,100,0.32)] bg-[rgba(255,255,255,0.02)] px-4 py-5">
            <p className="text-sm font-medium text-[var(--ph-text)]">{emptyTitle}</p>
            <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{emptyDescription}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[rgba(83,88,100,0.36)] bg-white/[0.03] px-4 py-4 shadow-[0_18px_38px_-32px_rgba(0,0,0,0.72)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--ph-text)]">{item.title}</p>
                    {item.status ? <AutomationStatusBadge status={item.status} label={item.statusLabel} /> : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-soft)]">{item.summary}</p>
                  {item.meta ? <div className="mt-2 text-xs text-[var(--ph-text-muted)]">{item.meta}</div> : null}
                </div>
                <p className="text-xs text-[var(--ph-text-muted)]">{item.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}
