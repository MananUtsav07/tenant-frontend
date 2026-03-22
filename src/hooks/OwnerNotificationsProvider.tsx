import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api } from '../services/api'
import type { OwnerNotification } from '../types/api'
import { useOwnerAuth } from './useOwnerAuth'
import { OwnerNotificationsContext, type OwnerNotificationsContextValue } from './ownerNotificationsContext'

export function OwnerNotificationsProvider({ children }: { children: ReactNode }) {
  const { token } = useOwnerAuth()
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        setNotifications([])
        setError(null)
        setLoading(false)
        return
      }

      if (!options?.silent) {
        setLoading(true)
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
    },
    [token],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        return
      }

      const previous = notifications
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )

      try {
        setError(null)
        await api.markNotificationRead(token, notificationId)
      } catch (markError) {
        setNotifications(previous)
        const message = markError instanceof Error ? markError.message : 'Failed to mark notification as read'
        setError(message)
        throw new Error(message)
      }
    },
    [notifications, token],
  )

  const markAllRead = useCallback(async () => {
    if (!token) {
      return
    }

    const previous = notifications
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))

    try {
      setError(null)
      await api.markAllOwnerNotificationsRead(token)
    } catch (markError) {
      setNotifications(previous)
      const message = markError instanceof Error ? markError.message : 'Failed to mark all notifications as read'
      setError(message)
      throw new Error(message)
    }
  }, [notifications, token])

  const value = useMemo<OwnerNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.is_read).length,
      loading,
      error,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, loading, error, refresh, markRead, markAllRead],
  )

  return <OwnerNotificationsContext.Provider value={value}>{children}</OwnerNotificationsContext.Provider>
}
