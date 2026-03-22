import { useCallback, useEffect, useState } from 'react'
import { BellRing, CalendarClock, CircleDollarSign, Home, LifeBuoy } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { ConditionReportTenantPanel } from '../../components/condition-reports/ConditionReportTenantPanel'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { Property, Tenant, TenantLeaseRenewalIntentState, TenantRentPaymentState, TenantSummary } from '../../types/api'
import { formatCurrency, formatDate } from '../../utils/date'

export function TenantDashboardPage() {
  const { token, tenant: authTenant } = useTenantAuth()
  const [summary, setSummary] = useState<TenantSummary | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [rentPaymentState, setRentPaymentState] = useState<TenantRentPaymentState | null>(null)
  const [leaseRenewalIntentState, setLeaseRenewalIntentState] = useState<TenantLeaseRenewalIntentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [submittingLeasePreference, setSubmittingLeasePreference] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const [summaryResponse, propertyResponse] = await Promise.all([
        api.getTenantSummary(token),
        api.getTenantProperty(token),
      ])
      setSummary(summaryResponse.summary)
      setProperty(propertyResponse.property)
      setTenant(propertyResponse.tenant)

      try {
        const rentPaymentResponse = await api.getTenantRentPaymentState(token)
        setRentPaymentState(rentPaymentResponse.state)
      } catch (rentPaymentError) {
        if (rentPaymentError instanceof Error && rentPaymentError.message.toLowerCase().includes('route not found')) {
          setRentPaymentState(null)
          return
        }
        throw rentPaymentError
      }

      try {
        const leaseRenewalResponse = await api.getTenantLeaseRenewalIntentState(token)
        setLeaseRenewalIntentState(leaseRenewalResponse.state)
      } catch (leaseRenewalError) {
        if (leaseRenewalError instanceof Error && leaseRenewalError.message.toLowerCase().includes('route not found')) {
          setLeaseRenewalIntentState(null)
          return
        }
        throw leaseRenewalError
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant dashboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const handleMarkRentPaid = async () => {
    if (!token) {
      return
    }

    try {
      setMarkingPaid(true)
      setError(null)
      await api.markTenantRentPaid(token)
      await loadDashboard()
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark rent as paid')
    } finally {
      setMarkingPaid(false)
    }
  }

  const handleLeasePreferenceSubmit = async (decision: 'yes' | 'no') => {
    if (!token) {
      return
    }

    try {
      setSubmittingLeasePreference(true)
      setError(null)
      await api.submitTenantLeaseRenewalIntent(token, { decision })
      const leaseRenewalResponse = await api.getTenantLeaseRenewalIntentState(token)
      setLeaseRenewalIntentState(leaseRenewalResponse.state)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit lease preference')
    } finally {
      setSubmittingLeasePreference(false)
    }
  }

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8">
        <div className="ph-page-header">
          <p className="ph-page-eyebrow">Resident Workspace</p>
          <h2 className="ph-page-heading">Your property overview</h2>
          <p className="ph-page-description max-w-2xl text-sm">
          Stay on top of support activity, rent actions, and lease details from one focused resident surface.
          </p>
        </div>
        {authTenant?.organization ? (
          <div className="mt-4">
            <OrganizationBadge name={authTenant.organization.name} slug={authTenant.organization.slug} />
          </div>
        ) : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant summary..." rows={5} /> : null}

      {!loading && summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<LifeBuoy className="h-4 w-4" />} />
          <SummaryCard
            label="Pending Reminders"
            value={summary.pending_reminders}
            icon={<BellRing className="h-4 w-4" />}
          />
          <SummaryCard
            label="Monthly Rent"
            value={formatCurrency(summary.monthly_rent, authTenant?.organization?.currency_code)}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
          <SummaryCard label="Due Date" value={formatDate(summary.next_due_date)} icon={<CalendarClock className="h-4 w-4" />} />
        </div>
      ) : null}

      {!loading && !summary ? (
        <EmptyState
          title="No dashboard data yet"
          description="Your summary cards will appear once your account details are ready."
          icon={<CalendarClock className="h-5 w-5" />}
        />
      ) : null}

      {!loading && rentPaymentState?.is_visible ? (
        <div className="ph-surface-card rounded-xl p-5 sm:p-6">
          <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Rent payment verification</h3>
          <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
            Available from 7 days before due date and remains visible until approved by your owner.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Due Date</p>
              <p className="text-sm font-medium text-[var(--ph-text)]">{formatDate(rentPaymentState.due_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Amount</p>
              <p className="text-sm font-medium text-[var(--ph-text)]">
                {formatCurrency(rentPaymentState.amount_paid, rentPaymentState.currency_code)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Status</p>
              {rentPaymentState.status === 'eligible' ? (
                <StatusBadge status="pending" />
              ) : rentPaymentState.status === 'approved' ? (
                <StatusBadge status="paid" />
              ) : (
                <StatusBadge status={rentPaymentState.status} />
              )}
            </div>
          </div>

          {rentPaymentState.status === 'eligible' ? (
            <div className="mt-4">
              <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                {markingPaid ? 'Submitting...' : 'Mark Rent as Paid'}
              </Button>
            </div>
          ) : null}

          {rentPaymentState.status === 'awaiting_owner_approval' ? (
            <p className="mt-4 text-sm font-medium text-[#f3d49a]">Waiting for owner verification.</p>
          ) : null}

          {rentPaymentState.status === 'rejected' ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-red-200">Owner rejected this confirmation.</p>
              {rentPaymentState.rejection_reason ? (
                <p className="rounded-xl border border-red-500/26 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  Reason: {rentPaymentState.rejection_reason}
                </p>
              ) : null}
              <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                {markingPaid ? 'Resubmitting...' : 'Resubmit Mark as Paid'}
              </Button>
            </div>
          ) : null}

          {rentPaymentState.status === 'approved' ? (
            <p className="mt-4 text-sm font-medium text-emerald-200">Rent payment marked as paid for this cycle.</p>
          ) : null}
        </div>
      ) : null}

      {!loading && leaseRenewalIntentState?.eligible ? (
        <div className="ph-surface-card rounded-xl p-5 sm:p-6">
          <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Lease continuation preference</h3>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
            Your lease ends on <span className="font-semibold text-[var(--ph-text)]">{formatDate(leaseRenewalIntentState.lease_end_date)}</span>.
            Please confirm whether you wish to continue after this lease period.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">
            This response is shared by email with your owner and assigned broker (if available).
          </p>

          {leaseRenewalIntentState.already_responded ? (
            <p className="mt-4 rounded-xl border border-[rgba(83,88,100,0.42)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--ph-text)]">
              Response submitted:{' '}
              <span className="font-semibold">
                {leaseRenewalIntentState.current_response === 'yes' ? 'Yes, I want to continue' : 'No, I do not want to continue'}
              </span>
            </p>
          ) : null}

          {!leaseRenewalIntentState.already_responded ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={submittingLeasePreference}
                onClick={() => void handleLeasePreferenceSubmit('yes')}
              >
                {submittingLeasePreference ? 'Submitting...' : 'Yes, I want to continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submittingLeasePreference}
                onClick={() => void handleLeasePreferenceSubmit('no')}
              >
                {submittingLeasePreference ? 'Submitting...' : 'No, I do not want to continue'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {!loading && tenant ? (
          <div className="ph-surface-card rounded-xl p-5 sm:p-6">
            <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Lease & payment details</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Payment Status</p>
                <StatusBadge status={tenant.payment_status} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Lease Start</p>
                <p className="text-sm text-[var(--ph-text)]">{formatDate(tenant.lease_start_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Lease End</p>
                <p className="text-sm text-[var(--ph-text)]">{formatDate(tenant.lease_end_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">Next Due Date</p>
                <p className="text-sm text-[var(--ph-text)]">{formatDate(summary?.next_due_date)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && property ? (
          <div className="ph-surface-card rounded-xl p-5 sm:p-6">
            <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Property</h3>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--ph-text)]">
              <Home className="h-4 w-4 text-[var(--ph-accent)]" />
              {property.property_name}
            </p>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">{property.address}</p>
            {property.unit_number ? <p className="text-sm text-[var(--ph-text-muted)]">Unit: {property.unit_number}</p> : null}
          </div>
        ) : null}
      </div>

      {!loading && token ? <ConditionReportTenantPanel token={token} residentName={tenant?.full_name ?? authTenant?.full_name} /> : null}
    </section>
  )
}
