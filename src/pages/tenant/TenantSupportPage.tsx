import { useEffect, useState } from 'react'
import { Building2, Inbox, Mail, MessageSquare, Phone, Send } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { TicketTable } from '../../components/common/TicketTable'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TelegramOnboardingState, TenantOwnerContact, TenantTicket } from '../../types/api'

export function TenantSupportPage() {
  const { token } = useTenantAuth()
  const [ownerContact, setOwnerContact] = useState<TenantOwnerContact | null>(null)
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) {
        return
      }

      try {
        setError(null)
        const [contactResponse, ticketsResponse, telegramResponse] = await Promise.all([
          api.getTenantOwnerContact(token),
          api.getTenantTickets(token),
          api.getTenantTelegramOnboarding(token),
        ])
        setOwnerContact(contactResponse.owner)
        setTickets(ticketsResponse.tickets)
        setTelegramOnboarding(telegramResponse.onboarding)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load support details')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const refreshTelegramStatus = async () => {
    if (!token) {
      return false
    }

    try {
      setError(null)
      const response = await api.getTenantTelegramOnboarding(token)
      setTelegramOnboarding(response.onboarding)
      return response.onboarding.connected
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh Telegram status')
      return false
    }
  }

  const connectTelegram = async () => {
    if (!telegramOnboarding?.connect_url) {
      return
    }
    window.open(telegramOnboarding.connect_url, '_blank', 'noopener,noreferrer')

    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 2000)
      })
      const connected = await refreshTelegramStatus()
      if (connected) {
        break
      }
    }
  }

  const disconnectTelegram = async () => {
    if (!token) {
      return
    }

    try {
      setDisconnectingTelegram(true)
      setError(null)
      await api.disconnectTenantTelegram(token)
      await refreshTelegramStatus()
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <MessageSquare className="h-6 w-6 text-[var(--ph-accent)]" />
          Support
        </h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Owner support contact and recent support activity.</p>
      </div>

      {!loading && telegramOnboarding ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Send className="h-5 w-5 text-sky-600" />
            Telegram Alerts
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {telegramOnboarding.connected
              ? `Connected${telegramOnboarding.linked_chat?.username ? ` as @${telegramOnboarding.linked_chat.username}` : ''}.`
              : 'Connect Telegram to receive support and rent update alerts.'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Open bot and tap Start once. Status sync runs automatically.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!telegramOnboarding.connected ? (
              <button
                type="button"
                className="rounded-xl border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void connectTelegram()
                }}
                disabled={!telegramOnboarding.connect_url}
              >
                Connect Telegram
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={disconnectTelegram}
                disabled={disconnectingTelegram}
              >
                {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => {
                void refreshTelegramStatus()
              }}
            >
              Refresh status
            </button>
          </div>
        </div>
      ) : null}

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
