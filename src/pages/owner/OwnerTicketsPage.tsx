import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowUpRight, LifeBuoy, TicketX } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormTextarea } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketTable } from '../../components/common/TicketTable'
import { dashboardFormPanelClassName } from '../../components/common/formTheme'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { TicketThreadTimeline } from '../../components/tickets/TicketThreadTimeline'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const ownerTicketStatuses: TenantTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']

export function OwnerTicketsPage() {
  const { token } = useOwnerAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTicketParam = searchParams.get('ticket')
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(selectedTicketParam)
  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [statusValue, setStatusValue] = useState<TenantTicket['status']>('open')
  const [closingMessage, setClosingMessage] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  const loadTickets = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerTickets(token)
      setTickets(response.tickets)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  useEffect(() => {
    if (tickets.length === 0) {
      setSelectedTicketId(null)
      setThread(null)
      return
    }

    if (selectedTicketParam && tickets.some((ticket) => ticket.id === selectedTicketParam)) {
      if (selectedTicketId !== selectedTicketParam) {
        setSelectedTicketId(selectedTicketParam)
      }
      return
    }

    if (!selectedTicketId || !tickets.some((ticket) => ticket.id === selectedTicketId)) {
      const nextTicketId = tickets[0].id
      setSelectedTicketId(nextTicketId)
      setSearchParams({ ticket: nextTicketId }, { replace: true })
    }
  }, [selectedTicketId, selectedTicketParam, setSearchParams, tickets])

  const loadThread = useCallback(
    async (ticketId: string) => {
      if (!token) {
        return
      }

      try {
        setThreadLoading(true)
        setThreadError(null)
        const response = await api.getOwnerTicketDetail(token, ticketId)
        setThread(response.thread)
        setStatusValue(response.thread.ticket.status)
        setClosingMessage('')
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket conversation')
      } finally {
        setThreadLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!selectedTicketId) {
      return
    }

    void loadThread(selectedTicketId)
  }, [selectedTicketId, loadThread])

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) {
      return
    }

    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyOwnerTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
    } catch (replyError) {
      setThreadError(replyError instanceof Error ? replyError.message : 'Failed to send reply')
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
      await api.updateOwnerTicket(token, thread.ticket.id, {
        status: statusValue,
        closing_message: statusValue === 'closed' && closingMessage.trim().length > 0 ? closingMessage.trim() : undefined,
      })
      setClosingMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
    } catch (statusError) {
      setThreadError(statusError instanceof Error ? statusError.message : 'Failed to update ticket status')
    } finally {
      setStatusBusy(false)
    }
  }

  const ticketSummary = useMemo(() => {
    if (!thread) {
      return null
    }

    const tenant = thread.ticket.tenants
    const property = tenant?.properties

    return {
      tenantLabel: tenant ? `${tenant.full_name} (${tenant.tenant_access_id})` : 'Tenant unavailable',
      propertyLabel: property?.property_name ?? 'Property unavailable',
      unitLabel: property?.unit_number ?? '-',
    }
  }, [thread])

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setSearchParams({ ticket: ticketId })
  }

  return (
    <section className="ph-page-shell">
      <div className="ph-page-header">
        <h2 className="ph-title inline-flex items-center gap-2 text-xl font-semibold text-[var(--ph-text)]">
          <LifeBuoy className="h-5 w-5 text-[var(--ph-accent)]" />
          Support Tickets
        </h2>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading owner tickets..." rows={5} /> : null}

      {!loading && tickets.length === 0 ? (
        <EmptyState
          title="No tickets"
          description="New tenant tickets will appear here after tenants submit support requests."
          icon={<TicketX className="h-5 w-5" />}
          actionLabel="Go to Tenants"
          actionHref={ROUTES.ownerTenants}
        />
      ) : null}

      {!loading && tickets.length > 0 ? (
        <TicketTable
          tickets={tickets}
          action={(ticket) => (
            <Button
              type="button"
              variant={selectedTicketId === ticket.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleSelectTicket(ticket.id)}
            >
              {selectedTicketId === ticket.id ? 'Viewing' : 'View thread'}
            </Button>
          )}
        />
      ) : null}

      {threadError ? <ErrorState message={threadError} /> : null}
      {threadLoading ? <LoadingState message="Loading ticket thread..." rows={4} /> : null}

      {!threadLoading && thread ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(83,88,100,0.14)] pb-5">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--ph-text)]">{thread.ticket.subject}</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--ph-text-muted)]">
                <span>Tenant: {ticketSummary?.tenantLabel}</span>
                <span>Property: {ticketSummary?.propertyLabel}</span>
                <span>Unit: {ticketSummary?.unitLabel}</span>
                <span>Opened: {formatDateTime(thread.ticket.created_at)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={thread.ticket.status} />
              <Button
                to={`${ROUTES.ownerMaintenance}?ticket=${thread.ticket.id}`}
                variant="outline"
                size="sm"
                iconRight={<ArrowUpRight className="h-4 w-4" />}
              >
                Open in Maintenance
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-medium text-[var(--ph-text-muted)]">Conversation</p>
            <TicketThreadTimeline messages={thread.messages} />
          </div>

          {thread.ticket.status !== 'closed' ? (
            <TicketReplyComposer
              title="Reply to tenant"
              description="Replies are added to the permanent ticket history and shared with the tenant."
              value={replyMessage}
              onChange={setReplyMessage}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send reply"
              placeholder="Write a clear next step, update, or resolution note."
            />
          ) : (
            <article className={`${dashboardFormPanelClassName} space-y-2`}>
              <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Ticket is closed</h3>
              <p className="text-sm text-[var(--ph-text-muted)]">
                This ticket is closed. Reopen it below if you need to continue the thread.
              </p>
            </article>
          )}

          <form onSubmit={handleStatusSubmit} className={`${dashboardFormPanelClassName} space-y-4`}>
            <div>
              <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Update ticket status</h3>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                Closing a ticket can include an optional note that becomes part of the conversation timeline.
              </p>
            </div>

            <FormSelect
              label="Status"
              value={statusValue}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setStatusValue(event.target.value as TenantTicket['status'])}
            >
              {ownerTicketStatuses.map((status) => (
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
                placeholder="Optional closing note visible to the tenant."
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
