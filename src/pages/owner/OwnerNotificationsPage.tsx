import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Inbox, Send } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormToggle } from '../../components/common/FormToggle'
import { LoadingState } from '../../components/common/LoadingState'
import { NotificationList } from '../../components/common/NotificationList'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import { api } from '../../services/api'
import type { OwnerNotificationPreferences, OwnerTelegramDeliveryLog, TelegramOnboardingState } from '../../types/api'

type PreferenceKey =
  | 'ticket_created_email'
  | 'ticket_created_telegram'
  | 'ticket_reply_email'
  | 'ticket_reply_telegram'
  | 'rent_payment_awaiting_approval_email'
  | 'rent_payment_awaiting_approval_telegram'

const preferenceLabels: Array<{ key: PreferenceKey; label: string }> = [
  { key: 'ticket_created_email', label: 'Ticket created (Email)' },
  { key: 'ticket_created_telegram', label: 'Ticket created (Telegram)' },
  { key: 'ticket_reply_email', label: 'Ticket reply (Email)' },
  { key: 'ticket_reply_telegram', label: 'Ticket reply (Telegram)' },
  { key: 'rent_payment_awaiting_approval_email', label: 'Rent approval (Email)' },
  { key: 'rent_payment_awaiting_approval_telegram', label: 'Rent approval (Telegram)' },
]

export function OwnerNotificationsPage() {
  const { token, owner, refresh: refreshOwnerProfile } = useOwnerAuth()
  const { notifications, unreadCount, loading, error: notificationsError, refresh, markRead, markAllRead } =
    useOwnerNotifications()
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

  const pageError = useMemo(() => notificationsError ?? telegramError, [notificationsError, telegramError])

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

  return (
    <section className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-[#1A1A1A]">
          <Bell className="h-6 w-6 text-[#FED609]" />
          Notifications
        </h2>
        <p className="text-sm text-[#6B7280]">Ticket and reminder events from tenants.</p>
      </div>

      {!loading && telegramOnboarding ? (
        <div className="rounded-xl border border-[#0088cc]/20 bg-[#f0f9ff] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-[#1A1A1A]">
            <Send className="h-5 w-5 text-[#0088cc]" />
            Telegram Alerts
          </h3>
          <p className="mt-2 text-sm text-[#4B5563]">
            {telegramOnboarding.connected
              ? `Connected${telegramOnboarding.linked_chat?.username ? ` as @${telegramOnboarding.linked_chat.username}` : ''}.`
              : 'Connect Telegram to receive instant owner alerts.'}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">Open bot, tap Start once, then click Refresh status.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!telegramOnboarding.connected ? (
              <button
                type="button"
                className="rounded-xl border border-[#0088cc] bg-[#0088cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#006fa1] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={connectTelegram}
                disabled={!telegramOnboarding.connect_url}
              >
                Connect Telegram
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#FEFAEF] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={disconnectTelegram}
                disabled={disconnectingTelegram}
              >
                {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
              </button>
            )}
            <button
              type="button"
              className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-sm font-semibold text-[#4B5563] hover:bg-[#FEFAEF]"
              onClick={() => {
                void loadNotifications()
              }}
            >
              Refresh status
            </button>
          </div>
        </div>
      ) : null}

            <article className="ph-surface-card rounded-xl p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">WhatsApp Bot Link</p>
              <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Owner WhatsApp number</h3>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                Set the number that will send commands to the bot. Use E.164 format, for example `+9198XXXXXXX`.
              </p>
              <div className="mt-4 space-y-3">
                <FormInput
                  label="Support WhatsApp"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="+15551234567"
                  autoComplete="tel"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => void saveWhatsappNumber()} disabled={savingWhatsapp}>
                    {savingWhatsapp ? 'Saving...' : 'Save WhatsApp Number'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setWhatsappNumber(owner?.support_whatsapp ?? '')
                      setWhatsappStatus(null)
                    }}
                    disabled={savingWhatsapp}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-[var(--ph-text-muted)]">
                  After saving, send `help` from this same number to your Meta test number on WhatsApp to verify bot replies.
                </p>
                {whatsappStatus ? <p className="text-xs text-[var(--ph-success)]">{whatsappStatus}</p> : null}
              </div>
            </article>

            {preferences ? (
              <article className="ph-surface-card rounded-xl p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Preferences</p>
                <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Delivery preferences</h3>
                <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Choose which channels should receive owner automation alerts.</p>
                <div className="mt-5 grid gap-3">
                  {preferenceLabels.map((item) => (
                    <FormToggle
                      key={item.key}
                      label={item.label}
                      description="Immediate owner notification routing for this event type."
                      checked={preferences[item.key]}
                      onToggle={() => {
                        void togglePreference(item.key)
                      }}
                      disabled={updatingPreferenceKey === item.key}
                    />
                  ))}
                </div>
              </article>
            ) : null}
          </div>

          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Delivery Logs</p>
            <h3 className="ph-title mt-3 text-xl font-semibold text-[var(--ph-text)]">Recent Telegram deliveries</h3>
            <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Latest 10 Telegram delivery attempts for this owner account.</p>
            <div className="mt-5">
              {loadingDeliveryLogs ? (
                <LoadingState message="Loading delivery logs..." rows={3} />
              ) : deliveryLogs.length === 0 ? (
                <EmptyState title="No delivery logs yet" description="Telegram delivery attempts will appear here once alert routing starts." />
              ) : (
                <DataTable headers={['Event', 'Status', 'Attempts', 'Created']}>
                  {deliveryLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-[var(--ph-text)]">{log.event_type}</td>
                      <td className="px-4 py-3">
                        <span className={log.status === 'success' ? 'text-[var(--ph-success)]' : 'text-red-200'}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{log.attempts}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-muted)]">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </div>
          </article>

          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="Owner notifications appear here when resident tickets or rent events need your attention."
              icon={<Inbox className="h-5 w-5" />}
            />
          ) : (
            <article className="space-y-4">
              <div className="ph-page-header">
                <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Unread and recent events</h3>
                <p className="text-sm text-[var(--ph-text-muted)]">The bell dropdown and this page use the same notification source of truth.</p>
              </div>
              <NotificationList notifications={notifications} onMarkRead={markRead} />
            </article>
          )}
        </>
      ) : null}
    </section>
  )
}
