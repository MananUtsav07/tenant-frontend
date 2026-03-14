import { useCallback, useEffect, useState } from 'react'
import { LifeBuoy, TicketX } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { TicketTable } from '../../components/common/TicketTable'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TenantTicket } from '../../types/api'

const ownerTicketStatuses: TenantTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']

export function OwnerTicketsPage() {
  const { token } = useOwnerAuth()
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleStatusChange = async (ticket: TenantTicket, status: TenantTicket['status']) => {
    if (!token || ticket.status === status) {
      return
    }

    try {
      setError(null)
      await api.updateOwnerTicket(token, ticket.id, status)
      await loadTickets()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update ticket status')
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <LifeBuoy className="h-6 w-6 text-[var(--ph-accent)]" />
          Support Tickets
        </h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Track and update tenant requests.</p>
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
            <FormSelect
              label="Ticket status"
              hideLabel
              value={ticket.status}
              onChange={(event) => void handleStatusChange(ticket, event.target.value as TenantTicket['status'])}
              wrapperClassName="gap-0"
              className="min-h-10 rounded-xl px-3 py-2 text-xs"
            >
              {ownerTicketStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </FormSelect>
          )}
        />
      ) : null}
    </section>
  )
}





