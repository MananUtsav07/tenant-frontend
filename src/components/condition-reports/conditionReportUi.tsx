import type { ConditionReportOverview } from '../../types/api'

export function conditionReportTypeLabel(reportType: ConditionReportOverview['report_type']) {
  return reportType === 'move_in' ? 'Move-in' : 'Move-out'
}

export function conditionReportWorkflowChipClassName(status: ConditionReportOverview['workflow_status']) {
  switch (status) {
    case 'confirmed':
      return 'border-[rgba(139,208,181,0.24)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]'
    case 'confirmation_in_progress':
    case 'ready_for_confirmation':
      return 'border-[rgba(240,163,35,0.26)] bg-[rgba(120,80,20,0.16)] text-[#f1cb85]'
    case 'cancelled':
      return 'border-[rgba(244,163,163,0.26)] bg-[rgba(120,28,28,0.18)] text-red-200'
    default:
      return 'border-[rgba(83,88,100,0.46)] bg-[rgba(255,255,255,0.04)] text-[var(--ph-text-soft)]'
  }
}

export function conditionReportComparisonChipClassName(status: ConditionReportOverview['comparison_status']) {
  switch (status) {
    case 'matched':
      return 'border-[rgba(139,208,181,0.24)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]'
    case 'changes_detected':
      return 'border-[rgba(244,163,163,0.26)] bg-[rgba(120,28,28,0.18)] text-red-200'
    case 'pending_review':
    case 'baseline_missing':
      return 'border-[rgba(240,163,35,0.26)] bg-[rgba(120,80,20,0.16)] text-[#f1cb85]'
    default:
      return 'border-[rgba(83,88,100,0.46)] bg-[rgba(255,255,255,0.04)] text-[var(--ph-text-soft)]'
  }
}

export function conditionReportConfirmationChipClassName(status: ConditionReportOverview['owner_confirmation_status']) {
  switch (status) {
    case 'confirmed':
      return 'border-[rgba(139,208,181,0.24)] bg-[rgba(22,101,52,0.18)] text-[var(--ph-success)]'
    case 'disputed':
      return 'border-[rgba(244,163,163,0.26)] bg-[rgba(120,28,28,0.18)] text-red-200'
    default:
      return 'border-[rgba(83,88,100,0.46)] bg-[rgba(255,255,255,0.04)] text-[var(--ph-text-soft)]'
  }
}

export function conditionReportChipClassName(base: string) {
  return `inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${base}`
}
