import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Inbox, Send } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormToggle } from '../../components/common/FormToggle'
import { LoadingState } from '../../components/common/LoadingState'
import { NotificationList } from '../../components/common/NotificationList'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import { api } from '../../services/api'
import type { OwnerNotificationPreferences, OwnerTelegramDeliveryLog, TelegramOnboardingState } from '../../types/api'

type PreferenceKey =
  | 'ticket_created_email'
  | 'ticket_created_telegram'
  | 'ticket_reply_email'
  | 'ticket_reply_telegram'
  | 'rent_payment_awaiting_approval_email'
  | 'rent_payment_awaiting_approval_telegram'

const preferenceLabels: Array<{ key: PreferenceKey; label: string }> = [
  { key: 'ticket_created_email', label: 'Ticket created (Email)' },
  { key: 'ticket_created_telegram', label: 'Ticket created (Telegram)' },
  { key: 'ticket_reply_email', label: 'Ticket reply (Email)' },
  { key: 'ticket_reply_telegram', label: 'Ticket reply (Telegram)' },
  { key: 'rent_payment_awaiting_approval_email', label: 'Rent approval (Email)' },
  { key: 'rent_payment_awaiting_approval_telegram', label: 'Rent approval (Telegram)' },
]

export function OwnerNotificationsPage() {
  const { token } = useOwnerAuth()
  const { notifications, unreadCount, loading, error: notificationsError, refresh, markRead, markAllRead } =
    useOwnerNotifications()
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [preferences, setPreferences] = useState<OwnerNotificationPreferences | null>(null)
  const [deliveryLogs, setDeliveryLogs] = useState<OwnerTelegramDeliveryLog[]>([])
  const [updatingPreferenceKey, setUpdatingPreferenceKey] = useState<PreferenceKey | null>(null)
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)
  const [loadingDeliveryLogs, setLoadingDeliveryLogs] = useState(false)

  const loadTelegramStatus = useCallback(async () => {
    if (!token) {
      setTelegramOnboarding(null)
      setTelegramError(null)
      return false
    }

    try {
      setTelegramError(null)
      const response = await api.getOwnerTelegramOnboarding(token)
      setTelegramOnboarding(response.onboarding)
      return response.onboarding.connected
    } catch (loadError) {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load Telegram status')
      return false
    }
  }, [token])

  useEffect(() => {
    void loadTelegramStatus()
  }, [loadTelegramStatus])

  const loadPreferences = useCallback(async () => {
    if (!token) {
      setPreferences(null)
      return
    }

    const response = await api.getOwnerNotificationPreferences(token)
    setPreferences(response.preferences)
  }, [token])

  const loadDeliveryLogs = useCallback(async () => {
    if (!token) {
      setDeliveryLogs([])
      return
    }

    try {
      setLoadingDeliveryLogs(true)
      const response = await api.getOwnerTelegramDeliveryLogs(token, { page: 1, page_size: 10 })
      setDeliveryLogs(response.items)
    } catch (loadError) {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load Telegram delivery logs')
    } finally {
      setLoadingDeliveryLogs(false)
    }
  }, [token])

  useEffect(() => {
    void loadPreferences().catch((loadError) => {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load notification preferences')
    })
    void loadDeliveryLogs()
  }, [loadDeliveryLogs, loadPreferences])

  const connectTelegram = async () => {
    if (!telegramOnboarding?.connect_url) {
      return
    }

    window.open(telegramOnboarding.connect_url, '_blank', 'noopener,noreferrer')

    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 2000)
      })
      const connected = await loadTelegramStatus()
      if (connected) {
        break
      }
    }
    await loadDeliveryLogs()
  }

  const disconnectTelegram = async () => {
    if (!token) {
      return
    }

    try {
      setDisconnectingTelegram(true)
      setTelegramError(null)
      await api.disconnectOwnerTelegram(token)
      await loadTelegramStatus()
      await loadDeliveryLogs()
    } catch (disconnectError) {
      setTelegramError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
    }
  }

  const togglePreference = async (key: PreferenceKey) => {
    if (!token || !preferences) {
      return
    }

    const nextValue = !preferences[key]
    const previous = preferences
    setPreferences({
      ...preferences,
      [key]: nextValue,
    })

    try {
      setUpdatingPreferenceKey(key)
      setTelegramError(null)
      const response = await api.updateOwnerNotificationPreferences(token, { [key]: nextValue })
      setPreferences(response.preferences)
    } catch (updateError) {
      setPreferences(previous)
      setTelegramError(updateError instanceof Error ? updateError.message : 'Failed to update notification preferences')
    } finally {
      setUpdatingPreferenceKey(null)
    }
  }

  const pageError = useMemo(() => notificationsError ?? telegramError, [notificationsError, telegramError])

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="ph-page-heading inline-flex items-center gap-2">
              <Bell className="h-6 w-6 text-[var(--ph-accent)]" />
              Activity inbox
            </h2>
            <p className="ph-page-description">
              Review support and payment events, tune delivery channels, and keep notifications disciplined from one quieter workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-3 py-1 text-xs text-[var(--ph-text-muted)]">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All notifications read'}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={() => void refresh({ silent: false })}>
              Refresh
            </Button>
            {unreadCount > 0 ? (
              <Button type="button" variant="outline" size="sm" onClick={() => void markAllRead()}>
                Mark all as read
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {pageError ? <ErrorState message={pageError} /> : null}
      {loading ? <LoadingState message="Loading notifications..." rows={4} /> : null}

      {!loading ? (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            {telegramOnboarding ? (
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
                        : 'Connect Telegram to receive instant owner alerts.'}
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void disconnectTelegram()}
                        disabled={disconnectingTelegram}
                      >
                        {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void loadTelegramStatus()
                        void loadDeliveryLogs()
                      }}
                    >
                      Refresh status
                    </Button>
                  </div>
                </div>
              </article>
            ) : null}

            {preferences ? (
              <article className="ph-surface-card rounded-xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Preferences</p>
                <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Delivery preferences</h3>
                <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Choose which channels should receive owner automation alerts.</p>
                <div className="mt-5 grid gap-3">
                  {preferenceLabels.map((item) => (
                    <FormToggle
                      key={item.key}
                      label={item.label}
                      description="Immediate owner notification routing for this event type."
                      checked={preferences[item.key]}
                      onToggle={() => {
                        void togglePreference(item.key)
                      }}
                      disabled={updatingPreferenceKey === item.key}
                    />
                  ))}
                </div>
              </article>
            ) : null}
          </div>

          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Delivery Logs</p>
            <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Recent Telegram deliveries</h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Latest 10 Telegram delivery attempts for this owner account.</p>
            <div className="mt-5">
              {loadingDeliveryLogs ? (
                <LoadingState message="Loading delivery logs..." rows={3} />
              ) : deliveryLogs.length === 0 ? (
                <EmptyState title="No delivery logs yet" description="Telegram delivery attempts will appear here once alert routing starts." />
              ) : (
                <DataTable headers={['Event', 'Status', 'Attempts', 'Created']}>
                  {deliveryLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-[var(--ph-text)]">{log.event_type}</td>
                      <td className="px-4 py-3">
                        <span className={log.status === 'success' ? 'text-[var(--ph-success)]' : 'text-red-200'}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{log.attempts}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-muted)]">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </div>
          </article>

          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Owner notifications appear here when resident tickets or rent events need your attention."
              icon={<Inbox className="h-5 w-5" />}
            />
          ) : (
            <article className="space-y-4">
              <div className="ph-page-header">
                <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Unread and recent events</h3>
                <p className="text-sm text-[var(--ph-text-muted)]">The bell dropdown and this page use the same notification source of truth.</p>
              </div>
              <NotificationList notifications={notifications} onMarkRead={markRead} />
            </article>
          )}
        </>
      ) : null}
    </section>
  )
}
