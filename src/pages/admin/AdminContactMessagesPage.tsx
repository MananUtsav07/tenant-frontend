import { useEffect, useState } from 'react'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type { AdminOrganizationRow, ContactMessage, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function AdminContactMessagesPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<ContactMessage[]>([])
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
          api.getAdminContactMessages(token, {
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
        setError(loadError instanceof Error ? loadError.message : 'Failed to load contact messages')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder, organizationId])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Contact Messages</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">All public contact-form submissions.</p>
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
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading contact messages..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No contact messages found" description="No submissions match current filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Name', 'Organization', 'Email', 'Message', 'Date']}>
            {items.map((message) => (
              <tr key={message.id}>
                <td className="px-4 py-3 text-[var(--ph-text)]">{message.name}</td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">
                  {message.organizations ? (
                    <OrganizationBadge name={message.organizations.name} slug={message.organizations.slug} />
                  ) : (
                    <span className="text-xs text-[var(--ph-text-muted)]">Public</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">{message.email}</td>
                <td className="max-w-xl px-4 py-3 text-[var(--ph-text-soft)]">{message.message}</td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(message.created_at)}</td>
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



