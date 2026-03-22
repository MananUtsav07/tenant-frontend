import { CheckCircle2, ClipboardCheck, Hammer, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../common/Button'
import { ErrorState } from '../common/ErrorState'
import { FormSelect } from '../common/FormSelect'
import { FormTextarea } from '../common/FormInput'
import { LoadingState } from '../common/LoadingState'
import { StatusBadge } from '../common/StatusBadge'
import { dashboardFormPanelClassName } from '../common/formTheme'
import { api } from '../../services/api'
import type { TenantMaintenanceWorkflowOverview } from '../../types/api'
import { formatDateTime } from '../../utils/date'

type Props = {
  token: string
  ticketId: string
  onWorkflowChanged?: () => Promise<void> | void
}

export function MaintenanceWorkflowTenantPanel({ token, ticketId, onWorkflowChanged }: Props) {
  const [maintenance, setMaintenance] = useState<TenantMaintenanceWorkflowOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resolved, setResolved] = useState<'yes' | 'no'>('yes')
  const [feedbackRating, setFeedbackRating] = useState('5')
  const [feedbackNote, setFeedbackNote] = useState('')

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getTenantTicketMaintenanceWorkflow(token, ticketId)
      setMaintenance(response.maintenance)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load maintenance workflow')
    } finally {
      setLoading(false)
    }
  }, [ticketId, token])

  useEffect(() => {
    void loadMaintenance()
  }, [loadMaintenance])

  const workflow = maintenance?.workflow ?? null
  const assignment = workflow?.assignment ?? null
  const contractorName = assignment?.contractor?.company_name ?? 'Assigned contractor'

  const needsConfirmation = useMemo(() => {
    return workflow?.workflow_status === 'awaiting_tenant_confirmation' || assignment?.booking_status === 'completed' || assignment?.booking_status === 'follow_up_required'
  }, [assignment?.booking_status, workflow?.workflow_status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy(true)
      await api.confirmTenantMaintenanceCompletion(token, ticketId, {
        resolved: resolved === 'yes',
        feedback_rating: resolved === 'yes' ? Number(feedbackRating) : undefined,
        feedback_note: feedbackNote || undefined,
      })
      setFeedbackNote('')
      await loadMaintenance()
      await onWorkflowChanged?.()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit maintenance confirmation')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading maintenance status..." rows={3} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!maintenance || !workflow) {
    return null
  }

  return (
    <div className="space-y-4">
      <article className="ph-surface-card rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3d49a]">
              <Hammer className="h-3.5 w-3.5" />
              Maintenance Workflow
            </div>
            <h3 className="ph-title mt-4 text-xl font-semibold text-[var(--ph-text)]">Contractor progress</h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Track categorization, approved contractor, appointment timing, and completion in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={workflow.workflow_status} />
            <StatusBadge status={workflow.urgency} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Category</p>
            <p className="mt-2 font-semibold text-[var(--ph-text)]">{workflow.category.replaceAll('_', ' ')}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Contractor</p>
            <p className="mt-2 font-semibold text-[var(--ph-text)]">{contractorName}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Appointment</p>
            <p className="mt-2 font-semibold text-[var(--ph-text)]">{assignment?.appointment_start_at ? formatDateTime(assignment.appointment_start_at) : 'Not scheduled yet'}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Completion</p>
            <p className="mt-2 font-semibold text-[var(--ph-text)]">{assignment?.completed_at ? formatDateTime(assignment.completed_at) : 'Awaiting contractor update'}</p>
          </div>
        </div>

        {assignment?.appointment_notes ? <p className="mt-4 text-sm text-[var(--ph-text-muted)]">Appointment notes: {assignment.appointment_notes}</p> : null}
        {assignment?.completion_notes ? <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Completion notes: {assignment.completion_notes}</p> : null}
      </article>

      {needsConfirmation ? (
        <form onSubmit={handleSubmit} className={`${dashboardFormPanelClassName} space-y-4`}>
          <div className="flex items-center gap-2 text-[var(--ph-text)]"><ClipboardCheck className="h-4 w-4 text-[var(--ph-accent)]" /><span className="font-semibold">Confirm the contractor outcome</span></div>
          <FormSelect label="Was the issue resolved?" value={resolved} onChange={(event) => setResolved(event.target.value as 'yes' | 'no')}>
            <option value="yes">Yes, everything is resolved</option>
            <option value="no">No, the issue still needs follow-up</option>
          </FormSelect>
          {resolved === 'yes' ? (
            <FormSelect label="Rating" value={feedbackRating} onChange={(event) => setFeedbackRating(event.target.value)}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Fair</option>
              <option value="2">2 - Needs improvement</option>
              <option value="1">1 - Poor</option>
            </FormSelect>
          ) : null}
          <FormTextarea
            label={resolved === 'yes' ? 'Optional feedback note' : 'What still needs to be fixed?'}
            rows={3}
            value={feedbackNote}
            onChange={(event) => setFeedbackNote(event.target.value)}
            placeholder={resolved === 'yes' ? 'Share any note about the completed visit.' : 'Describe what still needs attention so the property team can follow up.'}
          />
          <Button type="submit" disabled={busy}>{busy ? 'Submitting...' : resolved === 'yes' ? 'Confirm completion' : 'Request follow-up'}</Button>
        </form>
      ) : (
        <article className={`${dashboardFormPanelClassName} flex items-start gap-3`}>
          {assignment?.tenant_confirmed_at ? <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /> : <TriangleAlert className="mt-1 h-4 w-4 text-[#f3d49a]" />}
          <p className="text-sm text-[var(--ph-text-muted)]">
            {assignment?.tenant_confirmed_at
              ? 'You have already confirmed this contractor visit. The property team can now close the ticket when ready.'
              : 'The property team will update this panel when the contractor visit is scheduled or marked complete.'}
          </p>
        </article>
      )}
    </div>
  )
}
