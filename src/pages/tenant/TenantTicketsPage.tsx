import { LifeBuoy, Plus, TicketX } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput, FormTextarea } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketTable } from '../../components/common/TicketTable'
import { dashboardFormPanelClassName } from '../../components/common/formTheme'
import { TicketReplyComposer } from '../../components/tickets/TicketReplyComposer'
import { TicketThreadTimeline } from '../../components/tickets/TicketThreadTimeline'
import { MaintenanceWorkflowTenantPanel } from '../../components/tickets/MaintenanceWorkflowTenantPanel'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

export function TenantTicketsPage() {
  const { token } = useTenantAuth()
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [thread, setThread] = useState<SupportTicketThread | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)

  const loadTickets = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getTenantTickets(token)
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

    if (!selectedTicketId || !tickets.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  const loadThread = useCallback(
    async (ticketId: string) => {
      if (!token) {
        return
      }

      try {
        setThreadLoading(true)
        setThreadError(null)
        const response = await api.getTenantTicketDetail(token, ticketId)
        setThread(response.thread)
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      const response = await api.createTenantTicket(token, { subject, message })
      setSubject('')
      setMessage('')
      await loadTickets()
      setSelectedTicketId(response.ticket.id)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create ticket')
    } finally {
      setBusy(false)
    }
  }

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !thread || replyMessage.trim().length === 0) {
      return
    }

    try {
      setReplyBusy(true)
      setThreadError(null)
      await api.replyTenantTicket(token, thread.ticket.id, { message: replyMessage.trim() })
      setReplyMessage('')
      await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
    } catch (replyError) {
      setThreadError(replyError instanceof Error ? replyError.message : 'Failed to send reply')
    } finally {
      setReplyBusy(false)
    }
  }

  const canReply = thread?.ticket.status !== 'closed'
  const ticketMeta = useMemo(() => {
    if (!thread) {
      return null
    }

    return {
      openedAt: formatDateTime(thread.ticket.created_at),
      status: thread.ticket.status,
    }
  }, [thread])

  return (
    <section className="ph-page-shell">
      <div className="ph-page-header">
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <LifeBuoy className="h-6 w-6 text-[var(--ph-accent)]" />
          Support Tickets
        </h2>
        <p className="text-sm leading-relaxed text-[var(--ph-text-muted)]">Raise requests and follow the full reply history from your property team.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${dashboardFormPanelClassName} space-y-4`}>
        <FormInput
          label="Subject"
          name="tenant_ticket_subject"
          autoComplete="off"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
        />
        <FormTextarea
          label="Message"
          name="tenant_ticket_message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <Button type="submit" disabled={busy} variant="primary" iconLeft={<Plus className="h-4 w-4" />}>
          {busy ? 'Submitting...' : 'Raise Ticket'}
        </Button>
      </form>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading ticket history..." rows={4} /> : null}

      {!loading && tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Submit your first support ticket above."
          icon={<TicketX className="h-5 w-5" />}
          actionLabel="Start Ticket"
          onAction={() => {
            const subjectInput = document.querySelector<HTMLInputElement>('input[name="tenant_ticket_subject"]')
            subjectInput?.focus()
          }}
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
              onClick={() => setSelectedTicketId(ticket.id)}
            >
              {selectedTicketId === ticket.id ? 'Viewing' : 'View thread'}
            </Button>
          )}
        />
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
                <p className="mt-3 text-sm text-[var(--ph-text-muted)]">Opened: {ticketMeta?.openedAt}</p>
              </div>
              <StatusBadge status={ticketMeta?.status ?? thread.ticket.status} />
            </div>
          </article>

          <article className="ph-surface-card rounded-xl p-6 sm:p-7">
            <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Conversation</h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
              The original ticket, owner replies, and closing notes all appear here in order.
            </p>
            <div className="mt-4">
              <TicketThreadTimeline messages={thread.messages} />
            </div>
          </article>

          {token ? (
            <MaintenanceWorkflowTenantPanel
              token={token}
              ticketId={thread.ticket.id}
              onWorkflowChanged={async () => {
                await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
              }}
            />
          ) : null}

          {canReply ? (
            <TicketReplyComposer
              title="Reply to this ticket"
              description="Your reply is added to the permanent support history and sent to the property team."
              value={replyMessage}
              onChange={setReplyMessage}
              onSubmit={handleReplySubmit}
              busy={replyBusy}
              submitLabel="Send reply"
              placeholder="Add any update, clarification, or follow-up detail."
            />
          ) : (
            <article className={`${dashboardFormPanelClassName} space-y-2`}>
              <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Ticket closed</h3>
              <p className="text-sm text-[var(--ph-text-muted)]">
                This ticket is closed. Review the thread above for the final owner response or closing note.
              </p>
            </article>
          )}
        </div>
      ) : null}
    </section>
  )
}
