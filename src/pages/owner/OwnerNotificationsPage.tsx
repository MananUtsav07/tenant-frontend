import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Inbox,
  RefreshCw,
  Send,
  Sparkles,
  Wrench,
} from 'lucide-react'

import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormToggle } from '../../components/common/FormToggle'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import { api } from '../../services/api'
import type {
  OwnerNotification,
  OwnerNotificationPreferences,
  OwnerTelegramDeliveryLog,
  TelegramOnboardingState,
} from '../../types/api'

type PreferenceKey =
  | 'ticket_created_email'
  | 'ticket_created_telegram'
  | 'ticket_reply_email'
  | 'ticket_reply_telegram'
  | 'rent_payment_awaiting_approval_email'
  | 'rent_payment_awaiting_approval_telegram'

const preferenceLabels: Array<{ key: PreferenceKey; label: string; description: string }> = [
  { key: 'ticket_created_email', label: 'Ticket created (Email)', description: 'Receive an email when a tenant opens a new support ticket.' },
  { key: 'ticket_created_telegram', label: 'Ticket created (Telegram)', description: 'Receive a Telegram alert when a tenant opens a new support ticket.' },
  { key: 'ticket_reply_email', label: 'Ticket reply (Email)', description: 'Receive an email when a tenant replies to an existing ticket.' },
  { key: 'ticket_reply_telegram', label: 'Ticket reply (Telegram)', description: 'Receive a Telegram alert when a tenant replies to an existing ticket.' },
  { key: 'rent_payment_awaiting_approval_email', label: 'Rent approval (Email)', description: 'Receive an email when a rent payment is awaiting your approval.' },
  { key: 'rent_payment_awaiting_approval_telegram', label: 'Rent approval (Telegram)', description: 'Receive a Telegram alert when a rent payment is awaiting your approval.' },
]

type NotificationFilter = 'all' | 'unread' | 'read'

function getNotificationIcon(notification: OwnerNotification) {
  const type = notification.notification_type ?? ''
  if (type.includes('payment') || type.includes('rent')) {
    return (
      <div className="w-12 h-12 bg-[#FED609]/10 rounded-full flex items-center justify-center flex-shrink-0">
        <CreditCard className="w-5 h-5 text-[#FED609]" />
      </div>
    )
  }
  if (type.includes('ticket')) {
    return (
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-blue-500" />
      </div>
    )
  }
  if (type.includes('overdue') || type.includes('late') || type.includes('error')) {
    return (
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
    )
  }
  if (type.includes('ai') || type.includes('reminder')) {
    return (
      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-purple-500" />
      </div>
    )
  }
  if (type.includes('telegram') || type.includes('connect')) {
    return (
      <div className="w-12 h-12 bg-[#0088CC]/10 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-5 h-5 text-[#0088CC]" />
      </div>
    )
  }
  if (type.includes('maintenance') || type.includes('repair')) {
    return (
      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
        <Wrench className="w-5 h-5 text-green-500" />
      </div>
    )
  }
  return (
    <div className="w-12 h-12 bg-[#FED609]/10 rounded-full flex items-center justify-center flex-shrink-0">
      <Bell className="w-5 h-5 text-[#FED609]" />
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export function OwnerNotificationsPage() {
  const { token, owner, refresh: refreshOwnerProfile } = useOwnerAuth()
  const { notifications, unreadCount, loading, error: notificationsError, refresh, markRead, markAllRead } = useOwnerNotifications()

  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [preferences, setPreferences] = useState<OwnerNotificationPreferences | null>(null)
  const [deliveryLogs, setDeliveryLogs] = useState<OwnerTelegramDeliveryLog[]>([])
  const [updatingPreferenceKey, setUpdatingPreferenceKey] = useState<PreferenceKey | null>(null)
  const [telegramError, setTelegramError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)
  const [loadingDeliveryLogs, setLoadingDeliveryLogs] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  useEffect(() => {
    setWhatsappNumber(owner?.support_whatsapp ?? '')
  }, [owner?.support_whatsapp])

  const loadTelegramStatus = useCallback(async () => {
    if (!token) {
      setTelegramOnboarding(null)
      setTelegramError(null)
      return false
    }

    try {
      setTelegramError(null)
      const response = await api.getOwnerTelegramOnboarding(token)
      setTelegramOnboarding(response.onboarding)
      return response.onboarding.connected
    } catch (loadError) {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load Telegram status')
      return false
    }
  }, [token])

  useEffect(() => {
    void loadTelegramStatus()
  }, [loadTelegramStatus])

  const loadPreferences = useCallback(async () => {
    if (!token) {
      setPreferences(null)
      return
    }

    const response = await api.getOwnerNotificationPreferences(token)
    setPreferences(response.preferences)
  }, [token])

  const loadDeliveryLogs = useCallback(async () => {
    if (!token) {
      setDeliveryLogs([])
      return
    }

    try {
      setLoadingDeliveryLogs(true)
      const response = await api.getOwnerTelegramDeliveryLogs(token, { page: 1, page_size: 10 })
      setDeliveryLogs(response.items)
    } catch (loadError) {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load Telegram delivery logs')
    } finally {
      setLoadingDeliveryLogs(false)
    }
  }, [token])

  useEffect(() => {
    void loadPreferences().catch((loadError) => {
      setTelegramError(loadError instanceof Error ? loadError.message : 'Failed to load notification preferences')
    })
    void loadDeliveryLogs()
  }, [loadDeliveryLogs, loadPreferences])

  const connectTelegram = async () => {
    if (!telegramOnboarding?.connect_url) {
      return
    }

    window.open(telegramOnboarding.connect_url, '_blank', 'noopener,noreferrer')

    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 2000)
      })
      const connected = await loadTelegramStatus()
      if (connected) {
        break
      }
    }
    await loadDeliveryLogs()
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
      await loadDeliveryLogs()
    } catch (disconnectError) {
      setTelegramError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
    }
  }

  const togglePreference = async (key: PreferenceKey) => {
    if (!token || !preferences) {
      return
    }

    const nextValue = !preferences[key]
    const previous = preferences
    setPreferences({
      ...preferences,
      [key]: nextValue,
    })

    try {
      setUpdatingPreferenceKey(key)
      setTelegramError(null)
      const response = await api.updateOwnerNotificationPreferences(token, { [key]: nextValue })
      setPreferences(response.preferences)
    } catch (updateError) {
      setPreferences(previous)
      setTelegramError(updateError instanceof Error ? updateError.message : 'Failed to update notification preferences')
    } finally {
      setUpdatingPreferenceKey(null)
    }
  }

  const saveWhatsappNumber = async () => {
    if (!token) {
      return
    }

    try {
      setSavingWhatsapp(true)
      setWhatsappStatus(null)
      setTelegramError(null)
      const nextValue = whatsappNumber.trim()
      await api.patchOwnerMe(token, {
        support_whatsapp: nextValue.length > 0 ? nextValue : null,
      })
      await refreshOwnerProfile()
      setWhatsappStatus(nextValue.length > 0 ? 'WhatsApp number saved.' : 'WhatsApp number cleared.')
    } catch (saveError) {
      setTelegramError(saveError instanceof Error ? saveError.message : 'Failed to save WhatsApp number')
    } finally {
      setSavingWhatsapp(false)
    }
  }

  const pageError = useMemo(() => notificationsError ?? telegramError, [notificationsError, telegramError])

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read
    if (activeFilter === 'read') return n.is_read
    return true
  })

  const isTelegramConnected = telegramOnboarding?.connected ?? false

  return (
    <div className="min-h-screen bg-[#FEFAEF]">
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-[Sora] font-bold text-3xl text-[#1A1A1A] mb-4">Notifications</h2>
            <div className="flex p-1 bg-white/50 border border-[#FED609]/20 rounded-lg w-fit">
              {(['all', 'unread', 'read'] as NotificationFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? 'px-6 py-1.5 rounded-md text-sm font-[DM_Sans] font-bold bg-[#FED609] text-[#1A1A1A] shadow-sm capitalize'
                      : 'px-6 py-1.5 rounded-md text-sm font-[DM_Sans] text-[#6B7280] hover:text-[#1A1A1A] transition-colors capitalize'
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
              className="text-[#1A1A1A] font-[DM_Sans] font-bold text-sm flex items-center gap-1 hover:text-[#FFD70B] transition-colors pb-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {pageError ? <ErrorState message={pageError} variant="light" /> : null}

        {/* Telegram Integration Banner */}
        {!loading && telegramOnboarding && (
          <div className="bg-[#FFFAE2] border border-[#FED609]/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-[#0088CC]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10 text-[#0088CC]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.98-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.07-.78 4.2-1.82 7-3.03 8.4-3.61 4-.17 4.83.1 4.83.1s.05.52.01 1.15z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              {isTelegramConnected ? (
                <>
                  <h3 className="font-[Sora] font-bold text-lg text-[#1A1A1A] mb-1">
                    Telegram connected
                    {telegramOnboarding.linked_chat?.username
                      ? ` as @${telegramOnboarding.linked_chat.username}`
                      : ''}
                  </h3>
                  <p className="text-[#6B7280] text-sm max-w-md">
                    You are receiving all critical alerts directly in Telegram. Open the bot and tap Start once to confirm.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-[Sora] font-bold text-lg text-[#1A1A1A] mb-1">
                    Connect Telegram for instant notifications
                  </h3>
                  <p className="text-[#6B7280] text-sm max-w-md">
                    Get payment alerts, ticket updates, and reminders directly in Telegram with our AI bot.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {!isTelegramConnected ? (
                <button
                  type="button"
                  onClick={() => void connectTelegram()}
                  disabled={!telegramOnboarding.connect_url}
                  className="bg-[#0088CC] text-white px-6 py-2.5 rounded-lg font-[DM_Sans] font-bold text-sm shadow-md hover:bg-[#0077B5] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Connect Telegram Bot
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void disconnectTelegram()}
                  disabled={disconnectingTelegram}
                  className="border border-[rgba(0,0,0,0.08)] bg-white text-[#4B5563] px-5 py-2.5 rounded-lg font-[DM_Sans] font-bold text-sm hover:bg-[#FEFAEF] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { void loadTelegramStatus(); void refresh({ silent: true }) }}
                className="border border-[rgba(0,0,0,0.08)] bg-white text-[#4B5563] px-4 py-2.5 rounded-lg font-[DM_Sans] font-bold text-sm hover:bg-[#FEFAEF] transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh status
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#FED609]/10 p-6">
            <LoadingState message="Loading notifications..." rows={4} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="Owner notifications appear here when resident tickets or rent events need your attention."
            icon={<Inbox className="h-5 w-5" />}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#FED609]/10 overflow-hidden">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`relative flex items-start gap-4 p-6 hover:bg-[#FEFAEF]/50 transition-colors group ${
                    !notification.is_read
                      ? 'border-l-4 border-[#FED609]'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  {getNotificationIcon(notification)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`font-[Manrope] text-base truncate pr-8 ${
                          !notification.is_read ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#1A1A1A]'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#6B7280] whitespace-nowrap">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-[#FED609] rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-[#6B7280] text-sm">{notification.message}</p>
                  </div>
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => void markRead(notification.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-[DM_Sans] text-[#FED609] font-bold underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                {index < filteredNotifications.length - 1 && (
                  <hr className="border-[#FED609]/5 mx-6" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp Bot Link */}
        <div className="bg-white rounded-xl shadow-sm border border-[#FED609]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#92700A]">WhatsApp Bot Link</p>
          <h3 className="font-[Sora] font-bold text-xl text-[#1A1A1A] mt-3">Owner WhatsApp number</h3>
          <p className="text-sm text-[#6B7280] mt-2">
            Set the number that will send commands to the bot. Use E.164 format, for example{' '}
            <code className="bg-[#FEFAEF] px-1 py-0.5 rounded text-xs font-mono">+9198XXXXXXX</code>.
          </p>
          <div className="mt-4 space-y-3">
            <FormInput
              label="Support WhatsApp"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="+15551234567"
              autoComplete="tel"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void saveWhatsappNumber()}
                disabled={savingWhatsapp}
                className="bg-[#25D366] text-white px-5 py-2.5 rounded-lg font-[DM_Sans] font-bold text-sm shadow-sm hover:bg-[#1EBE5C] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingWhatsapp ? 'Saving...' : 'Save WhatsApp Number'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhatsappNumber(owner?.support_whatsapp ?? '')
                  setWhatsappStatus(null)
                }}
                disabled={savingWhatsapp}
                className="border border-[rgba(0,0,0,0.08)] bg-[#FEFAEF] text-[#4B5563] px-5 py-2.5 rounded-lg font-[DM_Sans] font-bold text-sm hover:bg-[#FFFAE2] transition-all active:scale-95 disabled:opacity-60"
              >
                Reset
              </button>
            </div>
            <p className="text-xs text-[#6B7280]">
              After saving, send <code className="bg-[#FEFAEF] px-1 rounded text-xs font-mono">help</code> from this same number to your Meta test number on WhatsApp to verify bot replies.
            </p>
            {whatsappStatus && (
              <p className="text-xs font-medium text-[#10B981]">{whatsappStatus}</p>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        {preferences && (
          <div className="bg-white rounded-xl shadow-sm border border-[#FED609]/10 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#92700A]">Preferences</p>
            <h3 className="font-[Sora] font-bold text-xl text-[#1A1A1A] mt-3">Delivery preferences</h3>
            <p className="text-sm text-[#6B7280] mt-2">Choose which channels should receive owner automation alerts.</p>
            <div className="mt-5 grid gap-3">
              {preferenceLabels.map((item) => (
                <FormToggle
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  checked={preferences[item.key]}
                  onToggle={() => { void togglePreference(item.key) }}
                  disabled={updatingPreferenceKey === item.key}
                />
              ))}
            </div>
          </div>
        )}

        {/* Delivery Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-[#FED609]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#92700A]">Delivery Logs</p>
          <h3 className="font-[Sora] font-bold text-xl text-[#1A1A1A] mt-3">Recent Telegram deliveries</h3>
          <p className="text-sm text-[#6B7280] mt-2">Latest 10 Telegram delivery attempts for this owner account.</p>
          <div className="mt-5">
            {loadingDeliveryLogs ? (
              <LoadingState message="Loading delivery logs..." rows={3} />
            ) : deliveryLogs.length === 0 ? (
              <EmptyState
                title="No delivery logs yet"
                description="Telegram delivery attempts will appear here once alert routing starts."
              />
            ) : (
              <DataTable headers={['Event', 'Status', 'Attempts', 'Created']}>
                {deliveryLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-[#1A1A1A]">{log.event_type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          log.status === 'success'
                            ? 'inline-flex items-center gap-1 text-[#10B981] font-medium text-sm'
                            : 'inline-flex items-center gap-1 text-red-500 font-medium text-sm'
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-[#10B981]' : 'bg-red-500'}`}
                        />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">{log.attempts}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="flex justify-center pb-4">
            <button
              type="button"
              className="bg-[#FED609] hover:bg-[#FFD70B] text-[#1A1A1A] font-[DM_Sans] font-bold px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              Load More
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
