import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronRight, Inbox, LifeBuoy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../common/Button'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import { ROUTES } from '../../routes/constants'
import type { OwnerNotification } from '../../types/api'
import { formatDateTime } from '../../utils/date'

function resolveNotificationTarget(notification: OwnerNotification): string {
  if (notification.notification_type === 'ticket_created') {
    return ROUTES.ownerTickets
  }

  if (notification.notification_type === 'rent_payment_awaiting_approval') {
    return ROUTES.ownerDashboard
  }

  return ROUTES.ownerNotifications
}

export function OwnerNotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead } = useOwnerNotifications()
  const [open, setOpen] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications])

  useEffect(() => {
    if (!open) {
      return
    }

    void refresh({ silent: notifications.length > 0 })
  }, [open, refresh, notifications.length])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleNotificationClick = async (notification: OwnerNotification) => {
    if (!notification.is_read) {
      try {
        await markRead(notification.id)
      } catch {
        // Surface-level navigation still helps the owner reach the source page even if the mark-read call fails.
      }
    }

    setOpen(false)
    navigate(resolveNotificationTarget(notification))
  }

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true)
      await markAllRead()
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(83,88,100,0.42)] bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(10,14,25,0.98))] text-[var(--ph-text-soft)] shadow-[0_20px_42px_-30px_rgba(0,0,0,0.82)] transition hover:border-[rgba(240,163,35,0.24)] hover:text-[var(--ph-text)] focus-visible:ring-2 focus-visible:ring-[rgba(240,163,35,0.72)]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 transition group-hover:text-[var(--ph-accent)]" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--ph-accent)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#191108]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-3 w-[min(92vw,24rem)] rounded-[1.6rem] border border-[rgba(83,88,100,0.42)] bg-[linear-gradient(180deg,rgba(18,24,38,0.98),rgba(10,14,25,1))] p-4 shadow-[0_36px_80px_-36px_rgba(0,0,0,0.88)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f1cb85]">Owner Notifications</p>
              <h3 className="ph-title mt-2 text-lg font-semibold text-[var(--ph-text)]">Recent activity</h3>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll}
                className="text-xs font-semibold text-[#f4d298] transition hover:text-[#fff1d5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAll ? 'Updating...' : 'Mark all as read'}
              </button>
            ) : null}
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="rounded-[1.2rem] border border-[rgba(83,88,100,0.32)] bg-white/[0.03] px-4 py-5 text-sm text-[var(--ph-text-muted)]">
                Loading notifications...
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-[1.2rem] border border-[rgba(244,163,163,0.26)] bg-[rgba(120,28,28,0.18)] px-4 py-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {!loading && !error && recentNotifications.length === 0 ? (
              <div className="rounded-[1.2rem] border border-[rgba(83,88,100,0.32)] bg-white/[0.03] px-4 py-5 text-sm text-[var(--ph-text-muted)]">
                <div className="inline-flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-[var(--ph-accent)]" />
                  No notifications yet.
                </div>
              </div>
            ) : null}

            {!loading && !error
              ? recentNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                    className={`w-full rounded-[1.2rem] border p-3 text-left transition ${
                      notification.is_read
                        ? 'border-[rgba(83,88,100,0.32)] bg-white/[0.02] hover:border-[rgba(151,105,34,0.3)]'
                        : 'border-[rgba(240,163,35,0.22)] bg-[rgba(240,163,35,0.07)] hover:bg-[rgba(240,163,35,0.1)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          notification.is_read
                            ? 'border-[rgba(83,88,100,0.36)] bg-white/[0.03] text-[var(--ph-text-muted)]'
                            : 'border-[rgba(240,163,35,0.24)] bg-[rgba(240,163,35,0.14)] text-[var(--ph-accent)]'
                        }`}
                      >
                        <LifeBuoy className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-[var(--ph-text)]">{notification.title}</p>
                          {!notification.is_read ? (
                            <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ph-accent)]" aria-hidden="true" />
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{notification.message}</p>
                        <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{formatDateTime(notification.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))
              : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(83,88,100,0.28)] pt-3">
            <p className="text-xs text-[var(--ph-text-muted)]">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="px-0 hover:bg-transparent"
              iconRight={<ChevronRight className="h-4 w-4" />}
              onClick={() => {
                setOpen(false)
                navigate(ROUTES.ownerNotifications)
              }}
            >
              View all
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
