import { LifeBuoy, Plus, TicketX } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput, FormTextarea } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { TicketTable } from '../../components/common/TicketTable'
import { dashboardFormPanelClassName } from '../../components/common/formTheme'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { TenantTicket } from '../../types/api'

export function TenantTicketsPage() {
  const { token } = useTenantAuth()
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      await api.createTenantTicket(token, { subject, message })
      setSubject('')
      setMessage('')
      await loadTickets()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create ticket')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <LifeBuoy className="h-6 w-6 text-[var(--ph-accent)]" />
          Support Tickets
        </h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Raise and track support requests.</p>
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

      {!loading && tickets.length > 0 ? <TicketTable tickets={tickets} /> : null}
    </section>
  )
}
