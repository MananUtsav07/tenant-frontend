import { useCallback, useEffect, useState } from 'react'
import { Mail, Send, MessageCircle, Instagram, CheckCircle2, Clock, Zap } from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationsStatus = {
  whatsapp: { configured: boolean; provider: string | null; live: boolean }
  telegram: { configured: boolean }
  email: { configured: boolean }
  instagram: { configured: boolean; coming_soon: boolean }
}

// ─── Base URL helper ──────────────────────────────────────────────────────────

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)
    ?.trim()
    ?.split(',')[0]
    ?.trim()
    .replace(/\/$/, '')
    .replace(/\/api$/, '') ?? 'http://localhost:8787'

// ─── Feature bullet ───────────────────────────────────────────────────────────

function FeatureBullet({ text, dimmed = false }: { text: string; dimmed?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${dimmed ? 'opacity-40' : ''}`}>
      <span
        className="mt-0.5 shrink-0 text-xs font-bold text-[#FED609]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        ✓
      </span>
      <span
        className="text-sm text-[#6B7280]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {text}
      </span>
    </li>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type BadgeVariant = 'active' | 'inactive' | 'coming_soon' | 'test_mode'

function StatusBadge({ variant, label }: { variant: BadgeVariant; label: string }) {
  const styles: Record<BadgeVariant, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    coming_soon: 'bg-[#FED609]/20 text-[#92700A]',
    test_mode: 'bg-orange-100 text-orange-600',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant]}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {variant === 'active' && (
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      )}
      {label}
    </span>
  )
}

// ─── Integration card ─────────────────────────────────────────────────────────

type IntegrationCardProps = {
  iconBg: string
  icon: React.ReactNode
  name: string
  badge: React.ReactNode
  providerLine?: React.ReactNode
  description: string
  features: Array<{ text: string; dimmed?: boolean }>
  footerAction: React.ReactNode
}

function IntegrationCard({
  iconBg,
  icon,
  name,
  badge,
  providerLine,
  description,
  features,
  footerAction,
}: IntegrationCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/20 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h3
              className="text-base font-semibold text-[#1A1A1A]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {name}
            </h3>
            {providerLine && (
              <div className="mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {providerLine}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0">{badge}</div>
      </div>

      {/* Description */}
      <p
        className="mt-4 text-sm leading-relaxed text-[#6B7280]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {description}
      </p>

      {/* Features */}
      <ul className="mt-4 space-y-1.5">
        {features.map((f, i) => (
          <FeatureBullet key={i} text={f.text} dimmed={f.dimmed} />
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-6 flex items-center">{footerAction}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OwnerIntegrationsPage() {
  const { token } = useOwnerAuth()
  const [status, setStatus] = useState<IntegrationsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIntegrations = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}/api/owner/integrations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Server responded ${res.status}`)
      const json = (await res.json()) as { ok: boolean; integrations: IntegrationsStatus }
      if (!json.ok) throw new Error('Unexpected response from server')
      setStatus(json.integrations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration status.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchIntegrations()
  }, [fetchIntegrations])

  // ─── WhatsApp footer action ─────────────────────────────────────────────────

  const whatsappFooter = status ? (
    status.whatsapp.configured ? (
      <span
        className="flex items-center gap-1.5 text-sm font-medium text-green-600"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Connected
      </span>
    ) : (
      <button
        className="rounded-xl border border-[#FED609] bg-white px-4 py-2 text-sm font-semibold text-[#92700A] transition-colors hover:bg-[#FED609]/10"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Setup Required
      </button>
    )
  ) : null

  // ─── Telegram footer action ─────────────────────────────────────────────────

  const telegramFooter = status ? (
    status.telegram.configured ? (
      <span
        className="flex items-center gap-1.5 text-sm font-medium text-green-600"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Connected
      </span>
    ) : (
      <button
        className="rounded-xl border border-[#FED609] bg-white px-4 py-2 text-sm font-semibold text-[#92700A] transition-colors hover:bg-[#FED609]/10"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Setup Required
      </button>
    )
  ) : null

  // ─── Email footer action ────────────────────────────────────────────────────

  const emailFooter = (
    <span
      className="flex items-center gap-1.5 text-sm font-medium text-green-600"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <CheckCircle2 className="h-4 w-4" />
      Always Active
    </span>
  )

  // ─── Instagram footer action ────────────────────────────────────────────────

  const instagramFooter = (
    <button
      disabled
      className="flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-[#FED609]/20 px-4 py-2 text-sm font-semibold text-[#92700A] opacity-80"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Clock className="h-3.5 w-3.5" />
      Coming Soon
    </button>
  )

  // ─── WhatsApp provider line ─────────────────────────────────────────────────

  const whatsappProviderLine = status?.whatsapp.provider ? (
    <span className="text-xs text-[#6B7280]">
      {status.whatsapp.provider} &middot;{' '}
      <span className={status.whatsapp.live ? 'text-green-600' : 'text-orange-500'}>
        {status.whatsapp.live ? 'Live mode' : 'Test mode'}
      </span>
    </span>
  ) : null

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FEFAEF] p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FED609]/20">
            <Zap className="h-5 w-5 text-[#92700A]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Integrations
            </h1>
            <p
              className="mt-0.5 text-sm text-[#6B7280]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Manage your messaging channels and third-party connections
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <LoadingState message="Fetching integration status..." rows={4} />
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorState message={error} />
      )}

      {/* Cards grid */}
      {!loading && !error && status && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* WhatsApp Business */}
          <IntegrationCard
            iconBg="bg-[#25D366]/10"
            icon={<MessageCircle className="h-5 w-5 text-[#25D366]" />}
            name="WhatsApp Business"
            badge={
              <StatusBadge
                variant={status.whatsapp.configured ? 'active' : 'inactive'}
                label={status.whatsapp.configured ? 'Connected' : 'Not Connected'}
              />
            }
            providerLine={whatsappProviderLine}
            description="Automate tenant reminders, receive payment notifications, and manage your portfolio via WhatsApp Business API."
            features={[
              { text: 'Payment reminders sent automatically on due dates' },
              { text: 'Tenant notifications for tickets and lease updates' },
              { text: 'Owner bot commands: /ownerstats, /reply, /addtenant' },
            ]}
            footerAction={whatsappFooter}
          />

          {/* Telegram */}
          <IntegrationCard
            iconBg="bg-[#0088CC]/10"
            icon={<Send className="h-5 w-5 text-[#0088CC]" />}
            name="Telegram"
            badge={
              <StatusBadge
                variant={status.telegram.configured ? 'active' : 'inactive'}
                label={status.telegram.configured ? 'Connected' : 'Not Configured'}
              />
            }
            description="Send automated notifications to tenants and owners through Telegram. Supports tenant onboarding bots and payment reminders."
            features={[
              { text: 'Payment reminders and confirmation messages' },
              { text: 'Ticket notifications and status updates' },
              { text: 'Tenant onboarding bot for seamless setup' },
            ]}
            footerAction={telegramFooter}
          />

          {/* Instagram DMs */}
          <IntegrationCard
            iconBg="bg-gradient-to-br from-pink-100 to-purple-100"
            icon={<Instagram className="h-5 w-5 text-pink-500" />}
            name="Instagram DMs"
            badge={<StatusBadge variant="coming_soon" label="Coming Soon" />}
            description="Respond to tenant inquiries directly from Instagram DMs. AI-powered auto-replies keep communication seamless."
            features={[
              { text: 'Auto-reply to tenant DMs', dimmed: true },
              { text: 'Lead capture from Instagram inquiries', dimmed: true },
              { text: 'Story mentions tracking', dimmed: true },
            ]}
            footerAction={instagramFooter}
          />

          {/* Email */}
          <IntegrationCard
            iconBg="bg-blue-50"
            icon={<Mail className="h-5 w-5 text-blue-500" />}
            name="Email Notifications"
            badge={<StatusBadge variant="active" label="Active" />}
            description="Automated email notifications for ticket updates, payment confirmations, and lease reminders."
            features={[
              { text: 'Ticket creation and status update emails' },
              { text: 'Payment confirmation receipts' },
              { text: 'Lease expiry and renewal reminders' },
            ]}
            footerAction={emailFooter}
          />
        </div>
      )}
    </div>
  )
}
