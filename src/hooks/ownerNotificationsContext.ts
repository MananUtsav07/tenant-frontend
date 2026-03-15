import { createContext } from 'react'

import type { OwnerNotification } from '../types/api'

export type OwnerNotificationsContextValue = {
  notifications: OwnerNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: (options?: { silent?: boolean }) => Promise<void>
  markRead: (notificationId: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const OwnerNotificationsContext = createContext<OwnerNotificationsContextValue | null>(null)
