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
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-[#1A1A1A]">
          <Bell className="h-6 w-6 text-[#FED609]" />
          Notifications
        </h2>
        <p className="text-sm text-[#6B7280]">Ticket and reminder events from tenants.</p>
      </div>

      {!loading && telegramOnboarding ? (
        <div className="rounded-xl border border-[#0088cc]/20 bg-[#f0f9ff] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-[#1A1A1A]">
            <Send className="h-5 w-5 text-[#0088cc]" />
            Telegram Alerts
          </h3>
          <p className="mt-2 text-sm text-[#4B5563]">
            {telegramOnboarding.connected
              ? `Connected${telegramOnboarding.linked_chat?.username ? ` as @${telegramOnboarding.linked_chat.username}` : ''}.`
              : 'Connect Telegram to receive instant owner alerts.'}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">Open bot, tap Start once, then click Refresh status.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!telegramOnboarding.connected ? (
              <button
                type="button"
                className="rounded-xl border border-[#0088cc] bg-[#0088cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006fa1] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={connectTelegram}
                disabled={!telegramOnboarding.connect_url}
              >
                Connect Telegram
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#FEFAEF] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={disconnectTelegram}
                disabled={disconnectingTelegram}
              >
                {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#FEFAEF]"
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
