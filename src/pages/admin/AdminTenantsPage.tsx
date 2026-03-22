import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { AdminOrganizationRow, AdminTenantRow, PaginationMeta } from '../../types/api'
import { formatCurrency, formatDateTime } from '../../utils/date'

export function AdminTenantsPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminTenantRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [organizationId, setOrganizationId] = useState('')
  const [organizationOptions, setOrganizationOptions] = useState<AdminOrganizationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [response, organizationsResponse] = await Promise.all([
          api.getAdminTenants(token, {
            page: pagination.page,
            page_size: pagination.page_size,
            search,
            sort_by: sortBy,
            sort_order: sortOrder,
            organization_id: organizationId || undefined,
          }),
          api.getAdminOrganizations(token, {
            page: 1,
            page_size: 100,
            sort_by: 'name',
            sort_order: 'asc',
          }),
        ])
        setItems(response.items)
        setPagination(response.pagination)
        setOrganizationOptions(organizationsResponse.items)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tenants')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder, organizationId])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Tenants</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">View all tenant accounts and payment state across owners.</p>
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortBy={sortBy}
        onSortByChange={(value) => {
          setSortBy(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => {
          setSortOrder(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        organizationId={organizationId}
        onOrganizationIdChange={(value) => {
          setOrganizationId(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        organizationOptions={organizationOptions.map((organization) => ({
          value: organization.id,
          label: organization.name,
        }))}
        sortOptions={[
          { value: 'created_at', label: 'Created' },
          { value: 'full_name', label: 'Name' },
          { value: 'payment_status', label: 'Payment Status' },
          { value: 'status', label: 'Tenant Status' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenants..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No tenants found" description="Try adjusting your filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Tenant', 'Organization', 'Access ID', 'Property', 'Rent', 'Status', 'Created']}>
            {items.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{tenant.full_name}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{tenant.email || tenant.owners?.email || 'No email'}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <Link
                    to={ROUTES.adminOrganizationDetail.replace(':id', tenant.organization_id)}
                    className="inline-flex hover:opacity-90"
                  >
                    <OrganizationBadge name={tenant.organizations?.name} slug={tenant.organizations?.slug} />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{tenant.tenant_access_id}</td>
                <td className="px-4 py-3 text-slate-600">
                  {tenant.properties?.property_name || '-'}
                  {tenant.properties?.unit_number ? ` (${tenant.properties.unit_number})` : ''}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatCurrency(tenant.monthly_rent, tenant.organizations?.currency_code)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={tenant.payment_status} />
                    <StatusBadge status={tenant.status} />
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(tenant.created_at)}</td>
              </tr>
            ))}
          </DataTable>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
          />
        </>
      ) : null}
    </section>
  )
}



