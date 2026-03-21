import { Hammer, Search, Wrench } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { dashboardInfoPanelClassName } from '../../components/common/formTheme'
import { MaintenanceWorkflowOwnerPanel } from '../../components/maintenance/MaintenanceWorkflowOwnerPanel'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { SupportTicketThread, TenantTicket } from '../../types/api'
import { formatDateTime } from '../../utils/date'

const maintenanceKeywords = [
  'maintenance',
  'repair',
  'broken',
  'leak',
  'plumbing',
  'electrical',
  'hvac',
  'ac',
  'air conditioning',
  'water',
  'pipe',
  'toilet',
  'sink',
  'door',
  'lock',
  'window',
  'pest',
  'appliance',
  'fridge',
  'washing machine',
  'heater',
  'paint',
  'ceiling',
  'mold',
]

function getMaintenanceSignalScore(ticket: TenantTicket) {
  const haystack = `${ticket.subject} ${ticket.message}`.toLowerCase()
  const keywordMatches = maintenanceKeywords.reduce((count, keyword) => (haystack.includes(keyword) ? count + 1 : count), 0)

  if (ticket.status === 'open') {
    return keywordMatches + 2
  }

  if (ticket.status === 'in_progress') {
    return keywordMatches + 1
  }

  return keywordMatches
}

export function OwnerMaintenancePage() {
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
  const [search, setSearch] = useState('')

  const loadTickets = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerTickets(token)
      setTickets(response.tickets)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tickets for maintenance')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const visibleTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tickets
      .filter((ticket) => ticket.status !== 'closed')
      .map((ticket) => ({
        ticket,
        score: getMaintenanceSignalScore(ticket),
      }))
      .filter(({ ticket }) =>
        normalizedSearch.length === 0 ? true : `${ticket.subject} ${ticket.message}`.toLowerCase().includes(normalizedSearch),
      )
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        return new Date(right.ticket.updated_at).getTime() - new Date(left.ticket.updated_at).getTime()
      })
  }, [search, tickets])

  useEffect(() => {
    if (visibleTickets.length === 0) {
      setSelectedTicketId(null)
      setThread(null)
      return
    }

    const availableIds = new Set(visibleTickets.map((entry) => entry.ticket.id))
    const nextTicketId =
      (selectedTicketParam && availableIds.has(selectedTicketParam) ? selectedTicketParam : null) ??
      (selectedTicketId && availableIds.has(selectedTicketId) ? selectedTicketId : null) ??
      visibleTickets[0].ticket.id

    if (nextTicketId !== selectedTicketId) {
      setSelectedTicketId(nextTicketId)
    }

    if (searchParams.get('ticket') !== nextTicketId) {
      setSearchParams({ ticket: nextTicketId }, { replace: true })
    }
  }, [searchParams, selectedTicketId, selectedTicketParam, setSearchParams, visibleTickets])

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
      } catch (loadError) {
        setThreadError(loadError instanceof Error ? loadError.message : 'Failed to load ticket context')
      } finally {
        setThreadLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!selectedTicketId) {
      setThread(null)
      return
    }

    void loadThread(selectedTicketId)
  }, [loadThread, selectedTicketId])

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
    setSearchParams({ ticket: ticketId })
  }

  const selectedTicketSignal = visibleTickets.find((entry) => entry.ticket.id === selectedTicketId)?.score ?? 0
  const likelyMaintenanceCount = visibleTickets.filter((entry) => entry.score > 0).length

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Owner Maintenance Desk</p>
            <h2 className="ph-title mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-[var(--ph-text)]">
              <Hammer className="h-7 w-7 text-[var(--ph-accent)]" />
              Maintenance
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Select a ticket and handle contractor triage, quotes, approvals, booking, and completion from one dedicated
              workspace.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:min-w-[240px] sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Active tickets</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{visibleTickets.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Likely maintenance</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{likelyMaintenanceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading maintenance tickets..." rows={6} /> : null}

      {!loading && visibleTickets.length === 0 ? (
        <EmptyState
          title="No maintenance tickets ready"
          description="Open and in-progress support tickets will appear here when they need maintenance handling."
          icon={<Wrench className="h-5 w-5" />}
          actionLabel="Open Tickets"
          actionHref={ROUTES.ownerTickets}
        />
      ) : null}

      {!loading && visibleTickets.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside>
            <article className="ph-surface-card rounded-xl p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f1cb85]">Ticket Queue</p>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">Choose a ticket to open the maintenance workflow.</p>
              </div>

              <FormInput
                label="Search maintenance tickets"
                hideLabel
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Search subject or issue details"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="mt-5 space-y-3">
                {visibleTickets.map(({ ticket, score }) => {
                  const isSelected = selectedTicketId === ticket.id

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => handleSelectTicket(ticket.id)}
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        isSelected
                          ? 'border-[rgba(240,163,35,0.28)] bg-[rgba(240,163,35,0.08)] shadow-[0_24px_52px_-36px_rgba(240,163,35,0.38)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-[rgba(151,105,34,0.34)] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--ph-text)]">{ticket.subject}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{ticket.message}</p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--ph-text-muted)]">
                        <span>Updated {formatDateTime(ticket.updated_at)}</span>
                        {score > 0 ? (
                          <span className="inline-flex items-center rounded-full border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] px-2.5 py-1 font-semibold text-[#f3d49a]">
                            Likely maintenance
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-semibold">
                            Review manually
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </article>
          </aside>

          <div className="space-y-4">
            {threadError ? <ErrorState message={threadError} /> : null}
            {threadLoading ? <LoadingState message="Loading maintenance ticket context..." rows={4} /> : null}

            {!threadLoading && thread ? (
              <>
                <article className="ph-surface-card rounded-xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1cb85]">Selected issue</p>
                      <h3 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">{thread.ticket.subject}</h3>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--ph-text-muted)]">
                        <span>Tenant: {thread.ticket.tenants?.full_name ?? 'Tenant unavailable'}</span>
                        <span>Property: {thread.ticket.tenants?.properties?.property_name ?? 'Property unavailable'}</span>
                        <span>Unit: {thread.ticket.tenants?.properties?.unit_number ?? '-'}</span>
                        <span>Opened: {formatDateTime(thread.ticket.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTicketSignal > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f3d49a]">
                          Maintenance fit
                        </span>
                      ) : null}
                      <StatusBadge status={thread.ticket.status} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-white/10 bg-[rgba(9,14,26,0.72)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Ticket context</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-soft)]">{thread.ticket.message}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button to={`${ROUTES.ownerTickets}?ticket=${thread.ticket.id}`} variant="outline" size="sm">
                      Open ticket thread
                    </Button>
                  </div>
                </article>

                <MaintenanceWorkflowOwnerPanel
                  token={token!}
                  ticketId={thread.ticket.id}
                  onWorkflowChanged={async () => {
                    await Promise.all([loadTickets(), loadThread(thread.ticket.id)])
                  }}
                />
              </>
            ) : null}

            {!threadLoading && !thread && !threadError ? (
              <div className={dashboardInfoPanelClassName}>
                Select a ticket from the queue to open the maintenance workflow.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
