import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  Inbox,
  Wrench,
} from 'lucide-react'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import type { OwnerNotification } from '../../types/api'

type NotificationFilter = 'all' | 'unread' | 'read'

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getNotificationIcon(notification: OwnerNotification) {
  const type = notification.notification_type?.toLowerCase() ?? ''

  if (type.includes('ticket')) {
    return (
      <div className="w-12 h-12 bg-[#2251E3]/15 rounded-full flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 text-[#4E79FF]" />
      </div>
    )
  }
  if (type.includes('rent') || type.includes('payment')) {
    return (
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <CreditCard className="w-5 h-5 text-green-600" />
      </div>
    )
  }
  if (type.includes('maintenance') || type.includes('condition')) {
    return (
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Wrench className="w-5 h-5 text-blue-600" />
      </div>
    )
  }
  if (type.includes('alert') || type.includes('warning')) {
    return (
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
    )
  }
  if (type.includes('resolved') || type.includes('success')) {
    return (
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
    )
  }
  return (
    <div className="w-12 h-12 bg-[#2251E3]/15 rounded-full flex items-center justify-center flex-shrink-0">
      <FileText className="w-5 h-5 text-[#4E79FF]" />
    </div>
  )
}

export function OwnerNotificationsPage() {
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useOwnerNotifications()
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  const filteredNotifications = useMemo(() => notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read
    if (activeFilter === 'read') return n.is_read
    return true
  }), [notifications, activeFilter])

  return (
    <div className="p-6 w-full bg-[#06070B] min-h-screen text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-['Sora'] font-bold text-3xl text-white mb-4">Notifications</h2>
            <div className="flex p-1 bg-[#101114]/50 border border-[#272839] rounded-lg w-fit">
              {(['all', 'unread', 'read'] as NotificationFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? "px-6 py-1.5 rounded-md text-sm font-['DM_Sans'] font-bold bg-[#2251E3] text-white shadow-sm capitalize"
                      : "px-6 py-1.5 rounded-md text-sm font-['DM_Sans'] text-[#8D8D96] hover:text-white transition-colors capitalize"
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-white font-['DM_Sans'] font-bold text-sm flex items-center gap-1.5 hover:text-[#4E79FF] transition-colors whitespace-nowrap pb-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {error ? <ErrorState message={error} variant="light" /> : null}

        {/* Notifications List */}
        {loading ? (
          <div className="bg-[#101114] rounded-xl shadow-sm border border-[#272839] p-6">
            <LoadingState message="Loading notifications..." rows={4} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-[#101114] rounded-xl shadow-sm border border-[#272839] p-10">
            <EmptyState
              title="No notifications"
              description="Owner notifications appear here when resident tickets or rent events need your attention."
              icon={<Inbox className="h-5 w-5" />}
            />
          </div>
        ) : (
          <div className="bg-[#101114] rounded-xl shadow-sm border border-[#272839] overflow-hidden w-full">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`relative flex items-start gap-4 p-6 hover:bg-[#06070B]/50 transition-colors group ${
                    !notification.is_read
                      ? 'border-l-4 border-[#4E79FF]'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  {getNotificationIcon(notification)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-3">
                      <h4
                        className={`font-['Manrope'] text-base ${
                          !notification.is_read ? 'font-bold text-white' : 'font-medium text-white'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#8D8D96] whitespace-nowrap">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <>
                            <div className="w-2 h-2 bg-[#2251E3] rounded-full group-hover:hidden" />
                            <button
                              type="button"
                              onClick={() => void markRead(notification.id)}
                              className="hidden group-hover:block text-xs font-['DM_Sans'] text-[#4E79FF] font-bold underline whitespace-nowrap"
                            >
                              Mark as read
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[#8D8D96] text-sm font-['Manrope'] leading-relaxed">{notification.message}</p>
                  </div>
                </div>
                {index < filteredNotifications.length - 1 && (
                  <hr className="border-[#272839] mx-6" />
                )}
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  )
}


