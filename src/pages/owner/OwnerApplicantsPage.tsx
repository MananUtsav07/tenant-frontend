
import { ClipboardCheck, Coins, FileText, RefreshCw, ShieldCheck, TriangleAlert, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput, FormTextarea } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import {
  dashboardFormPanelClassName,
  dashboardInfoPanelClassName,
  dashboardSuccessPanelClassName,
} from '../../components/common/formTheme'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerScreeningOverview, Property, ScreeningApplicantDetail, ScreeningApplicantOverview } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'

type ApplicantFormState = {
  property_id: string
  enquiry_source: 'manual_owner' | 'listing' | 'whatsapp' | 'vacancy_campaign' | 'webhook' | 'other'
  applicant_name: string
  email: string
  phone: string
  employer: string
  monthly_salary: string
  current_residence: string
  reason_for_moving: string
  number_of_occupants: string
  desired_move_in_date: string
  target_rent_amount: string
  identification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
  employment_verification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
}

type DocumentFormState = {
  document_type: 'emirates_id' | 'salary_slip' | 'employment_letter' | 'passport' | 'visa' | 'other'
  file_name: string
  public_url: string
  storage_path: string
  verification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
  notes: string
}

type DecisionFormState = {
  viewing_decision: 'pending' | 'approved' | 'rejected' | 'scheduled'
  final_disposition: 'in_review' | 'rejected' | 'viewing' | 'lease_prep' | 'withdrawn' | 'approved'
  owner_decision_notes: string
}

const emptyApplicantForm: ApplicantFormState = {
  property_id: '',
  enquiry_source: 'manual_owner',
  applicant_name: '',
  email: '',
  phone: '',
  employer: '',
  monthly_salary: '',
  current_residence: '',
  reason_for_moving: '',
  number_of_occupants: '',
  desired_move_in_date: '',
  target_rent_amount: '',
  identification_status: 'pending',
  employment_verification_status: 'pending',
}

const emptyDocumentForm: DocumentFormState = {
  document_type: 'emirates_id',
  file_name: '',
  public_url: '',
  storage_path: '',
  verification_status: 'submitted',
  notes: '',
}

function applicantFormFromDetail(applicant: ScreeningApplicantDetail): ApplicantFormState {
  return {
    property_id: applicant.property_id ?? '',
    enquiry_source: applicant.enquiry_source === 'manual_admin' ? 'manual_owner' : applicant.enquiry_source,
    applicant_name: applicant.applicant_name,
    email: applicant.email ?? '',
    phone: applicant.phone ?? '',
    employer: applicant.employer ?? '',
    monthly_salary: applicant.monthly_salary !== null ? String(applicant.monthly_salary) : '',
    current_residence: applicant.current_residence ?? '',
    reason_for_moving: applicant.reason_for_moving ?? '',
    number_of_occupants: applicant.number_of_occupants !== null ? String(applicant.number_of_occupants) : '',
    desired_move_in_date: applicant.desired_move_in_date ?? '',
    target_rent_amount: applicant.target_rent_amount !== null ? String(applicant.target_rent_amount) : '',
    identification_status: applicant.identification_status,
    employment_verification_status: applicant.employment_verification_status,
  }
}

function decisionFormFromDetail(applicant: ScreeningApplicantDetail): DecisionFormState {
  return {
    viewing_decision: applicant.viewing_decision,
    final_disposition: applicant.final_disposition,
    owner_decision_notes: applicant.owner_decision_notes ?? '',
  }
}

function ratioLabel(value: number | null) {
  if (typeof value !== 'number') {
    return 'Pending'
  }

  return `${(value * 100).toFixed(1)}%`
}

function applicantListItemLabel(applicant: ScreeningApplicantOverview) {
  const propertyLabel = applicant.property?.property_name
    ? `${applicant.property.property_name}${applicant.property.unit_number ? ` (${applicant.property.unit_number})` : ''}`
    : 'Property not linked'

  return {
    propertyLabel,
    subtitle: [applicant.employer, applicant.desired_move_in_date ? `Move-in ${formatDate(applicant.desired_move_in_date)}` : null]
      .filter(Boolean)
      .join(' · '),
  }
}

export function OwnerApplicantsPage() {
  const { token } = useOwnerAuth()
  const [overview, setOverview] = useState<OwnerScreeningOverview | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null)
  const [applicantDetail, setApplicantDetail] = useState<ScreeningApplicantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<ApplicantFormState>(emptyApplicantForm)
  const [editForm, setEditForm] = useState<ApplicantFormState>(emptyApplicantForm)
  const [documentForm, setDocumentForm] = useState<DocumentFormState>(emptyDocumentForm)
  const [decisionForm, setDecisionForm] = useState<DecisionFormState>({
    viewing_decision: 'pending',
    final_disposition: 'in_review',
    owner_decision_notes: '',
  })

  const loadOverview = useCallback(
    async (preferredApplicantId?: string | null) => {
      if (!token) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [screeningResponse, propertiesResponse] = await Promise.all([
          api.getOwnerScreeningApplicants(token, { page: 1, page_size: 18 }),
          api.getOwnerProperties(token),
        ])
        setOverview(screeningResponse.screening)
        setProperties(propertiesResponse.properties)
        setSelectedApplicantId((current) => {
          const candidate = preferredApplicantId ?? current
          if (candidate && screeningResponse.screening.applicants.some((item) => item.id === candidate)) {
            return candidate
          }
          return screeningResponse.screening.applicants[0]?.id ?? null
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load applicants')
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  const loadApplicantDetail = useCallback(
    async (applicantId: string) => {
      if (!token) {
        return
      }

      try {
        setDetailLoading(true)
        setError(null)
        const response = await api.getOwnerScreeningApplicant(token, applicantId)
        setApplicantDetail(response.applicant)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load applicant detail')
      } finally {
        setDetailLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!selectedApplicantId) {
      setApplicantDetail(null)
      return
    }

    void loadApplicantDetail(selectedApplicantId)
  }, [loadApplicantDetail, selectedApplicantId])

  useEffect(() => {
    if (!applicantDetail) {
      return
    }

    setEditForm(applicantFormFromDetail(applicantDetail))
    setDecisionForm(decisionFormFromDetail(applicantDetail))
  }, [applicantDetail])

  const selectedApplicant = useMemo(
    () => overview?.applicants.find((item) => item.id === selectedApplicantId) ?? null,
    [overview, selectedApplicantId],
  )

  const handleCreateApplicant = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      setSuccess(null)
      const response = await api.createOwnerScreeningApplicant(token, {
        property_id: createForm.property_id || null,
        enquiry_source: createForm.enquiry_source,
        applicant_name: createForm.applicant_name,
        email: createForm.email || null,
        phone: createForm.phone || null,
        employer: createForm.employer || null,
        monthly_salary: createForm.monthly_salary ? Number(createForm.monthly_salary) : null,
        current_residence: createForm.current_residence || null,
        reason_for_moving: createForm.reason_for_moving || null,
        number_of_occupants: createForm.number_of_occupants ? Number(createForm.number_of_occupants) : null,
        desired_move_in_date: createForm.desired_move_in_date || null,
        target_rent_amount: createForm.target_rent_amount ? Number(createForm.target_rent_amount) : null,
        identification_status: createForm.identification_status,
        employment_verification_status: createForm.employment_verification_status,
      })
      setCreateForm(emptyApplicantForm)
      setApplicantDetail(response.applicant)
      setSelectedApplicantId(response.applicant.id)
      await loadOverview(response.applicant.id)
      setSuccess('Applicant added to the screening pipeline.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create applicant')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveApplicant = async () => {
    if (!token || !applicantDetail) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      setSuccess(null)
      const response = await api.updateOwnerScreeningApplicant(token, applicantDetail.id, {
        property_id: editForm.property_id || null,
        applicant_name: editForm.applicant_name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        employer: editForm.employer || null,
        monthly_salary: editForm.monthly_salary ? Number(editForm.monthly_salary) : null,
        current_residence: editForm.current_residence || null,
        reason_for_moving: editForm.reason_for_moving || null,
        number_of_occupants: editForm.number_of_occupants ? Number(editForm.number_of_occupants) : null,
        desired_move_in_date: editForm.desired_move_in_date || null,
        target_rent_amount: editForm.target_rent_amount ? Number(editForm.target_rent_amount) : null,
        identification_status: editForm.identification_status,
        employment_verification_status: editForm.employment_verification_status,
      })
      setApplicantDetail(response.applicant)
      await loadOverview(response.applicant.id)
      setSuccess('Applicant details updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update applicant')
    } finally {
      setBusy(false)
    }
  }

  const handleAddDocument = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !applicantDetail) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      setSuccess(null)
      const response = await api.addOwnerScreeningApplicantDocument(token, applicantDetail.id, {
        document_type: documentForm.document_type,
        file_name: documentForm.file_name,
        public_url: documentForm.public_url || null,
        storage_path: documentForm.storage_path || null,
        verification_status: documentForm.verification_status,
        notes: documentForm.notes || null,
      })
      setApplicantDetail(response.applicant)
      setDocumentForm(emptyDocumentForm)
      await loadOverview(response.applicant.id)
      setSuccess('Document reference added and recommendation refreshed.')
    } catch (documentError) {
      setError(documentError instanceof Error ? documentError.message : 'Failed to attach document')
    } finally {
      setBusy(false)
    }
  }

  const handleSaveDecision = async () => {
    if (!token || !applicantDetail) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      setSuccess(null)
      const response = await api.updateOwnerScreeningApplicantDecision(token, applicantDetail.id, {
        viewing_decision: decisionForm.viewing_decision,
        final_disposition: decisionForm.final_disposition,
        owner_decision_notes: decisionForm.owner_decision_notes || null,
      })
      setApplicantDetail(response.applicant)
      await loadOverview(response.applicant.id)
      setSuccess('Owner decision saved.')
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Failed to save decision')
    } finally {
      setBusy(false)
    }
  }

  const handleRefreshRecommendation = async () => {
    if (!token || !applicantDetail) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      setSuccess(null)
      const response = await api.refreshOwnerScreeningApplicant(token, applicantDetail.id)
      setApplicantDetail(response.applicant)
      await loadOverview(response.applicant.id)
      setSuccess('Recommendation refreshed.')
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh recommendation')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className={dashboardFormPanelClassName}>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <ClipboardCheck className="h-6 w-6 text-[var(--ph-accent)]" />
          Applicant screening
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ph-text-muted)]">
          Capture applicant details, track supporting documents, calculate affordability, and move qualified residents
          into viewing or lease preparation with a clear audit trail.
        </p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {success ? <div className={dashboardSuccessPanelClassName}>{success}</div> : null}
      {loading ? <LoadingState message="Loading applicant screening pipeline..." rows={5} /> : null}

      {!loading && overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Applicants" value={overview.summary.total_applicants} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Recommended" value={overview.summary.green_count} icon={<ShieldCheck className="h-4 w-4" />} />
            <SummaryCard label="Review" value={overview.summary.amber_count} icon={<TriangleAlert className="h-4 w-4" />} />
            <SummaryCard label="Not Recommended" value={overview.summary.red_count} icon={<TriangleAlert className="h-4 w-4" />} />
            <SummaryCard label="Lease Prep" value={overview.summary.lease_prep_count} icon={<FileText className="h-4 w-4" />} />
          </div>

          <article className={`${dashboardFormPanelClassName} space-y-4`}>
            <div>
              <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">New applicant intake</h3>
              <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                Use manual entry today. The same record structure is ready for future listing and WhatsApp intake.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => void handleCreateApplicant(event)}>
              <FormSelect label="Property" value={createForm.property_id} onChange={(event) => setCreateForm((current) => ({ ...current, property_id: event.target.value }))}>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name}
                    {property.unit_number ? ` (${property.unit_number})` : ''}
                  </option>
                ))}
              </FormSelect>
              <FormSelect label="Enquiry Source" value={createForm.enquiry_source} onChange={(event) => setCreateForm((current) => ({ ...current, enquiry_source: event.target.value as ApplicantFormState['enquiry_source'] }))}>
                <option value="manual_owner">Manual owner entry</option>
                <option value="listing">Listing enquiry</option>
                <option value="whatsapp">WhatsApp intake</option>
                <option value="vacancy_campaign">Vacancy campaign</option>
                <option value="webhook">Webhook</option>
                <option value="other">Other</option>
              </FormSelect>
              <FormInput label="Applicant Name" value={createForm.applicant_name} onChange={(event) => setCreateForm((current) => ({ ...current, applicant_name: event.target.value }))} required />
              <FormInput label="Email" type="email" value={createForm.email} onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))} />
              <FormInput label="Phone" value={createForm.phone} onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))} />
              <FormInput label="Employer" value={createForm.employer} onChange={(event) => setCreateForm((current) => ({ ...current, employer: event.target.value }))} />
              <FormInput label="Monthly Salary" type="number" min="0" value={createForm.monthly_salary} onChange={(event) => setCreateForm((current) => ({ ...current, monthly_salary: event.target.value }))} />
              <FormInput label="Target Rent" type="number" min="0" value={createForm.target_rent_amount} onChange={(event) => setCreateForm((current) => ({ ...current, target_rent_amount: event.target.value }))} />
              <FormInput label="Current Residence" value={createForm.current_residence} onChange={(event) => setCreateForm((current) => ({ ...current, current_residence: event.target.value }))} />
              <FormInput label="Occupants" type="number" min="0" value={createForm.number_of_occupants} onChange={(event) => setCreateForm((current) => ({ ...current, number_of_occupants: event.target.value }))} />
              <FormInput label="Move-in Date" type="date" value={createForm.desired_move_in_date} onChange={(event) => setCreateForm((current) => ({ ...current, desired_move_in_date: event.target.value }))} />
              <FormSelect label="ID Status" value={createForm.identification_status} onChange={(event) => setCreateForm((current) => ({ ...current, identification_status: event.target.value as ApplicantFormState['identification_status'] }))}>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
                <option value="not_provided">Not provided</option>
              </FormSelect>
              <FormSelect label="Employment Status" value={createForm.employment_verification_status} onChange={(event) => setCreateForm((current) => ({ ...current, employment_verification_status: event.target.value as ApplicantFormState['employment_verification_status'] }))}>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
                <option value="not_provided">Not provided</option>
              </FormSelect>
              <div className="md:col-span-2 xl:col-span-4">
                <FormTextarea label="Reason for Moving" rows={3} value={createForm.reason_for_moving} onChange={(event) => setCreateForm((current) => ({ ...current, reason_for_moving: event.target.value }))} />
              </div>
              <div className="md:col-span-2 xl:col-span-4">
                <Button type="submit" variant="secondary" disabled={busy}>
                  {busy ? 'Saving...' : 'Create applicant'}
                </Button>
              </div>
            </form>
          </article>

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Pipeline</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">Owners see recommendation status, affordability, and next-step readiness here.</p>
              </div>

              {overview.applicants.length === 0 ? (
                <EmptyState title="No applicants yet" description="Create an applicant intake above to start screening and owner review." />
              ) : (
                <div className="space-y-3">
                  {overview.applicants.map((applicant) => {
                    const labels = applicantListItemLabel(applicant)

                    return (
                      <button
                        key={applicant.id}
                        type="button"
                        onClick={() => setSelectedApplicantId(applicant.id)}
                        className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                          selectedApplicantId === applicant.id
                            ? 'border-[rgba(240,163,35,0.42)] bg-[rgba(240,163,35,0.08)]'
                            : 'border-[rgba(83,88,100,0.34)] bg-[rgba(255,255,255,0.025)] hover:border-[rgba(151,105,34,0.38)] hover:bg-[rgba(255,255,255,0.04)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--ph-text)]">{applicant.applicant_name}</p>
                            <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{labels.propertyLabel}</p>
                            {labels.subtitle ? <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{labels.subtitle}</p> : null}
                          </div>
                          <StatusBadge status={applicant.recommendation_category} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge status={applicant.final_disposition} />
                          <StatusBadge status={applicant.viewing_decision} />
                        </div>
                        <p className="mt-3 text-xs text-[var(--ph-text-soft)]">
                          Ratio {ratioLabel(applicant.affordability_ratio)} · Created {formatDateTime(applicant.created_at)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </article>

            <article className={`${dashboardFormPanelClassName} space-y-5`}>
              {!selectedApplicant ? (
                <EmptyState title="Select an applicant" description="Choose an applicant from the pipeline to inspect the full questionnaire, documents, and recommendation." />
              ) : detailLoading || !applicantDetail ? (
                <LoadingState message="Loading applicant detail..." rows={4} />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">{applicantDetail.applicant_name}</h3>
                      <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                        {applicantDetail.property?.property_name ?? 'Property not linked'}
                        {applicantDetail.property?.unit_number ? ` (${applicantDetail.property.unit_number})` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={applicantDetail.recommendation_category} />
                      <StatusBadge status={applicantDetail.final_disposition} />
                      <StatusBadge status={applicantDetail.viewing_decision} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard label="Rent-to-Income" value={ratioLabel(applicantDetail.affordability_ratio)} icon={<Coins className="h-4 w-4" />} />
                    <SummaryCard label="Salary" value={formatCurrency(applicantDetail.monthly_salary)} icon={<ShieldCheck className="h-4 w-4" />} />
                    <SummaryCard label="Target Rent" value={formatCurrency(applicantDetail.target_rent_amount)} icon={<FileText className="h-4 w-4" />} />
                  </div>

                  <div className={dashboardInfoPanelClassName}>
                    <p className="font-medium text-[var(--ph-text)]">Recommendation</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-soft)]">
                      {applicantDetail.recommendation_summary ?? 'Recommendation pending.'}
                    </p>
                    {applicantDetail.recommendation_reasons.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-[var(--ph-text-muted)]">
                        {applicantDetail.recommendation_reasons.map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-4">
                      <Button type="button" variant="outline" iconLeft={<RefreshCw className="h-4 w-4" />} onClick={() => void handleRefreshRecommendation()} disabled={busy}>
                        Refresh recommendation
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Questionnaire</h4>
                        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">Declared answers stay separated from verification status so owners can see what is claimed versus what is confirmed.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormInput label="Applicant Name" value={editForm.applicant_name} onChange={(event) => setEditForm((current) => ({ ...current, applicant_name: event.target.value }))} />
                        <FormSelect label="Property" value={editForm.property_id} onChange={(event) => setEditForm((current) => ({ ...current, property_id: event.target.value }))}>
                          <option value="">Select property</option>
                          {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.property_name}
                              {property.unit_number ? ` (${property.unit_number})` : ''}
                            </option>
                          ))}
                        </FormSelect>
                        <FormInput label="Email" type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} />
                        <FormInput label="Phone" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} />
                        <FormInput label="Employer" value={editForm.employer} onChange={(event) => setEditForm((current) => ({ ...current, employer: event.target.value }))} />
                        <FormInput label="Monthly Salary" type="number" min="0" value={editForm.monthly_salary} onChange={(event) => setEditForm((current) => ({ ...current, monthly_salary: event.target.value }))} />
                        <FormInput label="Current Residence" value={editForm.current_residence} onChange={(event) => setEditForm((current) => ({ ...current, current_residence: event.target.value }))} />
                        <FormInput label="Occupants" type="number" min="0" value={editForm.number_of_occupants} onChange={(event) => setEditForm((current) => ({ ...current, number_of_occupants: event.target.value }))} />
                        <FormInput label="Move-in Date" type="date" value={editForm.desired_move_in_date} onChange={(event) => setEditForm((current) => ({ ...current, desired_move_in_date: event.target.value }))} />
                        <FormInput label="Target Rent" type="number" min="0" value={editForm.target_rent_amount} onChange={(event) => setEditForm((current) => ({ ...current, target_rent_amount: event.target.value }))} />
                        <FormSelect label="ID Status" value={editForm.identification_status} onChange={(event) => setEditForm((current) => ({ ...current, identification_status: event.target.value as ApplicantFormState['identification_status'] }))}>
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="verified">Verified</option>
                          <option value="failed">Failed</option>
                          <option value="not_provided">Not provided</option>
                        </FormSelect>
                        <FormSelect label="Employment Status" value={editForm.employment_verification_status} onChange={(event) => setEditForm((current) => ({ ...current, employment_verification_status: event.target.value as ApplicantFormState['employment_verification_status'] }))}>
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="verified">Verified</option>
                          <option value="failed">Failed</option>
                          <option value="not_provided">Not provided</option>
                        </FormSelect>
                        <div className="md:col-span-2">
                          <FormTextarea label="Reason for Moving" rows={3} value={editForm.reason_for_moving} onChange={(event) => setEditForm((current) => ({ ...current, reason_for_moving: event.target.value }))} />
                        </div>
                      </div>
                      <Button type="button" variant="secondary" onClick={() => void handleSaveApplicant()} disabled={busy}>
                        Save questionnaire
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Documents and owner decision</h4>
                        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">Document records are stored as references today, ready for future upload and extraction providers.</p>
                      </div>
                      <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void handleAddDocument(event)}>
                        <FormSelect label="Document Type" value={documentForm.document_type} onChange={(event) => setDocumentForm((current) => ({ ...current, document_type: event.target.value as DocumentFormState['document_type'] }))}>
                          <option value="emirates_id">Emirates ID</option>
                          <option value="salary_slip">Salary Slip</option>
                          <option value="employment_letter">Employment Letter</option>
                          <option value="passport">Passport</option>
                          <option value="visa">Visa</option>
                          <option value="other">Other</option>
                        </FormSelect>
                        <FormSelect label="Verification Status" value={documentForm.verification_status} onChange={(event) => setDocumentForm((current) => ({ ...current, verification_status: event.target.value as DocumentFormState['verification_status'] }))}>
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="verified">Verified</option>
                          <option value="failed">Failed</option>
                          <option value="not_provided">Not provided</option>
                        </FormSelect>
                        <FormInput label="File Name" value={documentForm.file_name} onChange={(event) => setDocumentForm((current) => ({ ...current, file_name: event.target.value }))} required />
                        <FormInput label="Public URL" value={documentForm.public_url} onChange={(event) => setDocumentForm((current) => ({ ...current, public_url: event.target.value }))} />
                        <FormInput label="Storage Path" value={documentForm.storage_path} onChange={(event) => setDocumentForm((current) => ({ ...current, storage_path: event.target.value }))} />
                        <div className="md:col-span-2">
                          <FormTextarea label="Notes" rows={3} value={documentForm.notes} onChange={(event) => setDocumentForm((current) => ({ ...current, notes: event.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <Button type="submit" variant="outline" disabled={busy}>
                            Add document reference
                          </Button>
                        </div>
                      </form>

                      <div className="space-y-3">
                        {applicantDetail.documents.length === 0 ? (
                          <EmptyState title="No documents attached" description="Attach document references to move verification forward." />
                        ) : (
                          applicantDetail.documents.map((document) => (
                            <div key={document.id} className="rounded-[1.2rem] border border-[rgba(83,88,100,0.34)] bg-[rgba(255,255,255,0.025)] p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium text-[var(--ph-text)]">{document.file_name}</p>
                                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{document.document_type.replaceAll('_', ' ')}</p>
                                </div>
                                <StatusBadge status={document.verification_status} />
                              </div>
                              {document.public_url ? (
                                <a className="mt-3 inline-flex text-sm text-[#f1cb85] underline-offset-4 hover:underline" href={document.public_url} target="_blank" rel="noreferrer">
                                  Open document reference
                                </a>
                              ) : null}
                              {document.notes ? <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{document.notes}</p> : null}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="rounded-[1.35rem] border border-[rgba(83,88,100,0.34)] bg-[rgba(255,255,255,0.025)] p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormSelect label="Viewing Decision" value={decisionForm.viewing_decision} onChange={(event) => setDecisionForm((current) => ({ ...current, viewing_decision: event.target.value as DecisionFormState['viewing_decision'] }))}>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="scheduled">Scheduled</option>
                          </FormSelect>
                          <FormSelect label="Final Disposition" value={decisionForm.final_disposition} onChange={(event) => setDecisionForm((current) => ({ ...current, final_disposition: event.target.value as DecisionFormState['final_disposition'] }))}>
                            <option value="in_review">In review</option>
                            <option value="viewing">Viewing</option>
                            <option value="lease_prep">Lease prep</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </FormSelect>
                          <div className="md:col-span-2">
                            <FormTextarea label="Owner Notes" rows={3} value={decisionForm.owner_decision_notes} onChange={(event) => setDecisionForm((current) => ({ ...current, owner_decision_notes: event.target.value }))} />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button type="button" variant="secondary" disabled={busy} onClick={() => void handleSaveDecision()}>
                            Save owner decision
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Activity</h4>
                    <div className="mt-3 space-y-3">
                      {applicantDetail.events.length === 0 ? (
                        <EmptyState title="No activity yet" description="Applicant events will appear here as screening progresses." />
                      ) : (
                        applicantDetail.events.map((event) => (
                          <div key={event.id} className="rounded-[1.2rem] border border-[rgba(83,88,100,0.34)] bg-[rgba(255,255,255,0.025)] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-[var(--ph-text)]">{event.title}</p>
                                <p className="mt-1 text-sm text-[var(--ph-text-soft)]">{event.message}</p>
                              </div>
                              <p className="text-xs text-[var(--ph-text-muted)]">{formatDateTime(event.created_at)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}
