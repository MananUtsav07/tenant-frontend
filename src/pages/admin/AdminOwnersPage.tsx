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
import type { AdminOwnerRow, AdminOrganizationRow, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminOwnersPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminOwnerRow[]>([])
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
        setError(null)
        setLoading(true)
        const [response, organizationsResponse] = await Promise.all([
          api.getAdminOwners(token, {
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
        setError(loadError instanceof Error ? loadError.message : 'Failed to load owners')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder, organizationId])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Owners</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Manage and audit owner accounts across organizations.</p>
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
          { value: 'email', label: 'Email' },
          { value: 'full_name', label: 'Full Name' },
          { value: 'company_name', label: 'Company' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading owners..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No owners found" description="Try adjusting your search, sort, or organization filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Owner', 'Organization', 'Company', 'Support', 'Created']}>
            {items.map((owner) => (
              <tr key={owner.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{owner.full_name || 'Unnamed owner'}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{owner.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <Link
                    to={ROUTES.adminOrganizationDetail.replace(':id', owner.organization_id)}
                    className="inline-flex hover:opacity-90"
                  >
                    <OrganizationBadge name={owner.organizations?.name} slug={owner.organizations?.slug} />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{owner.company_name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{owner.support_email || '-'}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(owner.created_at)}</td>
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



