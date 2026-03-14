import { Bell, Inbox } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { NotificationList } from '../../components/common/NotificationList'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'

export function OwnerNotificationsPage() {
  const { notifications, unreadCount, loading, error, markRead, markAllRead, refresh } = useOwnerNotifications()

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

      {error ? <ErrorState message={error} /> : null}
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
