import { useCallback, useEffect, useState } from 'react'
import { Bell, Inbox, Send } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { NotificationList } from '../../components/common/NotificationList'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerNotification, TelegramOnboardingState } from '../../types/api'

export function OwnerNotificationsPage() {
  const { token } = useOwnerAuth()
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)

  const loadNotifications = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const [notificationResponse, telegramResponse] = await Promise.all([
        api.getOwnerNotifications(token),
        api.getOwnerTelegramOnboarding(token),
      ])
      setNotifications(notificationResponse.notifications)
      setTelegramOnboarding(telegramResponse.onboarding)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markRead = async (notificationId: string) => {
    if (!token) {
      return
    }

    try {
      await api.markNotificationRead(token, notificationId)
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark notification as read')
    }
  }

  const connectTelegram = () => {
    if (!telegramOnboarding?.connect_url) {
      return
    }
    window.open(telegramOnboarding.connect_url, '_blank', 'noopener,noreferrer')
  }

  const disconnectTelegram = async () => {
    if (!token) {
      return
    }

    try {
      setDisconnectingTelegram(true)
      setError(null)
      await api.disconnectOwnerTelegram(token)
      await loadNotifications()
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Bell className="h-6 w-6 text-blue-600" />
          Notifications
        </h2>
        <p className="text-sm text-slate-400">Ticket and reminder events from tenants.</p>
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
          <p className="mt-1 text-xs text-slate-500">Open bot, tap Start once, then click Refresh status.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!telegramOnboarding.connected ? (
              <button
                type="button"
                className="rounded-xl border border-sky-600 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={connectTelegram}
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
                void loadNotifications()
              }}
            >
              Refresh status
            </button>
          </div>
        </div>
      ) : null}

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading notifications..." rows={4} /> : null}

      {!loading && notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="Owner notifications appear here when ticket updates or reminder events occur."
          icon={<Inbox className="h-5 w-5" />}
        />
      ) : null}

      {!loading && notifications.length > 0 ? <NotificationList notifications={notifications} onMarkRead={markRead} /> : null}
    </section>
  )
}
