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
import type { TelegramOnboardingState } from '../../types/api'

export function OwnerNotificationsPage() {
  const { token } = useOwnerAuth()
  const { notifications, unreadCount, loading, error: notificationsError, refresh, markRead, markAllRead } =
    useOwnerNotifications()
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)

  const loadTelegramStatus = useCallback(async () => {
    if (!token) {
      setTelegramOnboarding(null)
      setTelegramError(null)
      return
    }

    try {
      setTelegramError(null)
      const response = await api.getOwnerTelegramOnboarding(token)
      setTelegramOnboarding(response.onboarding)
    } catch (loadError) {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load Telegram status')
    }
  }, [token])

  useEffect(() => {
    void loadTelegramStatus()
  }, [loadTelegramStatus])

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
      setTelegramError(null)
      await api.disconnectOwnerTelegram(token)
      await loadTelegramStatus()
    } catch (disconnectError) {
      setTelegramError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
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
              }}
            >
              Refresh status
            </button>
          </div>
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
