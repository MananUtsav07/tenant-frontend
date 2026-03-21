import { Clock3, Workflow } from 'lucide-react'

import type { AutomationRun } from '../../types/api'
import { formatDateTime } from '../../utils/date'
import { AutomationStatusBadge } from './AutomationStatusBadge'

function getRunStatus(status: AutomationRun['status']) {
  return status
}

export function AutomationRunTimeline({
  runs,
  emptyTitle = 'No automation runs recorded',
  emptyDescription = 'Run history will appear here once the internal scheduler dispatches work.',
}: {
  runs: AutomationRun[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (runs.length === 0) {
    return (
      <div className="rounded-lg border border-[rgba(83,88,100,0.32)] bg-[rgba(255,255,255,0.02)] px-4 py-5">
        <p className="text-sm font-medium text-[var(--ph-text)]">{emptyTitle}</p>
        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <ol className="space-y-3">
      {runs.map((run) => (
        <li
          key={run.id}
          className="rounded-lg border border-[rgba(83,88,100,0.36)] bg-white/[0.03] px-4 py-4 shadow-[0_18px_38px_-32px_rgba(0,0,0,0.72)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[#f1cb85]">
                <Workflow className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--ph-text)]">{run.flow_name.replaceAll('_', ' ')}</p>
                  <AutomationStatusBadge status={getRunStatus(run.status)} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--ph-text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    Started {formatDateTime(run.started_at)}
                  </span>
                  <span>Processed {run.processed_count}</span>
                  <span>{run.completed_at ? `Completed ${formatDateTime(run.completed_at)}` : 'Still processing'}</span>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
