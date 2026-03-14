import { useEffect, useState } from 'react'
import { Building2, Inbox, Mail, MessageSquare, Phone } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { TicketTable } from '../../components/common/TicketTable'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TenantOwnerContact, TenantTicket } from '../../types/api'

export function TenantSupportPage() {
  const { token } = useTenantAuth()
  const [ownerContact, setOwnerContact] = useState<TenantOwnerContact | null>(null)
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return
      }

      try {
        setError(null)
        const [contactResponse, ticketsResponse] = await Promise.all([
          api.getTenantOwnerContact(token),
          api.getTenantTickets(token),
        ])
        setOwnerContact(contactResponse.owner)
        setTickets(ticketsResponse.tickets)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load support details')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  return (
    <section className="space-y-6">
      <div>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <MessageSquare className="h-6 w-6 text-[var(--ph-accent)]" />
          Support
        </h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Owner support contact and recent support activity.</p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading support details..." rows={4} /> : null}

      {!loading && ownerContact ? (
        <div className="ph-form-panel rounded-[1.75rem] p-5">
          <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">Owner Contact</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--ph-text-soft)]">
            <p className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--ph-accent)]" />
              Company: {ownerContact.company_name || '-'}
            </p>
            <p className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--ph-accent)]" />
              Email: {ownerContact.support_email || '-'}
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-[var(--ph-accent)]" />
              WhatsApp: {ownerContact.support_whatsapp || '-'}
            </p>
          </div>
        </div>
      ) : null}

      {!loading && tickets.length === 0 ? (
        <EmptyState
          title="No recent tickets"
          description="Ticket history will show up once you raise a request."
          icon={<Inbox className="h-5 w-5" />}
          actionLabel="Create Ticket"
          actionHref={ROUTES.tenantTickets}
        />
      ) : null}

      {!loading && tickets.length > 0 ? (
        <div>
          <h3 className="ph-title mb-3 text-lg font-semibold text-[var(--ph-text)]">Ticket History</h3>
          <TicketTable tickets={tickets} />
          <Button to={ROUTES.tenantTickets} variant="ghost" size="sm" className="mt-3 px-0 hover:bg-transparent">
            Raise a new ticket
          </Button>
        </div>
      ) : null}
    </section>
  )
}




