import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormTextarea } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { dashboardFormPanelClassName } from '../../components/common/formTheme'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { TicketThreadTimeline } from '../../components/tickets/TicketThreadTimeline'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { AdminOrganizationRow, AdminTicketRow, PaginationMeta, SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const adminTicketStatuses: TenantTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']

export function AdminTicketsPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<AdminTicketRow[]>([])
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
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [statusValue, setStatusValue] = useState<TenantTicket['status']>('open')
  const [closingMessage, setClosingMessage] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [response, organizationsResponse] = await Promise.all([
          api.getAdminTickets(token, {
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
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder, organizationId])

  useEffect(() => {
    if (items.length === 0) {
      setSelectedTicketId(null)
      setThread(null)
      return
    }

    if (!selectedTicketId || !items.some((item) => item.id === selectedTicketId)) {
      setSelectedTicketId(items[0].id)
    }
  }, [items, selectedTicketId])

  useEffect(() => {
    const loadThread = async () => {
      if (!token || !selectedTicketId) {
        return
      }

      try {
        setThreadLoading(true)
        setThreadError(null)
        const response = await api.getAdminTicketDetail(token, selectedTicketId)
        setThread(response.thread)
        setStatusValue(response.thread.ticket.status)
        setClosingMessage('')
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket conversation')
      } finally {
        setThreadLoading(false)
      }
    }

    void loadThread()
  }, [token, selectedTicketId])

  const reloadList = async () => {
    if (!token) {
      return
    }

    const response = await api.getAdminTickets(token, {
      page: pagination.page,
      page_size: pagination.page_size,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
      organization_id: organizationId || undefined,
    })
    setItems(response.items)
    setPagination(response.pagination)
  }

  const reloadThread = async (ticketId: string) => {
    if (!token) {
      return
    }

    const response = await api.getAdminTicketDetail(token, ticketId)
    setThread(response.thread)
    setStatusValue(response.thread.ticket.status)
  }

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) {
      return
    }

    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyAdminTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([reloadList(), reloadThread(thread.ticket.id)])
    } catch (replyError) {
      setThreadError(replyError instanceof Error ? replyError.message : 'Failed to send admin reply')
    } finally {
      setReplyBusy(false)
    }
  }

  const handleStatusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread) {
      return
    }

    try {
      setStatusBusy(true)
      setThreadError(null)
      await api.updateAdminTicket(token, thread.ticket.id, {
        status: statusValue,
        closing_message: statusValue === 'closed' && closingMessage.trim().length > 0 ? closingMessage.trim() : undefined,
      })
      setClosingMessage('')
      await Promise.all([reloadList(), reloadThread(thread.ticket.id)])
    } catch (statusError) {
      setThreadError(statusError instanceof Error ? statusError.message : 'Failed to update ticket status')
    } finally {
      setStatusBusy(false)
    }
  }

  const ticketMeta = useMemo(() => {
    if (!thread) {
      return null
    }

    const tenant = thread.ticket.tenants
    const property = tenant?.properties

    return {
      tenantLabel: tenant ? `${tenant.full_name} (${tenant.tenant_access_id})` : '-',
      propertyLabel: property?.property_name ?? '-',
      unitLabel: property?.unit_number ?? '-',
    }
  }, [thread])

  return (
    <section className="ph-page-shell">
      <div className="ph-page-header">
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Support Tickets</h2>
        <p className="text-sm leading-relaxed text-[var(--ph-text-muted)]">Review full ticket conversations and step in when needed.</p>
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
          { value: 'status', label: 'Status' },
          { value: 'subject', label: 'Subject' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tickets..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No tickets found" description="No support tickets match the current filters." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Subject', 'Organization', 'Tenant', 'Owner', 'Status', 'Created', 'Actions']}>
            {items.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{ticket.subject}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{ticket.message}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <Link
                    to={ROUTES.adminOrganizationDetail.replace(':id', ticket.organization_id)}
                    className="inline-flex hover:opacity-90"
                  >
                    <OrganizationBadge name={ticket.organizations?.name} slug={ticket.organizations?.slug} />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.tenants?.full_name || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.owners?.email || '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(ticket.created_at)}</td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant={selectedTicketId === ticket.id ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    {selectedTicketId === ticket.id ? 'Viewing' : 'View thread'}
                  </Button>
                </td>
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

      {threadError ? <ErrorState message={threadError} /> : null}
      {threadLoading ? <LoadingState message="Loading ticket thread..." rows={4} /> : null}

      {!threadLoading && thread ? (
        <div className="space-y-4">
          <article className="ph-surface-card-strong rounded-xl p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Selected ticket</p>
                <h3 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">{thread.ticket.subject}</h3>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--ph-text-muted)]">
                  <span>Tenant: {ticketMeta?.tenantLabel}</span>
                  <span>Property: {ticketMeta?.propertyLabel}</span>
                  <span>Unit: {ticketMeta?.unitLabel}</span>
                  <span>Opened: {formatDateTime(thread.ticket.created_at)}</span>
                </div>
              </div>
              <StatusBadge status={thread.ticket.status} />
            </div>
          </article>

          <article className="ph-surface-card rounded-xl p-6 sm:p-7">
            <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Conversation</h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
              Admin replies appear in the same audited conversation thread seen by the tenant and owner.
            </p>
            <div className="mt-4">
              <TicketThreadTimeline messages={thread.messages} />
            </div>
          </article>

          {thread.ticket.status !== 'closed' ? (
            <TicketReplyComposer
              title="Reply as admin"
              description="Use this for interventions that should be visible across the full support thread."
              value={replyMessage}
              onChange={setReplyMessage}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send admin reply"
              placeholder="Write a clear operational update or resolution note."
            />
          ) : null}

          <form onSubmit={handleStatusSubmit} className={`${dashboardFormPanelClassName} space-y-4`}>
            <div>
              <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Update ticket status</h3>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                Closing from admin can include an optional note that is shown in the same ticket timeline.
              </p>
            </div>

            <FormSelect
              label="Status"
              value={statusValue}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setStatusValue(event.target.value as TenantTicket['status'])}
            >
              {adminTicketStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </FormSelect>

            {statusValue === 'closed' ? (
              <FormTextarea
                label="Closing message"
                rows={4}
                value={closingMessage}
                onChange={(event) => setClosingMessage(event.target.value)}
                placeholder="Optional closing message visible to the tenant."
              />
            ) : null}

            <Button type="submit" disabled={statusBusy}>
              {statusBusy ? 'Saving...' : statusValue === 'closed' ? 'Close ticket' : 'Update status'}
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  )
}
