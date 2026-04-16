import { useEffect, useState } from 'react'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type { AdminPropertyRow, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminPropertiesPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminPropertyRow[]>([])
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
        const response = await api.getAdminProperties(token, {
          page: pagination.page,
          page_size: pagination.page_size,
          search,
          sort_by: sortBy,
          sort_order: sortOrder,
        })
        setItems(response.items)
        setPagination(response.pagination)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Properties</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Property records across all owner portfolios.</p>
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
          { value: 'property_name', label: 'Property Name' },
          { value: 'address', label: 'Address' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading properties..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No properties found" description="Try changing filters to broaden results." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Property', 'Address', 'Owner', 'Created']}>
            {items.map((property) => (
              <tr key={property.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{property.property_name}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{property.unit_number || 'No unit'}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{property.address}</td>
                <td className="px-4 py-3 text-slate-600">{property.owners?.email || '-'}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(property.created_at)}</td>
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
