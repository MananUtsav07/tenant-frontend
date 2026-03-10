import { motion } from 'framer-motion'
import { Bell, CheckCircle2 } from 'lucide-react'

import type { OwnerNotification } from '../../types/api'
import { revealUp, useMotionEnabled, useMotionVariants, viewportOnce } from '../../utils/motion'
import { formatDateTime } from '../../utils/date'
import { Button } from './Button'

export function NotificationList({
  notifications,
  onMarkRead,
}: {
  notifications: OwnerNotification[]
  onMarkRead?: (notificationId: string) => Promise<void>
}) {
  const revealVariants = useMotionVariants(revealUp)
  const motionEnabled = useMotionEnabled()

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          whileHover={motionEnabled ? { y: -2 } : undefined}
          className="tf-panel p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Bell className="h-4 w-4 text-blue-500" />
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.created_at)}</p>
            </div>
            {!notification.is_read ? (
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" aria-label="unread" />
            ) : null}
          </div>
          {onMarkRead && !notification.is_read ? (
            <Button
              type="button"
              onClick={() => void onMarkRead(notification.id)}
              variant="outline"
              size="sm"
              className="mt-3"
              iconLeft={<CheckCircle2 className="h-4 w-4" />}
            >
              Mark as read
            </Button>
          ) : null}
        </motion.div>
      ))}
    </div>
  )
}


