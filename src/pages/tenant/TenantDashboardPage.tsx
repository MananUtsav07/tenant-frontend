import { useEffect, useState } from 'react'
import { BellRing, CalendarClock, CircleDollarSign, Home, LifeBuoy } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { Property, Tenant, TenantSummary } from '../../types/api'
import { formatCurrencyInr, formatDate } from '../../utils/date'

export function TenantDashboardPage() {
  const { token, tenant: authTenant } = useTenantAuth()
  const [summary, setSummary] = useState<TenantSummary | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
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
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant dashboard')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Tenant Dashboard</h2>
        <p className="text-sm text-slate-400">Your rent and support overview.</p>
        {authTenant?.organization ? (
          <div className="mt-2">
            <OrganizationBadge name={authTenant.organization.name} slug={authTenant.organization.slug} />
          </div>
        ) : null}
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant summary..." rows={4} /> : null}

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
            value={formatCurrencyInr(summary.monthly_rent)}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
          <SummaryCard label="Due Day" value={summary.payment_due_day} icon={<CalendarClock className="h-4 w-4" />} />
        </div>
      ) : null}

      {!loading && !summary ? (
        <EmptyState
          title="No dashboard data yet"
          description="Your summary cards will appear once your account details are ready."
          icon={<CalendarClock className="h-5 w-5" />}
        />
      ) : null}

      {!loading && tenant ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Lease & Payment Details</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-400">Payment Status</p>
              <StatusBadge status={tenant.payment_status} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Lease Start</p>
              <p className="text-sm text-slate-800">{formatDate(tenant.lease_start_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Lease End</p>
              <p className="text-sm text-slate-800">{formatDate(tenant.lease_end_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Next Due Date</p>
              <p className="text-sm text-slate-800">{formatDate(summary?.next_due_date)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && property ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-semibold text-slate-900">Property</h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
            <Home className="h-4 w-4 text-blue-600" />
            {property.property_name}
          </p>
          <p className="text-sm text-slate-400">{property.address}</p>
          {property.unit_number ? <p className="text-sm text-slate-400">Unit: {property.unit_number}</p> : null}
        </div>
      ) : null}
    </section>
  )
}





