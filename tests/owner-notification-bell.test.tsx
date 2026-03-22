import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { OwnerNotification } from '../src/types/api'

let seedNotifications: OwnerNotification[] = []
const refreshMock = vi.fn(async () => undefined)

vi.mock('../src/hooks/useOwnerNotifications', async () => {
  const React = await import('react')

  return {
    useOwnerNotifications: () => {
      const [notifications, setNotifications] = React.useState<OwnerNotification[]>(() => seedNotifications)

      return {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.is_read).length,
        loading: false,
        error: null,
        refresh: refreshMock,
        markRead: async (notificationId: string) => {
          setNotifications((current) =>
            current.map((notification) =>
              notification.id === notificationId ? { ...notification, is_read: true } : notification,
            ),
          )
        },
        markAllRead: async () => {
          setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
        },
      }
    },
  }
})

const { OwnerNotificationBell } = await import('../src/components/owner/OwnerNotificationBell')

describe('OwnerNotificationBell', () => {
  beforeEach(() => {
    refreshMock.mockClear()
    seedNotifications = [
      {
        id: 'notification-1',
        organization_id: 'org-1',
        owner_id: 'owner-1',
        tenant_id: 'tenant-1',
        notification_type: 'ticket_created',
        title: 'New support ticket from Amina Resident',
        message: 'AC issue reported in Marina Residence',
        is_read: false,
        created_at: '2026-03-14T10:00:00.000Z',
      },
      {
        id: 'notification-2',
        organization_id: 'org-1',
        owner_id: 'owner-1',
        tenant_id: 'tenant-1',
        notification_type: 'rent_payment_awaiting_approval',
        title: 'Rent payment awaiting approval: Amina Resident',
        message: 'Amina Resident marked AED 12,000 as paid.',
        is_read: false,
        created_at: '2026-03-14T11:00:00.000Z',
      },
    ]
  })

  it('shows recent notifications and updates the unread badge after mark-all-read', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <OwnerNotificationBell />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Notifications (2 unread)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Notifications (2 unread)' }))

    expect(refreshMock).toHaveBeenCalled()
    expect(screen.getByText('Recent activity')).toBeInTheDocument()
    expect(screen.getByText('New support ticket from Amina Resident')).toBeInTheDocument()
    expect(screen.getByText('Rent payment awaiting approval: Amina Resident')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark all as read' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('All caught up')).toBeInTheDocument()
    })
  })
})
