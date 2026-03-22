import clsx from 'clsx'

export type AutomationDisplayStatus =
  | 'success'
  | 'failed'
  | 'partial'
  | 'skipped'
  | 'cancelled'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'healthy'
  | 'attention'
  | 'idle'

const statusTheme: Record<AutomationDisplayStatus, string> = {
  success: 'border-[rgba(139,208,181,0.26)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]',
  succeeded: 'border-[rgba(139,208,181,0.26)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]',
  healthy: 'border-[rgba(139,208,181,0.26)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]',
  failed: 'border-[rgba(244,163,163,0.28)] bg-[rgba(120,28,28,0.18)] text-red-200',
  attention: 'border-[rgba(244,163,163,0.28)] bg-[rgba(120,28,28,0.18)] text-red-200',
  partial: 'border-[rgba(240,163,35,0.28)] bg-[rgba(120,80,20,0.18)] text-[#f1cb85]',
  queued: 'border-[rgba(83,88,100,0.44)] bg-white/[0.04] text-[var(--ph-text-soft)]',
  running: 'border-[rgba(107,155,255,0.28)] bg-[rgba(32,64,126,0.18)] text-sky-200',
  skipped: 'border-[rgba(83,88,100,0.44)] bg-white/[0.04] text-[var(--ph-text-soft)]',
  cancelled: 'border-[rgba(83,88,100,0.44)] bg-white/[0.04] text-[var(--ph-text-soft)]',
  idle: 'border-[rgba(83,88,100,0.44)] bg-white/[0.04] text-[var(--ph-text-soft)]',
}

function formatStatusLabel(status: string) {
  return status.replaceAll('_', ' ')
}

export function AutomationStatusBadge({
  status,
  label,
  className,
}: {
  status: AutomationDisplayStatus
  label?: string
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        statusTheme[status],
        className,
      )}
    >
      {label ?? formatStatusLabel(status)}
    </span>
  )
}
