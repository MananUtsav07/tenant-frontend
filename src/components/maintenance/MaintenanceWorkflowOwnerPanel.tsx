import { AlertTriangle, Hammer } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../common/Button'
import { Collapsible } from '../common/Collapsible'
import { ErrorState } from '../common/ErrorState'
import { FormInput, FormTextarea } from '../common/FormInput'
import { FormSelect } from '../common/FormSelect'
import { LoadingState } from '../common/LoadingState'
import { StatusBadge } from '../common/StatusBadge'
import { api } from '../../services/api'
import type {
  MaintenanceAssignmentStatus,
  MaintenanceCategory,
  MaintenanceUrgency,
  OwnerMaintenanceWorkflowOverview,
} from '../../types/api'
import { formatDateTime } from '../../utils/date'

const categoryOptions: Array<{ value: MaintenanceCategory; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC / AC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'waterproofing', label: 'Waterproofing' },
  { value: 'other', label: 'Other' },
]

const urgencyOptions: Array<{ value: MaintenanceUrgency; label: string }> = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'standard', label: 'Standard' },
]

const assignmentStatuses: MaintenanceAssignmentStatus[] = ['approved', 'scheduled', 'in_progress', 'completed', 'cancelled']

type Props = {
  token: string
  ticketId: string
  onWorkflowChanged?: () => Promise<void> | void
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function toIsoOrUndefined(value: string) {
  if (!value.trim()) {
    return undefined
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function MaintenanceWorkflowOwnerPanel({ token, ticketId, onWorkflowChanged }: Props) {
  const [maintenance, setMaintenance] = useState<OwnerMaintenanceWorkflowOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [triageCategory, setTriageCategory] = useState<MaintenanceCategory>('general')
  const [triageUrgency, setTriageUrgency] = useState<MaintenanceUrgency>('standard')
  const [triageNotes, setTriageNotes] = useState('')
  const [selectedContractorIds, setSelectedContractorIds] = useState<string[]>([])
  const [requestMessage, setRequestMessage] = useState('')
  const [contractorForm, setContractorForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', whatsapp: '', notes: '', specialties: ['general'] as string[] })
  const [quoteForm, setQuoteForm] = useState({ contractor_id: '', amount: '', scope_of_work: '', availability_note: '', estimated_start_at: '', estimated_completion_at: '' })
  const [assignmentForm, setAssignmentForm] = useState({ booking_status: 'scheduled' as MaintenanceAssignmentStatus, appointment_start_at: '', appointment_end_at: '', appointment_notes: '', completion_notes: '' })
  const [openSection, setOpenSection] = useState<string | null>(null)

  const loadMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getOwnerTicketMaintenanceWorkflow(token, ticketId)
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

  useEffect(() => {
    if (!maintenance) {
      return
    }
    setTriageCategory(maintenance.workflow?.category ?? maintenance.suggested_triage.category)
    setTriageUrgency(maintenance.workflow?.urgency ?? maintenance.suggested_triage.urgency)
    setSelectedContractorIds(maintenance.relevant_contractors.slice(0, 3).map((contractor) => contractor.id))
    setQuoteForm((current) => ({
      ...current,
      contractor_id: current.contractor_id || maintenance.relevant_contractors[0]?.id || maintenance.contractors[0]?.id || '',
    }))
    if (maintenance.workflow?.assignment) {
      setAssignmentForm({
        booking_status: maintenance.workflow.assignment.booking_status,
        appointment_start_at: toDateTimeLocal(maintenance.workflow.assignment.appointment_start_at),
        appointment_end_at: toDateTimeLocal(maintenance.workflow.assignment.appointment_end_at),
        appointment_notes: maintenance.workflow.assignment.appointment_notes ?? '',
        completion_notes: maintenance.workflow.assignment.completion_notes ?? '',
      })
    }
  }, [maintenance])

  useEffect(() => {
    if (!maintenance) {
      setOpenSection('triage')
      return
    }
    if (!maintenance.workflow) {
      setOpenSection('triage')
    } else if (maintenance.workflow.assignment) {
      setOpenSection('assignment')
    } else if (maintenance.workflow.quotes.length > 0) {
      setOpenSection('quote-comparison')
    } else {
      setOpenSection('request-quotes')
    }
  }, [maintenance])

  const toggleSection = (key: string) => {
    setOpenSection((current) => (current === key ? null : key))
  }

  const refreshAll = useCallback(async () => {
    await loadMaintenance()
    await onWorkflowChanged?.()
  }, [loadMaintenance, onWorkflowChanged])

  const contractorChoices = maintenance?.relevant_contractors.length ? maintenance.relevant_contractors : maintenance?.contractors ?? []
  const workflow = maintenance?.workflow ?? null

  const handleTriage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy('triage')
      await api.triageOwnerTicketMaintenanceWorkflow(token, ticketId, {
        category: triageCategory,
        urgency: triageUrgency,
        classification_notes: triageNotes || undefined,
      })
      setTriageNotes('')
      await refreshAll()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to start maintenance workflow')
    } finally {
      setBusy(null)
    }
  }

  const handleAddContractor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy('contractor')
      await api.createOwnerContractor(token, contractorForm)
      setContractorForm({ company_name: '', contact_name: '', email: '', phone: '', whatsapp: '', notes: '', specialties: ['general'] })
      await loadMaintenance()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to create contractor')
    } finally {
      setBusy(null)
    }
  }

  const handleRequestQuotes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy('request_quotes')
      await api.requestOwnerMaintenanceQuotes(token, ticketId, {
        contractor_ids: selectedContractorIds.length > 0 ? selectedContractorIds : undefined,
        request_message: requestMessage || undefined,
      })
      await refreshAll()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to request contractor quotes')
    } finally {
      setBusy(null)
    }
  }

  const handleRecordQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy('record_quote')
      await api.recordOwnerMaintenanceQuote(token, ticketId, {
        contractor_id: quoteForm.contractor_id,
        amount: Number(quoteForm.amount),
        scope_of_work: quoteForm.scope_of_work,
        availability_note: quoteForm.availability_note || undefined,
        estimated_start_at: toIsoOrUndefined(quoteForm.estimated_start_at),
        estimated_completion_at: toIsoOrUndefined(quoteForm.estimated_completion_at),
      })
      setQuoteForm({ contractor_id: quoteForm.contractor_id, amount: '', scope_of_work: '', availability_note: '', estimated_start_at: '', estimated_completion_at: '' })
      await refreshAll()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to record contractor quote')
    } finally {
      setBusy(null)
    }
  }

  const handleApproveQuote = async (quoteId: string) => {
    try {
      setBusy(`approve_${quoteId}`)
      await api.approveOwnerMaintenanceQuote(token, ticketId, quoteId, {
        appointment_start_at: toIsoOrUndefined(assignmentForm.appointment_start_at),
        appointment_end_at: toIsoOrUndefined(assignmentForm.appointment_end_at),
        appointment_notes: assignmentForm.appointment_notes || undefined,
      })
      await refreshAll()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to approve contractor quote')
    } finally {
      setBusy(null)
    }
  }

  const handleAssignmentUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setBusy('assignment')
      await api.updateOwnerMaintenanceAssignment(token, ticketId, {
        booking_status: assignmentForm.booking_status,
        appointment_start_at: toIsoOrUndefined(assignmentForm.appointment_start_at),
        appointment_end_at: toIsoOrUndefined(assignmentForm.appointment_end_at),
        appointment_notes: assignmentForm.appointment_notes || undefined,
        completion_notes: assignmentForm.completion_notes || undefined,
      })
      await refreshAll()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to update maintenance assignment')
    } finally {
      setBusy(null)
    }
  }

  const selectedQuoteSummary = useMemo(() => {
    if (!workflow?.quote_comparison.average_amount) {
      return null
    }
    return `${workflow.quote_comparison.quote_count} quote${workflow.quote_comparison.quote_count > 1 ? 's' : ''} captured`
  }, [workflow])

  if (loading) {
    return <LoadingState message="Loading maintenance workflow..." rows={4} />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!maintenance) {
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
            <h3 className="ph-title mt-4 text-xl font-semibold text-[var(--ph-text)]">
              {workflow ? 'Contractor Quote & Approval' : 'Start Contractor Workflow'}
            </h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
              {workflow
                ? 'Keep categorization, quotes, appointment booking, and completion tracking attached to the ticket history.'
                : maintenance.suggested_triage.rationale}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={workflow?.workflow_status ?? 'triaged'} />
            <StatusBadge status={workflow?.urgency ?? maintenance.suggested_triage.urgency} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Suggested category</p>
            <p className="mt-2 text-base font-semibold text-[var(--ph-text)]">{triageCategory.replaceAll('_', ' ')}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Urgency</p>
            <p className="mt-2 text-base font-semibold text-[var(--ph-text)]">{triageUrgency}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">Quote status</p>
            <p className="mt-2 text-base font-semibold text-[var(--ph-text)]">{selectedQuoteSummary ?? 'No quotes yet'}</p>
          </div>
        </div>
      </article>

      {!workflow ? (
        <Collapsible title="Triage & classify" isOpen={openSection === 'triage'} onToggle={() => toggleSection('triage')}>
          <form onSubmit={handleTriage} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormSelect label="Category" value={triageCategory} onChange={(event) => setTriageCategory(event.target.value as MaintenanceCategory)}>
                {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </FormSelect>
              <FormSelect label="Urgency" value={triageUrgency} onChange={(event) => setTriageUrgency(event.target.value as MaintenanceUrgency)}>
                {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </FormSelect>
            </div>
            <FormTextarea label="Triage note" rows={3} value={triageNotes} onChange={(event) => setTriageNotes(event.target.value)} placeholder="Optional note about why this needs contractor handling." />
            <Button type="submit" disabled={busy === 'triage'}>{busy === 'triage' ? 'Starting...' : 'Start maintenance workflow'}</Button>
          </form>
        </Collapsible>
      ) : null}

      <Collapsible title="Contractor directory" isOpen={openSection === 'contractor'} onToggle={() => toggleSection('contractor')}>
        <form onSubmit={handleAddContractor} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormInput label="Company" value={contractorForm.company_name} onChange={(event) => setContractorForm((current) => ({ ...current, company_name: event.target.value }))} required />
            <FormInput label="Contact" value={contractorForm.contact_name} onChange={(event) => setContractorForm((current) => ({ ...current, contact_name: event.target.value }))} />
            <FormInput label="Email" type="email" value={contractorForm.email} onChange={(event) => setContractorForm((current) => ({ ...current, email: event.target.value }))} />
            <FormInput label="Phone" value={contractorForm.phone} onChange={(event) => setContractorForm((current) => ({ ...current, phone: event.target.value }))} />
            <FormInput label="WhatsApp" value={contractorForm.whatsapp} onChange={(event) => setContractorForm((current) => ({ ...current, whatsapp: event.target.value }))} />
            <FormSelect label="Primary specialty" value={contractorForm.specialties[0] ?? 'general'} onChange={(event) => setContractorForm((current) => ({ ...current, specialties: [event.target.value] }))}>
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </FormSelect>
          </div>
          <FormTextarea label="Notes" rows={2} value={contractorForm.notes} onChange={(event) => setContractorForm((current) => ({ ...current, notes: event.target.value }))} />
          <Button type="submit" variant="secondary" disabled={busy === 'contractor'}>{busy === 'contractor' ? 'Saving...' : 'Add contractor'}</Button>
        </form>
      </Collapsible>

      {workflow ? (
        <>
          <Collapsible title="Request quotes" isOpen={openSection === 'request-quotes'} onToggle={() => toggleSection('request-quotes')}>
            <form onSubmit={handleRequestQuotes} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {contractorChoices.map((contractor) => (
                  <label key={contractor.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4 text-sm text-[var(--ph-text)]">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--ph-accent)]"
                      checked={selectedContractorIds.includes(contractor.id)}
                      onChange={(event) => setSelectedContractorIds((current) => event.target.checked ? [...current, contractor.id] : current.filter((value) => value !== contractor.id))}
                    />
                    <span>
                      <span className="block font-semibold">{contractor.company_name}</span>
                      <span className="mt-1 block text-[var(--ph-text-muted)]">{contractor.specialties.join(', ') || 'General'}</span>
                    </span>
                  </label>
                ))}
              </div>
              <FormTextarea label="Request message" rows={3} value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} placeholder="Optional message to include with the quote request." />
              <Button type="submit" disabled={busy === 'request_quotes'}>{busy === 'request_quotes' ? 'Sending...' : 'Request selected quotes'}</Button>
            </form>
          </Collapsible>

          <Collapsible title="Record contractor quote" isOpen={openSection === 'record-quote'} onToggle={() => toggleSection('record-quote')}>
            <form onSubmit={handleRecordQuote} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FormSelect label="Contractor" value={quoteForm.contractor_id} onChange={(event) => setQuoteForm((current) => ({ ...current, contractor_id: event.target.value }))}>
                  <option value="">Select contractor</option>
                  {maintenance.contractors.map((contractor) => <option key={contractor.id} value={contractor.id}>{contractor.company_name}</option>)}
                </FormSelect>
                <FormInput label="Quote amount" type="number" min="0" step="0.01" value={quoteForm.amount} onChange={(event) => setQuoteForm((current) => ({ ...current, amount: event.target.value }))} required />
                <FormInput label="Availability note" value={quoteForm.availability_note} onChange={(event) => setQuoteForm((current) => ({ ...current, availability_note: event.target.value }))} />
                <FormInput label="Estimated start" type="datetime-local" value={quoteForm.estimated_start_at} onChange={(event) => setQuoteForm((current) => ({ ...current, estimated_start_at: event.target.value }))} />
                <FormInput label="Estimated completion" type="datetime-local" value={quoteForm.estimated_completion_at} onChange={(event) => setQuoteForm((current) => ({ ...current, estimated_completion_at: event.target.value }))} />
              </div>
              <FormTextarea label="Scope of work" rows={3} value={quoteForm.scope_of_work} onChange={(event) => setQuoteForm((current) => ({ ...current, scope_of_work: event.target.value }))} required />
              <Button type="submit" variant="secondary" disabled={busy === 'record_quote'}>{busy === 'record_quote' ? 'Saving...' : 'Record quote'}</Button>
            </form>
          </Collapsible>

          <Collapsible title={`Quote comparison${selectedQuoteSummary ? ` — ${selectedQuoteSummary}` : ''}`} isOpen={openSection === 'quote-comparison'} onToggle={() => toggleSection('quote-comparison')}>
            <div className="space-y-3">
              {workflow.quotes.length === 0 ? <p className="text-sm text-[var(--ph-text-muted)]">No quotes captured yet.</p> : workflow.quotes.map((quote) => (
                <div key={quote.id} className="rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--ph-text)]">{quote.contractor?.company_name ?? 'Contractor quote'}</p>
                      <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{quote.scope_of_work}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={quote.status} />
                      <span className="text-sm font-semibold text-[var(--ph-text)]">{quote.currency_code} {quote.amount.toLocaleString()}</span>
                      {quote.status === 'submitted' ? <Button type="button" size="sm" onClick={() => void handleApproveQuote(quote.id)} disabled={busy === `approve_${quote.id}`}>{busy === `approve_${quote.id}` ? 'Approving...' : 'Approve'}</Button> : null}
                    </div>
                  </div>
                  {quote.estimated_start_at ? <p className="mt-3 text-xs text-[var(--ph-text-muted)]">Estimated start: {formatDateTime(quote.estimated_start_at)}</p> : null}
                </div>
              ))}
            </div>
          </Collapsible>

          {workflow.assignment ? (
            <Collapsible title="Assignment & completion" isOpen={openSection === 'assignment'} onToggle={() => toggleSection('assignment')}>
              <form onSubmit={handleAssignmentUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormSelect label="Booking status" value={assignmentForm.booking_status} onChange={(event) => setAssignmentForm((current) => ({ ...current, booking_status: event.target.value as MaintenanceAssignmentStatus }))}>
                    {assignmentStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                  </FormSelect>
                  <FormInput label="Appointment start" type="datetime-local" value={assignmentForm.appointment_start_at} onChange={(event) => setAssignmentForm((current) => ({ ...current, appointment_start_at: event.target.value }))} />
                  <FormInput label="Appointment end" type="datetime-local" value={assignmentForm.appointment_end_at} onChange={(event) => setAssignmentForm((current) => ({ ...current, appointment_end_at: event.target.value }))} />
                </div>
                <FormTextarea label="Appointment notes" rows={2} value={assignmentForm.appointment_notes} onChange={(event) => setAssignmentForm((current) => ({ ...current, appointment_notes: event.target.value }))} />
                <FormTextarea label="Completion notes" rows={3} value={assignmentForm.completion_notes} onChange={(event) => setAssignmentForm((current) => ({ ...current, completion_notes: event.target.value }))} />
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={busy === 'assignment'}>{busy === 'assignment' ? 'Saving...' : 'Update assignment'}</Button>
                  {workflow.assignment.follow_up_due_at ? <span className="text-xs text-[var(--ph-text-muted)]">Follow-up due: {formatDateTime(workflow.assignment.follow_up_due_at)}</span> : null}
                </div>
              </form>
            </Collapsible>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-[rgba(83,88,100,0.18)] bg-[var(--ph-surface)] px-5 py-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[#f3d49a]" />
              <p className="text-sm text-[var(--ph-text-muted)]">Approve a quote above to create the assignment and booking controls.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
