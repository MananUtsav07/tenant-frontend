import type { AutomationError } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AutomationFailurePanel({
  failures,
  title = 'Recent failures',
  description = 'The latest captured automation errors.',
}: {
  failures: AutomationError[]
  title?: string
  description?: string
}) {
  return (
    <article className="ph-form-panel rounded-xl p-5 sm:p-6">
      <div>
        <h3 className="text-xl font-semibold text-[var(--ph-text)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {failures.length === 0 ? (
          <div className="rounded-lg border border-[rgba(83,88,100,0.32)] bg-[rgba(255,255,255,0.02)] px-4 py-5">
            <p className="text-sm font-medium text-[var(--ph-text)]">No recent failures</p>
            <p className="mt-1 text-sm text-[var(--ph-text-muted)]">Captured automation errors will appear here if a handler or delivery step fails.</p>
          </div>
        ) : (
          failures.map((failure) => (
            <div
              key={failure.id}
              className="rounded-lg border border-[rgba(244,163,163,0.22)] bg-[rgba(120,28,28,0.14)] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ph-text)]">{failure.flow_name.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-red-200">{failure.error_message}</p>
                </div>
                <p className="text-xs text-[var(--ph-text-muted)]">{formatDateTime(failure.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  )
}
