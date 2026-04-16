import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  FileText,
  Inbox,
  Megaphone,
  MessageCircle,
  Send,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { useOwnerNotifications } from '../../hooks/useOwnerNotifications'
import { api } from '../../services/api'
import type { OwnerNotification, Property, Tenant } from '../../types/api'

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
  const { token, owner } = useOwnerAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead, refresh } = useOwnerNotifications()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  // Properties + tenants for broadcast targeting
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [broadcastPropertyId, setBroadcastPropertyId] = useState<string>('all')

  // Broadcast compose state
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastTopic, setBroadcastTopic] = useState('')
  const [broadcastDraft, setBroadcastDraft] = useState('')
  const [broadcastGenerating, setBroadcastGenerating] = useState(false)
  const [broadcastCopied, setBroadcastCopied] = useState(false)

  // Tenants relevant to the selected property
  const targetTenants = useMemo(() => {
    if (broadcastPropertyId === 'all') return tenants
    return tenants.filter((t) => t.property_id === broadcastPropertyId)
  }, [tenants, broadcastPropertyId])

  const ownerName = owner?.full_name || owner?.email || undefined

  const handleGenerateBroadcast = async () => {
    if (!token || !broadcastTopic.trim()) return
    try {
      setBroadcastGenerating(true)
      const result = await api.draftOwnerBroadcast(token, { topic: broadcastTopic.trim(), owner_name: ownerName })
      if (result.ok && result.draft) {
        setBroadcastDraft(result.draft.draft)
      }
    } catch {
      // silently fail
    } finally {
      setBroadcastGenerating(false)
    }
  }

  const handleCopyBroadcast = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setBroadcastCopied(true)
    setTimeout(() => setBroadcastCopied(false), 2000)
  }

  const closeBroadcast = () => {
    setBroadcastOpen(false)
    setBroadcastTopic('')
    setBroadcastDraft('')
    setBroadcastCopied(false)
    setBroadcastPropertyId('all')
    setSearchParams((prev) => { prev.delete('compose'); return prev }, { replace: true })
  }

  // Build personalised message for a specific tenant
  const personalise = (draft: string, tenant: Tenant) => {
    const name = tenant.full_name || 'Resident'
    return draft.replace(/\[Tenant Name\]/gi, name)
  }

  const waLink = (tenant: Tenant, text: string) => {
    const digits = (tenant.phone ?? '').replace(/\D/g, '')
    if (!digits) return null
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  }

  const tgLink = (tenant: Tenant, _text: string) => {
    const digits = (tenant.phone ?? '').replace(/\D/g, '')
    if (!digits) return null
    return `https://t.me/+${digits}`
  }

  useEffect(() => {
    void refresh({ silent: true })
  }, [refresh])

  useEffect(() => {
    if (!token) return
    api.getOwnerProperties(token)
      .then((res) => setProperties(res.properties ?? []))
      .catch(() => {})
    api.getOwnerTenants(token)
      .then((res) => setTenants(res.tenants ?? []))
      .catch(() => {})
  }, [token])

  // Auto-open broadcast modal if ?compose=broadcast in URL
  useEffect(() => {
    if (searchParams.get('compose') === 'broadcast') {
      setBroadcastOpen(true)
    }
  }, [searchParams])

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
          <div className="flex items-center gap-3 pb-2">
            <button
              type="button"
              onClick={() => setBroadcastOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold font-['DM_Sans'] transition-colors"
              style={{ backgroundColor: 'rgba(78,121,255,0.15)', color: '#4E79FF', border: '1px solid rgba(78,121,255,0.35)' }}
            >
              <Megaphone className="w-4 h-4" />
              Compose Broadcast
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-white font-['DM_Sans'] font-bold text-sm flex items-center gap-1.5 hover:text-[#4E79FF] transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>
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

      {/* Broadcast Compose Modal */}
      <Modal isOpen={broadcastOpen} onClose={closeBroadcast} title="Compose Broadcast" size="md">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#8D8D96', fontFamily: 'Manrope, sans-serif' }}>
            Describe what you want to tell your tenants. AI drafts the message using only the details you provide.
          </p>

          {/* Property selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>
              Target Property
            </label>
            <select
              value={broadcastPropertyId}
              onChange={(e) => setBroadcastPropertyId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: '#141519', border: '1px solid #272839', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.property_name}</option>
              ))}
            </select>
          </div>

          {/* Topic input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>
              What do you want to tell your tenants?
            </label>
            <textarea
              rows={2}
              value={broadcastTopic}
              onChange={(e) => setBroadcastTopic(e.target.value)}
              placeholder="e.g. Water will be off on Friday 9am–12pm for maintenance"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ backgroundColor: '#141519', border: '1px solid #272839', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
            />
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={() => void handleGenerateBroadcast()}
            disabled={broadcastGenerating || !broadcastTopic.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold w-full justify-center transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'rgba(78,121,255,0.15)', color: '#4E79FF', border: '1px solid rgba(78,121,255,0.35)' }}
          >
            <Sparkles className="w-4 h-4" />
            {broadcastGenerating ? 'Generating…' : 'Generate with AI'}
          </button>

          {/* Draft preview */}
          {broadcastDraft ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>
                  Draft Message
                </label>
                <span className="text-[10px]" style={{ color: '#8D8D96' }}>[Tenant Name] will be replaced per send</span>
              </div>
              <textarea
                rows={5}
                value={broadcastDraft}
                onChange={(e) => setBroadcastDraft(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                style={{ backgroundColor: '#141519', border: '1px solid rgba(78,121,255,0.3)', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
              />
            </div>
          ) : null}

          {/* Per-tenant send buttons */}
          {broadcastDraft && targetTenants.length > 0 ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8D8D96', fontFamily: 'DM Sans, sans-serif' }}>
                Send to Tenants
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {targetTenants.map((tenant) => {
                  const msg = personalise(broadcastDraft, tenant)
                  const wa = waLink(tenant, msg)
                  const tg = tgLink(tenant, msg)
                  return (
                    <div key={tenant.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: '#141519', border: '1px solid #272839' }}>
                      <span className="text-sm font-medium truncate mr-2" style={{ color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}>
                        {tenant.full_name || tenant.email || 'Tenant'}
                      </span>
                      <div className="flex gap-2 shrink-0">
                        {wa ? (
                          <a href={wa} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                            style={{ backgroundColor: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}
                            onClick={() => void handleCopyBroadcast(msg)}
                          >
                            <MessageCircle className="w-3 h-3" /> WA
                          </a>
                        ) : null}
                        {tg ? (
                          <a href={tg} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                            style={{ backgroundColor: 'rgba(0,136,204,0.15)', color: '#0088cc', border: '1px solid rgba(0,136,204,0.3)' }}
                          >
                            <Send className="w-3 h-3" /> TG
                          </a>
                        ) : null}
                        {!wa && !tg ? (
                          <span className="text-[11px]" style={{ color: '#8D8D96' }}>No phone</span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-1.5 text-[10px]" style={{ color: '#8D8D96' }}>Clicking WA copies the personalised message and opens WhatsApp. For Telegram, copy first then paste after opening.</p>
            </div>
          ) : null}

          {/* Copy full draft button */}
          {broadcastDraft ? (
            <button
              type="button"
              onClick={() => void handleCopyBroadcast(broadcastDraft)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold w-full justify-center transition-colors"
              style={{ backgroundColor: broadcastCopied ? 'rgba(50,195,130,0.15)' : '#141519', color: broadcastCopied ? '#32C382' : '#FFFFFF', border: `1px solid ${broadcastCopied ? 'rgba(50,195,130,0.4)' : '#272839'}` }}
            >
              {broadcastCopied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {broadcastCopied ? 'Copied!' : 'Copy Draft (with placeholder)'}
            </button>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}


