import { useEffect, useState } from 'react'
import { Building2, Inbox, Mail, MessageSquare, Phone, Send } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { TicketTable } from '../../components/common/TicketTable'
import { dashboardInfoPanelClassName } from '../../components/common/formTheme'
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
    <section className="ph-page-shell">
      <div className="ph-page-header">
        <p className="ph-page-eyebrow">Tenant Support</p>
        <h2 className="ph-page-heading inline-flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[var(--ph-accent)]" />
          Support
        </h2>
        <p className="ph-page-description">Owner contact, ticket history, and delivery channels in one calmer support workspace.</p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading support details..." rows={4} /> : null}

      {!loading ? (
        <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-5">
            {!loading && telegramOnboarding ? (
              <article className="ph-surface-card rounded-xl p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Delivery Channel</p>
                    <h3 className="ph-title mt-3 inline-flex items-center gap-2 text-xl font-semibold text-[var(--ph-text)]">
                      <Send className="h-5 w-5 text-[var(--ph-accent)]" />
                      Telegram alerts
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">
                      {telegramOnboarding.connected
                        ? `Connected${telegramOnboarding.linked_chat?.username ? ` as @${telegramOnboarding.linked_chat.username}` : ''}.`
                        : 'Connect Telegram to receive support and rent update alerts.'}
                    </p>
                    <p className="mt-2 text-xs text-[var(--ph-text-muted)]">Open the bot and tap Start once. Status sync runs automatically.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!telegramOnboarding.connected ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          void connectTelegram()
                        }}
                        disabled={!telegramOnboarding.connect_url}
                      >
                        Connect Telegram
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={disconnectTelegram} disabled={disconnectingTelegram}>
                        {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void refreshTelegramStatus()
                      }}
                    >
                      Refresh status
                    </Button>
                  </div>
                </div>
              </article>
            ) : null}

            {!loading && ownerContact ? (
              <article className="ph-form-panel rounded-xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Support Contact</p>
                <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Owner contact</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className={dashboardInfoPanelClassName}>
                    <p className="inline-flex items-center gap-2 font-medium text-[var(--ph-text)]">
                      <Building2 className="h-4 w-4 text-[var(--ph-accent)]" />
                      Company
                    </p>
                    <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{ownerContact.company_name || '-'}</p>
                  </div>
                  <div className={dashboardInfoPanelClassName}>
                    <p className="inline-flex items-center gap-2 font-medium text-[var(--ph-text)]">
                      <Mail className="h-4 w-4 text-[var(--ph-accent)]" />
                      Email
                    </p>
                    <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{ownerContact.support_email || '-'}</p>
                  </div>
                  <div className={`${dashboardInfoPanelClassName} sm:col-span-2`}>
                    <p className="inline-flex items-center gap-2 font-medium text-[var(--ph-text)]">
                      <Phone className="h-4 w-4 text-[var(--ph-accent)]" />
                      WhatsApp
                    </p>
                    <p className="mt-2 text-sm text-[var(--ph-text-soft)]">{ownerContact.support_whatsapp || '-'}</p>
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <div className="space-y-5">
            <article className="ph-surface-card rounded-xl p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Support Activity</p>
                  <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Ticket history</h3>
                  <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                    Review recent requests here and open the ticket workspace when you need to raise a new issue.
                  </p>
                </div>
                <Button to={ROUTES.tenantTickets} variant="secondary" size="sm">
                  Raise ticket
                </Button>
              </div>

              <div className="mt-5">
                {tickets.length === 0 ? (
                  <EmptyState
                    title="No recent tickets"
                    description="Ticket history will show up once you raise a request."
                    icon={<Inbox className="h-5 w-5" />}
                    actionLabel="Create Ticket"
                    actionHref={ROUTES.tenantTickets}
                  />
                ) : (
                  <>
                    <TicketTable tickets={tickets} />
                    <Button to={ROUTES.tenantTickets} variant="ghost" size="sm" className="mt-4 px-0 hover:bg-transparent">
                      Open full support workspace
                    </Button>
                  </>
                )}
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </section>
  )
}
