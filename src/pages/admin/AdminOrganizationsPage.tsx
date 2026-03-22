import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { AdminOrganizationRow, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminOrganizationsPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminOrganizationRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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
        const response = await api.getAdminOrganizations(token, {
          page: pagination.page,
          page_size: pagination.page_size,
          search,
          sort_by: sortBy,
          sort_order: sortOrder,
        })
        setItems(response.items)
        setPagination(response.pagination)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load organizations')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Organizations</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Tenant organizations onboarded to the platform.</p>
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
        sortOptions={[
          { value: 'created_at', label: 'Created' },
          { value: 'name', label: 'Name' },
          { value: 'slug', label: 'Slug' },
          { value: 'plan_code', label: 'Plan' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading organizations..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No organizations found" description="No organizations match your current filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Organization', 'Plan', 'Owners', 'Tenants', 'Properties', 'Subscriptions', 'Created']}>
            {items.map((organization) => (
              <tr key={organization.id}>
                <td className="px-4 py-3">
                  <Link to={ROUTES.adminOrganizationDetail.replace(':id', organization.id)} className="inline-flex hover:opacity-90">
                    <OrganizationBadge name={organization.name} slug={organization.slug} />
                  </Link>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{organization.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{organization.plan_code || 'starter'}</td>
                <td className="px-4 py-3 text-slate-600">{organization.counts.owners}</td>
                <td className="px-4 py-3 text-slate-600">{organization.counts.tenants}</td>
                <td className="px-4 py-3 text-slate-600">{organization.counts.properties}</td>
                <td className="px-4 py-3 text-slate-600">{organization.counts.subscriptions}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(organization.created_at)}</td>
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


