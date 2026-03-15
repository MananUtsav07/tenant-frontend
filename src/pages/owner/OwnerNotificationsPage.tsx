import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Inbox, Send } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
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
    <section className="space-y-6">
      <div className="ph-surface-card-strong rounded-[1.8rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Owner Notifications</p>
            <h2 className="ph-title mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-[var(--ph-text)]">
              <Bell className="h-6 w-6 text-[var(--ph-accent)]" />
              Activity inbox
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Review recent support and payment events without leaving the dashboard shell.
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

      {!loading && telegramOnboarding ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Send className="h-5 w-5 text-sky-600" />
            Telegram Alerts
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {telegramOnboarding.connected
              ? `Connected${telegramOnboarding.linked_chat?.username ? ` as @${telegramOnboarding.linked_chat.username}` : ''}.`
              : 'Connect Telegram to receive instant owner alerts.'}
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
                onClick={() => void disconnectTelegram()}
                disabled={disconnectingTelegram}
              >
                {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => {
                void loadTelegramStatus()
                void loadDeliveryLogs()
              }}
            >
              Refresh status
            </button>
          </div>
        </div>
      ) : null}

      {!loading && preferences ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Delivery Preferences</h3>
          <p className="mt-2 text-sm text-slate-600">Choose which channels should receive owner automation alerts.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {preferenceLabels.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={() => {
                    void togglePreference(item.key)
                  }}
                  disabled={updatingPreferenceKey === item.key}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {!loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent Telegram Deliveries</h3>
          <p className="mt-2 text-sm text-slate-600">Latest 10 Telegram delivery attempts for this owner account.</p>
          {loadingDeliveryLogs ? (
            <p className="mt-3 text-sm text-slate-500">Loading delivery logs...</p>
          ) : deliveryLogs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No delivery logs yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Event</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Attempts</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2 pr-4">{log.event_type}</td>
                      <td className="py-2 pr-4">
                        <span className={log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}>{log.status}</span>
                      </td>
                      <td className="py-2 pr-4">{log.attempts}</td>
                      <td className="py-2 pr-4">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {pageError ? <ErrorState message={pageError} /> : null}
      {loading ? <LoadingState message="Loading notifications..." rows={4} /> : null}

      {!loading && notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Owner notifications appear here when resident tickets or rent events need your attention."
          icon={<Inbox className="h-5 w-5" />}
        />
      ) : null}

      {!loading && notifications.length > 0 ? (
        <NotificationList notifications={notifications} onMarkRead={markRead} />
      ) : null}
    </section>
  )
}
