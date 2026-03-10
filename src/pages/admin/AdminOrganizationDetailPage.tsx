import { CreditCard, Home, Ticket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { AdminOrganizationDetail } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAdminAuth()

  const [detail, setDetail] = useState<AdminOrganizationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token || !id) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await api.getAdminOrganizationDetail(token, id)
        setDetail(response.detail)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load organization detail')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, id])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Organization Detail</h2>
          <p className="text-sm text-slate-400">Operational view across users, properties, tickets, and subscriptions.</p>
        </div>
        <Link to={ROUTES.adminOrganizations} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Back to organizations
        </Link>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading organization detail..." rows={6} /> : null}

      {!loading && !detail ? (
        <EmptyState title="Organization not found" description="This organization does not exist or was removed." />
      ) : null}

      {!loading && detail ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <OrganizationBadge name={detail.organization.name} slug={detail.organization.slug} />
            <p className="mt-2 text-sm text-slate-400">
              Plan: <span className="font-medium text-slate-700">{detail.organization.plan_code || 'starter'}</span>
            </p>
            <p className="text-xs text-slate-500">Created: {formatDateTime(detail.organization.created_at)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Owners" value={detail.owners.length} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Tenants" value={detail.tenants.length} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Properties" value={detail.properties.length} icon={<Home className="h-4 w-4" />} />
            <SummaryCard label="Tickets" value={detail.tickets.length} icon={<Ticket className="h-4 w-4" />} />
            <SummaryCard label="Subscriptions" value={detail.subscriptions.length} icon={<CreditCard className="h-4 w-4" />} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-lg font-semibold text-slate-900">Owners</h3>
              <DataTable headers={['Name', 'Email', 'Company', 'Created']}>
                {detail.owners.map((owner) => (
                  <tr key={owner.id}>
                    <td className="px-4 py-3 text-slate-700">{owner.full_name || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{owner.email}</td>
                    <td className="px-4 py-3 text-slate-600">{owner.company_name || '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(owner.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-lg font-semibold text-slate-900">Subscriptions</h3>
              <DataTable headers={['Plan', 'Status', 'Subscription ID', 'Period End']}>
                {detail.subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-4 py-3 text-slate-700">{subscription.plan_code}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={subscription.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{subscription.id}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(subscription.current_period_end)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
              <DataTable headers={['Property', 'Address', 'Created']}>
                {detail.properties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-4 py-3 text-slate-700">{property.property_name}</td>
                    <td className="px-4 py-3 text-slate-600">{property.address}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(property.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-lg font-semibold text-slate-900">Tickets</h3>
              <DataTable headers={['Subject', 'Status', 'Created']}>
                {detail.tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-3 text-slate-700">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(ticket.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-lg font-semibold text-slate-900">Tenants</h3>
            <DataTable headers={['Tenant', 'Access ID', 'Status', 'Created']}>
              {detail.tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-3 text-slate-700">{tenant.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{tenant.tenant_access_id}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(tenant.created_at)}</td>
                </tr>
              ))}
            </DataTable>
          </article>
        </>
      ) : null}
    </section>
  )
}



