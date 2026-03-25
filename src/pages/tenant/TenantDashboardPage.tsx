import { useCallback, useEffect, useState } from 'react'
import { BellRing, CalendarClock, CircleDollarSign, Home, LifeBuoy } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { Property, Tenant, TenantRentPaymentState, TenantSummary } from '../../types/api'
import { formatCurrency, formatDate } from '../../utils/date'

export function TenantDashboardPage() {
  const { token, tenant: authTenant } = useTenantAuth()
  const [summary, setSummary] = useState<TenantSummary | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [rentPaymentState, setRentPaymentState] = useState<TenantRentPaymentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState(false)

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

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#92700A]">Resident Workspace</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">Your property overview</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          Stay on top of support activity, rent actions, and lease details from one focused resident surface.
        </p>
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
        <div className="rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-5">
          <h3 className="text-xl font-semibold text-[#1A1A1A]">Rent payment verification</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Available from 7 days before due date and remains visible until approved by your owner.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Due Date</p>
              <p className="text-sm font-medium text-[#1A1A1A]">{formatDate(rentPaymentState.due_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Amount</p>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {formatCurrency(rentPaymentState.amount_paid, rentPaymentState.currency_code)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Status</p>
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
            <p className="mt-4 text-sm font-medium text-[#D97706]">Waiting for owner verification.</p>
          ) : null}

          {rentPaymentState.status === 'rejected' ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-[#DC2626]">Owner rejected this confirmation.</p>
              {rentPaymentState.rejection_reason ? (
                <p className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-[#DC2626]">
                  Reason: {rentPaymentState.rejection_reason}
                </p>
              ) : null}
              <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                {markingPaid ? 'Resubmitting...' : 'Resubmit Mark as Paid'}
              </Button>
            </div>
          ) : null}

          {rentPaymentState.status === 'approved' ? (
            <p className="mt-4 text-sm font-medium text-[#059669]">Rent payment marked as paid for this cycle.</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {!loading && tenant ? (
          <div className="rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-5">
            <h3 className="text-xl font-semibold text-[#1A1A1A]">Lease & payment details</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Payment Status</p>
                <StatusBadge status={tenant.payment_status} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Lease Start</p>
                <p className="text-sm text-[#1A1A1A]">{formatDate(tenant.lease_start_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Lease End</p>
                <p className="text-sm text-[#1A1A1A]">{formatDate(tenant.lease_end_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Next Due Date</p>
                <p className="text-sm text-[#1A1A1A]">{formatDate(summary?.next_due_date)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && property ? (
          <div className="rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-5">
            <h3 className="text-xl font-semibold text-[#1A1A1A]">Property</h3>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#1A1A1A]">
              <Home className="h-4 w-4 text-[#FED609]" />
              {property.property_name}
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">{property.address}</p>
            {property.unit_number ? <p className="text-sm text-[#6B7280]">Unit: {property.unit_number}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
