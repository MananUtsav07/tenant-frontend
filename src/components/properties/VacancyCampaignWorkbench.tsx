import { Building2, CalendarClock, ClipboardCheck, RefreshCcw, Send, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { FormInput, FormTextarea } from '../common/FormInput'
import {
  dashboardFormPanelClassName,
  dashboardInfoPanelClassName,
} from '../common/formTheme'
import { StatusBadge } from '../common/StatusBadge'
import { api } from '../../services/api'
import type { OwnerVacancyOverview, Property } from '../../types/api'
import { formatDate, formatDateTime } from '../../utils/date'

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function joinLines(values: string[]) {
  return values.join('\n')
}

type VacancyCampaignWorkbenchProps = {
  token: string
  properties: Property[]
}

export function VacancyCampaignWorkbench({ token, properties }: VacancyCampaignWorkbenchProps) {
  const [overview, setOverview] = useState<OwnerVacancyOverview | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [startForm, setStartForm] = useState({
    property_id: '',
    source_type: 'manual' as 'tenant_notice' | 'lease_expiry' | 'manual',
    expected_vacancy_date: '',
    vacancy_state: 'pre_vacant' as 'pre_vacant' | 'vacant' | 'relisting_in_progress',
    trigger_notes: '',
  })

  const [draftForm, setDraftForm] = useState({
    listing_title: '',
    listing_description: '',
    listing_features: '',
    availability_label: '',
    expected_vacancy_date: '',
    vacancy_state: 'pre_vacant' as 'pre_vacant' | 'vacant' | 'relisting_in_progress',
    trigger_notes: '',
  })

  const [leadForm, setLeadForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: 'manual_review',
    notes: '',
  })

  const [viewingForm, setViewingForm] = useState({
    scheduled_start_at: '',
    scheduled_end_at: '',
    notes: '',
  })

  const [applicationForm, setApplicationForm] = useState({
    applicant_name: '',
    desired_move_in_date: '',
    monthly_salary: '',
    status: 'submitted' as 'submitted' | 'under_review' | 'approved' | 'rejected',
    notes: '',
  })

  const loadVacancy = useCallback(async () => {
    try {
      setError(null)
      const response = await api.getOwnerVacancyCampaigns(token)
      setOverview(response.vacancy)
      setSelectedCampaignId((current) => current ?? response.vacancy.campaigns[0]?.id ?? null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load vacancy campaigns')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadVacancy()
  }, [loadVacancy])

  const selectedCampaign = useMemo(
    () => overview?.campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? overview?.campaigns[0] ?? null,
    [overview, selectedCampaignId],
  )

  useEffect(() => {
    if (!selectedCampaign) {
      return
    }

    setDraftForm({
      listing_title: selectedCampaign.listing_title ?? '',
      listing_description: selectedCampaign.listing_description ?? '',
      listing_features: joinLines(selectedCampaign.listing_features),
      availability_label: selectedCampaign.availability_label ?? '',
      expected_vacancy_date: selectedCampaign.expected_vacancy_date,
      vacancy_state: selectedCampaign.vacancy_state,
      trigger_notes: selectedCampaign.trigger_notes ?? '',
    })
  }, [selectedCampaign])

  const handleStartCampaign = async (event: FormEvent) => {
    event.preventDefault()
    if (!startForm.property_id) {
      setError('Choose a property before starting a vacancy campaign')
      return
    }

    try {
      setBusy(true)
      setError(null)
      const response = await api.createOwnerPropertyVacancyCampaign(token, startForm.property_id, {
        source_type: startForm.source_type,
        expected_vacancy_date: startForm.expected_vacancy_date,
        vacancy_state: startForm.vacancy_state,
        trigger_notes: startForm.trigger_notes || null,
      })

      setSelectedCampaignId(response.campaign.id)
      setStartForm({
        property_id: '',
        source_type: 'manual',
        expected_vacancy_date: '',
        vacancy_state: 'pre_vacant',
        trigger_notes: '',
      })
      await loadVacancy()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to start vacancy campaign')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!selectedCampaign) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.updateOwnerVacancyCampaignDraft(token, selectedCampaign.id, {
        listing_title: draftForm.listing_title,
        listing_description: draftForm.listing_description,
        listing_features: splitLines(draftForm.listing_features),
        availability_label: draftForm.availability_label || null,
        expected_vacancy_date: draftForm.expected_vacancy_date,
        vacancy_state: draftForm.vacancy_state,
        trigger_notes: draftForm.trigger_notes || null,
      })
      await loadVacancy()
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : 'Failed to save listing draft')
    } finally {
      setBusy(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedCampaign) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.approveOwnerVacancyCampaign(token, selectedCampaign.id, {
        listing_title: draftForm.listing_title,
        listing_description: draftForm.listing_description,
        listing_features: splitLines(draftForm.listing_features),
        availability_label: draftForm.availability_label || null,
      })
      await loadVacancy()
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : 'Failed to approve vacancy campaign')
    } finally {
      setBusy(false)
    }
  }

  const handleLeadSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCampaign) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.createOwnerVacancyLead(token, selectedCampaign.id, {
        full_name: leadForm.full_name,
        email: leadForm.email || null,
        phone: leadForm.phone || null,
        source: leadForm.source,
        notes: leadForm.notes || null,
      })
      setLeadForm({ full_name: '', email: '', phone: '', source: 'manual_review', notes: '' })
      await loadVacancy()
    } catch (leadError) {
      setError(leadError instanceof Error ? leadError.message : 'Failed to add enquiry')
    } finally {
      setBusy(false)
    }
  }

  const handleViewingSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCampaign) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.createOwnerVacancyViewing(token, selectedCampaign.id, {
        scheduled_start_at: viewingForm.scheduled_start_at,
        scheduled_end_at: viewingForm.scheduled_end_at || null,
        notes: viewingForm.notes || null,
      })
      setViewingForm({ scheduled_start_at: '', scheduled_end_at: '', notes: '' })
      await loadVacancy()
    } catch (viewingError) {
      setError(viewingError instanceof Error ? viewingError.message : 'Failed to add viewing')
    } finally {
      setBusy(false)
    }
  }

  const handleApplicationSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedCampaign) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.createOwnerVacancyApplication(token, selectedCampaign.id, {
        applicant_name: applicationForm.applicant_name,
        desired_move_in_date: applicationForm.desired_move_in_date || null,
        monthly_salary: applicationForm.monthly_salary ? Number(applicationForm.monthly_salary) : null,
        status: applicationForm.status,
        notes: applicationForm.notes || null,
      })
      setApplicationForm({
        applicant_name: '',
        desired_move_in_date: '',
        monthly_salary: '',
        status: 'submitted',
        notes: '',
      })
      await loadVacancy()
    } catch (applicationError) {
      setError(applicationError instanceof Error ? applicationError.message : 'Failed to add application')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={dashboardInfoPanelClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Active Campaigns</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{overview?.summary.active_campaign_count ?? 0}</p>
        </div>
        <div className={dashboardInfoPanelClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Vacant Now</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{overview?.summary.vacant_count ?? 0}</p>
        </div>
        <div className={dashboardInfoPanelClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Scheduled Viewings</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{overview?.summary.scheduled_viewings_count ?? 0}</p>
        </div>
        <div className={dashboardInfoPanelClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Applications</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{overview?.summary.applications_count ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={handleStartCampaign} className={`${dashboardFormPanelClassName} space-y-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Start Re-letting Workflow</p>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Mark a property as pre-vacant or vacant and open the internal listing workflow.</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => void loadVacancy()} iconLeft={<RefreshCcw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>

          <label className="block text-sm text-[var(--ph-text-muted)]">
            Property
            <select
              className="ph-form-control mt-2"
              value={startForm.property_id}
              onChange={(event) => setStartForm((current) => ({ ...current, property_id: event.target.value }))}
            >
              <option value="">Choose property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.property_name}{property.unit_number ? ` (${property.unit_number})` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-[var(--ph-text-muted)]">
              Trigger
              <select
                className="ph-form-control mt-2"
                value={startForm.source_type}
                onChange={(event) =>
                  setStartForm((current) => ({ ...current, source_type: event.target.value as typeof current.source_type }))
                }
              >
                <option value="manual">Manual vacancy mark</option>
                <option value="lease_expiry">Lease expiry</option>
                <option value="tenant_notice">Tenant notice</option>
              </select>
            </label>
            <label className="block text-sm text-[var(--ph-text-muted)]">
              State
              <select
                className="ph-form-control mt-2"
                value={startForm.vacancy_state}
                onChange={(event) =>
                  setStartForm((current) => ({ ...current, vacancy_state: event.target.value as typeof current.vacancy_state }))
                }
              >
                <option value="pre_vacant">Pre-vacant</option>
                <option value="vacant">Vacant</option>
                <option value="relisting_in_progress">Relisting in progress</option>
              </select>
            </label>
          </div>

          <FormInput
            label="Expected Vacancy Date"
            type="date"
            value={startForm.expected_vacancy_date}
            onChange={(event) => setStartForm((current) => ({ ...current, expected_vacancy_date: event.target.value }))}
            required
          />
          <FormTextarea
            label="Context"
            rows={4}
            value={startForm.trigger_notes}
            onChange={(event) => setStartForm((current) => ({ ...current, trigger_notes: event.target.value }))}
            placeholder="Add move-out timing, known listing context, or anything the campaign should carry forward."
          />

          <Button type="submit" variant="secondary" disabled={busy} iconLeft={<Send className="h-4 w-4" />}>
            {busy ? 'Saving...' : 'Open Vacancy Campaign'}
          </Button>
        </form>

        <div className={`${dashboardFormPanelClassName} space-y-4`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Campaign Queue</p>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Monitor pre-vacant, vacant, and actively re-listed properties.</p>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--ph-text-muted)]">Loading vacancy campaigns...</p>
          ) : overview?.campaigns.length ? (
            <div className="space-y-3">
              {overview.campaigns.map((campaign) => {
                const isSelected = campaign.id === selectedCampaign?.id
                return (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => setSelectedCampaignId(campaign.id)}
                    className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                      isSelected
                        ? 'border-[rgba(240,163,35,0.32)] bg-[rgba(240,163,35,0.08)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-[rgba(240,163,35,0.2)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ph-text)]">
                          {campaign.property?.property_name ?? 'Property'}
                          {campaign.property?.unit_number ? ` (${campaign.property.unit_number})` : ''}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                          Expected vacancy {formatDate(campaign.expected_vacancy_date)} | {campaign.next_action}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={campaign.campaign_status} />
                        <StatusBadge status={campaign.vacancy_state} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="No vacancy campaigns yet"
              description="Campaigns created from lease expiry, tenant notice, or manual vacancy marking will appear here."
              icon={<Building2 className="h-5 w-5" />}
            />
          )}
        </div>
      </div>

      {selectedCampaign ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className={`${dashboardFormPanelClassName} space-y-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Listing Review</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--ph-text)]">
                  {selectedCampaign.property?.property_name ?? 'Property'}{selectedCampaign.property?.unit_number ? ` (${selectedCampaign.property.unit_number})` : ''}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedCampaign.campaign_status} />
                <StatusBadge status={selectedCampaign.listing_sync_status} />
              </div>
            </div>

            <FormInput label="Listing Title" value={draftForm.listing_title} onChange={(event) => setDraftForm((current) => ({ ...current, listing_title: event.target.value }))} />
            <FormTextarea label="Listing Description" rows={5} value={draftForm.listing_description} onChange={(event) => setDraftForm((current) => ({ ...current, listing_description: event.target.value }))} />
            <FormTextarea label="Features" hint="One feature per line" rows={4} value={draftForm.listing_features} onChange={(event) => setDraftForm((current) => ({ ...current, listing_features: event.target.value }))} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="Availability Label" value={draftForm.availability_label} onChange={(event) => setDraftForm((current) => ({ ...current, availability_label: event.target.value }))} />
              <FormInput label="Expected Vacancy Date" type="date" value={draftForm.expected_vacancy_date} onChange={(event) => setDraftForm((current) => ({ ...current, expected_vacancy_date: event.target.value }))} />
            </div>

            <FormTextarea label="Campaign Notes" rows={3} value={draftForm.trigger_notes} onChange={(event) => setDraftForm((current) => ({ ...current, trigger_notes: event.target.value }))} />

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => void handleSaveDraft()}>
                Save Draft
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void handleApprove()} iconLeft={<ClipboardCheck className="h-4 w-4" />}>
                Approve And Advance
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className={dashboardInfoPanelClassName}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Enquiries</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{selectedCampaign.enquiry_count}</p>
              </div>
              <div className={dashboardInfoPanelClassName}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Viewings</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{selectedCampaign.scheduled_viewings_count}</p>
              </div>
              <div className={dashboardInfoPanelClassName}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Applications</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{selectedCampaign.applications_count}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${dashboardFormPanelClassName} space-y-3`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Activity Timeline</p>
              {selectedCampaign.events.length ? (
                selectedCampaign.events.slice(0, 6).map((event) => (
                  <div key={event.id} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ph-text)]">{event.title}</p>
                        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">{event.message}</p>
                      </div>
                      <p className="text-xs text-[var(--ph-text-muted)]">{formatDateTime(event.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--ph-text-muted)]">Campaign history will build here as the workflow progresses.</p>
              )}
            </div>

            <form onSubmit={handleLeadSubmit} className={`${dashboardFormPanelClassName} space-y-3`}>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
                <Users className="h-4 w-4" />
                Record Enquiry
              </p>
              <FormInput label="Lead Name" value={leadForm.full_name} onChange={(event) => setLeadForm((current) => ({ ...current, full_name: event.target.value }))} required />
              <div className="grid gap-3 md:grid-cols-2">
                <FormInput label="Email" type="email" value={leadForm.email} onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))} />
                <FormInput label="Phone" value={leadForm.phone} onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))} />
              </div>
              <Button type="submit" variant="outline" disabled={busy}>Add Enquiry</Button>
            </form>

            <form onSubmit={handleViewingSubmit} className={`${dashboardFormPanelClassName} space-y-3`}>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
                <CalendarClock className="h-4 w-4" />
                Record Viewing
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <FormInput label="Starts" type="datetime-local" value={viewingForm.scheduled_start_at} onChange={(event) => setViewingForm((current) => ({ ...current, scheduled_start_at: event.target.value }))} required />
                <FormInput label="Ends" type="datetime-local" value={viewingForm.scheduled_end_at} onChange={(event) => setViewingForm((current) => ({ ...current, scheduled_end_at: event.target.value }))} />
              </div>
              <FormTextarea label="Notes" rows={3} value={viewingForm.notes} onChange={(event) => setViewingForm((current) => ({ ...current, notes: event.target.value }))} />
              <Button type="submit" variant="outline" disabled={busy}>Add Viewing</Button>
            </form>

            <form onSubmit={handleApplicationSubmit} className={`${dashboardFormPanelClassName} space-y-3`}>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">
                <ClipboardCheck className="h-4 w-4" />
                Record Application
              </p>
              <FormInput label="Applicant Name" value={applicationForm.applicant_name} onChange={(event) => setApplicationForm((current) => ({ ...current, applicant_name: event.target.value }))} required />
              <div className="grid gap-3 md:grid-cols-2">
                <FormInput label="Move-in Date" type="date" value={applicationForm.desired_move_in_date} onChange={(event) => setApplicationForm((current) => ({ ...current, desired_move_in_date: event.target.value }))} />
                <FormInput label="Monthly Salary" type="number" min="0" value={applicationForm.monthly_salary} onChange={(event) => setApplicationForm((current) => ({ ...current, monthly_salary: event.target.value }))} />
              </div>
              <label className="block text-sm text-[var(--ph-text-muted)]">
                Status
                <select
                  className="ph-form-control mt-2"
                  value={applicationForm.status}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, status: event.target.value as typeof current.status }))}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <Button type="submit" variant="outline" disabled={busy}>Add Application</Button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
