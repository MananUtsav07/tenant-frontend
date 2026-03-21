import { CreditCard, Home, Ticket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '../../components/common/Button'
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
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="ph-page-eyebrow">Admin Organization View</p>
            <h2 className="ph-page-heading">Organization detail</h2>
            <p className="ph-page-description">
              Operational view across users, properties, tickets, and subscriptions without the old bright admin-card treatment.
            </p>
          </div>
          <Button to={ROUTES.adminOrganizations} variant="outline" size="sm">
            Back to organizations
          </Button>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading organization detail..." rows={6} /> : null}

      {!loading && !detail ? (
        <EmptyState title="Organization not found" description="This organization does not exist or was removed." />
      ) : null}

      {!loading && detail ? (
        <>
          <div className="ph-surface-card rounded-xl p-5 sm:p-6">
            <OrganizationBadge name={detail.organization.name} slug={detail.organization.slug} />
            <p className="mt-3 text-sm text-[var(--ph-text-muted)]">
              Plan: <span className="font-medium text-[var(--ph-text)]">{detail.organization.plan_code || 'starter'}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--ph-text-muted)]">Created: {formatDateTime(detail.organization.created_at)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Owners" value={detail.owners.length} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Tenants" value={detail.tenants.length} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Properties" value={detail.properties.length} icon={<Home className="h-4 w-4" />} />
            <SummaryCard label="Tickets" value={detail.tickets.length} icon={<Ticket className="h-4 w-4" />} />
            <SummaryCard label="Subscriptions" value={detail.subscriptions.length} icon={<CreditCard className="h-4 w-4" />} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="ph-surface-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-[var(--ph-text)]">Owners</h3>
              <DataTable headers={['Name', 'Email', 'Company', 'Created']}>
                {detail.owners.map((owner) => (
                  <tr key={owner.id}>
                    <td className="px-4 py-3 text-[var(--ph-text)]">{owner.full_name || '-'}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{owner.email}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{owner.company_name || '-'}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(owner.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="ph-surface-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-[var(--ph-text)]">Subscriptions</h3>
              <DataTable headers={['Plan', 'Status', 'Subscription ID', 'Period End']}>
                {detail.subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-4 py-3 text-[var(--ph-text)]">{subscription.plan_code}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={subscription.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{subscription.id}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(subscription.current_period_end)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="ph-surface-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-[var(--ph-text)]">Properties</h3>
              <DataTable headers={['Property', 'Address', 'Created']}>
                {detail.properties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-4 py-3 text-[var(--ph-text)]">{property.property_name}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{property.address}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(property.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>

            <article className="ph-surface-card rounded-xl p-5">
              <h3 className="text-lg font-semibold text-[var(--ph-text)]">Tickets</h3>
              <DataTable headers={['Subject', 'Status', 'Created']}>
                {detail.tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-3 text-[var(--ph-text)]">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(ticket.created_at)}</td>
                  </tr>
                ))}
              </DataTable>
            </article>
          </div>

          <article className="ph-surface-card rounded-xl p-5">
            <h3 className="text-lg font-semibold text-[var(--ph-text)]">Tenants</h3>
            <DataTable headers={['Tenant', 'Access ID', 'Status', 'Created']}>
              {detail.tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-3 text-[var(--ph-text)]">{tenant.full_name}</td>
                  <td className="px-4 py-3 text-[var(--ph-text-soft)]">{tenant.tenant_access_id}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(tenant.created_at)}</td>
                </tr>
              ))}
            </DataTable>
          </article>
        </>
      ) : null}
    </section>
  )
}
