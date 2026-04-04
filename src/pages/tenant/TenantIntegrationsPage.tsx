import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Info, Mail, MessageCircle, Send } from 'lucide-react'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { TelegramOnboardingState, TenantOwnerContact } from '../../types/api'
import { LoadingState } from '../../components/common/LoadingState'

function FeatureBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-xs font-bold text-[#4E79FF] font-['DM_Sans']">✓</span>
      <span className="text-sm text-[#8D8D96] font-['Manrope']">{text}</span>
    </li>
  )
}

type StatusChipProps = { label: string; variant: 'active' | 'inactive' | 'managed' | 'connected' }
function StatusChip({ label, variant }: StatusChipProps) {
  const styles = {
    active: 'bg-[#32C382]/15 text-[#32C382] border border-[#32C382]/20',
    connected: 'bg-[#32C382]/15 text-[#32C382] border border-[#32C382]/20',
    inactive: 'bg-[#8D8D96]/15 text-[#8D8D96] border border-[#272839]',
    managed: 'bg-[#8D8D96]/15 text-[#8D8D96] border border-[#272839]',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-['DM_Sans'] ${styles[variant]}`}>
      {(variant === 'active' || variant === 'connected') && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#32C382]" />
      )}
      {label}
    </span>
  )
}

export function TenantIntegrationsPage() {
  const { token, tenant } = useTenantAuth()
  const [telegramState, setTelegramState] = useState<TelegramOnboardingState | null>(null)
  const [ownerContact, setOwnerContact] = useState<TenantOwnerContact | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!token) return
    try {
      const [telegramRes, ownerRes] = await Promise.allSettled([
        api.getTenantTelegramOnboarding(token),
        api.getTenantOwnerContact(token),
      ])
      if (telegramRes.status === 'fulfilled') setTelegramState(telegramRes.value.onboarding)
      if (ownerRes.status === 'fulfilled') setOwnerContact(ownerRes.value.owner)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void loadData() }, [loadData])

  const whatsappAvailable = Boolean(ownerContact?.support_whatsapp)
  const telegramConnected = telegramState?.connected ?? false
  const telegramHasUrl = Boolean(telegramState?.connect_url)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070B] p-6 lg:p-8">
        <LoadingState message="Loading integrations..." rows={3} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06070B] p-4 sm:p-6 lg:p-8 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-['Sora']">My Integrations</h1>
        <p className="mt-1 text-sm text-[#8D8D96] font-['Manrope']">Stay connected with your property manager</p>
      </div>

      {/* Info banner */}
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[#4E79FF]/20 bg-[#4E79FF]/10 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#4E79FF]" />
        <p className="text-sm leading-relaxed text-[#8D8D96] font-['Manrope']">
          Your property manager controls which channels are active for your account. Contact them to enable additional notification channels.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        {/* WhatsApp */}
        <div className="flex flex-col rounded-2xl border border-[#272839] bg-[#101114] p-6 transition-all hover:border-[#4E79FF]/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </div>
              <h3 className="text-base font-semibold text-white font-['Sora']">WhatsApp Notifications</h3>
            </div>
            <StatusChip
              label={whatsappAvailable ? 'Active' : 'Not Configured'}
              variant={whatsappAvailable ? 'active' : 'managed'}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#8D8D96] font-['Manrope']">
            Receive automated rent reminders and property updates directly on WhatsApp.
          </p>

          <ul className="mt-4 space-y-1.5">
            {['Monthly rent payment reminders', 'Ticket status updates and replies', 'Lease renewal notifications'].map((f) => (
              <FeatureBullet key={f} text={f} />
            ))}
          </ul>

          <div className="mt-5">
            {whatsappAvailable ? (
              <div className="rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-3">
                <p className="text-xs text-[#8D8D96] font-['DM_Sans']">Owner WhatsApp</p>
                <p className="mt-0.5 text-sm font-semibold text-white font-['Manrope']">{ownerContact?.support_whatsapp}</p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#141519] border border-[#272839] px-4 py-3">
                <p className="text-xs leading-relaxed text-[#8D8D96] font-['Manrope']">
                  Contact your property manager to enable WhatsApp notifications for your account.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Telegram */}
        <div className="flex flex-col rounded-2xl border border-[#272839] bg-[#101114] p-6 transition-all hover:border-[#4E79FF]/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0088CC]/10">
                <Send className="h-5 w-5 text-[#0088CC]" />
              </div>
              <h3 className="text-base font-semibold text-white font-['Sora']">Telegram Bot</h3>
            </div>
            <StatusChip
              label={telegramConnected ? 'Connected' : telegramHasUrl ? 'Not Connected' : 'Not Configured'}
              variant={telegramConnected ? 'connected' : 'managed'}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#8D8D96] font-['Manrope']">
            Connect Telegram to receive instant notifications for tickets, payment confirmations, and lease updates.
          </p>

          <ul className="mt-4 space-y-1.5">
            {['Instant ticket and payment alerts', 'Lease update and expiry reminders', 'Real-time status notifications'].map((f) => (
              <FeatureBullet key={f} text={f} />
            ))}
          </ul>

          <div className="mt-5">
            {telegramConnected && telegramState?.linked_chat ? (
              <div className="rounded-xl bg-[#0088CC]/10 border border-[#0088CC]/20 px-4 py-3">
                <p className="text-xs text-[#8D8D96] font-['DM_Sans']">Connected as</p>
                <p className="mt-0.5 text-sm font-semibold text-white font-['Manrope']">
                  {telegramState.linked_chat.first_name ?? telegramState.linked_chat.username ?? 'Telegram user'}
                  {telegramState.linked_chat.username ? ` (@${telegramState.linked_chat.username})` : ''}
                </p>
              </div>
            ) : telegramHasUrl ? (
              <a
                href={telegramState!.connect_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0088CC] px-4 py-3 text-sm font-bold text-white hover:bg-[#0077b5] transition-colors font-['DM_Sans']"
              >
                <ExternalLink className="h-4 w-4" />
                Connect Telegram
              </a>
            ) : (
              <div className="rounded-xl bg-[#141519] border border-[#272839] px-4 py-3">
                <p className="text-xs leading-relaxed text-[#8D8D96] font-['Manrope']">
                  Your property manager has not configured the Telegram bot yet. Contact them to enable it.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col rounded-2xl border border-[#272839] bg-[#101114] p-6 transition-all hover:border-[#4E79FF]/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4E79FF]/10">
                <Mail className="h-5 w-5 text-[#4E79FF]" />
              </div>
              <h3 className="text-base font-semibold text-white font-['Sora']">Email Notifications</h3>
            </div>
            <StatusChip label="Active" variant="active" />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#8D8D96] font-['Manrope']">
            You'll receive email notifications at your registered email address for all important updates.
          </p>

          <ul className="mt-4 space-y-1.5">
            {['Ticket creation and status updates', 'Payment confirmation receipts', 'Lease expiry reminders'].map((f) => (
              <FeatureBullet key={f} text={f} />
            ))}
          </ul>

          {tenant?.email ? (
            <div className="mt-5 rounded-xl bg-[#141519] border border-[#272839] px-4 py-3">
              <p className="text-xs text-[#8D8D96] font-['DM_Sans']">Notifications delivered to</p>
              <p className="mt-0.5 text-sm font-semibold text-white font-['Manrope']">{tenant.email}</p>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  )
}
