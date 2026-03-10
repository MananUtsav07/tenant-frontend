import { useCallback, useEffect, useState } from 'react'
import { Bell, Inbox } from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { NotificationList } from '../../components/common/NotificationList'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerNotification } from '../../types/api'

export function OwnerNotificationsPage() {
  const { token } = useOwnerAuth()
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerNotifications(token)
      setNotifications(response.notifications)
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

  return (
    <section className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Bell className="h-6 w-6 text-blue-600" />
          Notifications
        </h2>
        <p className="text-sm text-slate-400">Ticket and reminder events from tenants.</p>
      </div>

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




