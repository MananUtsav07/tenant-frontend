import { useContext } from 'react'

import { OwnerNotificationsContext } from './ownerNotificationsContext'

export function useOwnerNotifications() {
  const context = useContext(OwnerNotificationsContext)
  if (!context) {
    throw new Error('useOwnerNotifications must be used within OwnerNotificationsProvider')
  }
  return context
}
