import { Info, Mail, MessageCircle, Send } from 'lucide-react'
import { useTenantAuth } from '../../hooks/useTenantAuth'

// ─── Info banner ──────────────────────────────────────────────────────────────

function InfoBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#FED609]/30 bg-[#FED609]/10 px-4 py-3.5">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#92700A]" />
      <p
        className="text-sm leading-relaxed text-[#92700A]"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {message}
      </p>
    </div>
  )
}

// ─── Feature bullet ───────────────────────────────────────────────────────────

function FeatureBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
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

// ─── Channel card ─────────────────────────────────────────────────────────────

type ChannelCardProps = {
  iconBg: string
  icon: React.ReactNode
  name: string
  statusLabel: string
  statusStyle: string
  description: string
  features: string[]
  note?: React.ReactNode
}

function ChannelCard({
  iconBg,
  icon,
  name,
  statusLabel,
  statusStyle,
  description,
  features,
  note,
}: ChannelCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/20 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            {icon}
          </div>
          <h3
            className="text-base font-semibold text-[#1A1A1A]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {name}
          </h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {statusLabel === 'Active' && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          )}
          {statusLabel}
        </span>
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
          <FeatureBullet key={i} text={f} />
        ))}
      </ul>

      {/* Optional note */}
      {note && <div className="mt-5">{note}</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TenantIntegrationsPage() {
  const { tenant } = useTenantAuth()

  return (
    <div className="min-h-screen bg-[#FEFAEF] p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          My Integrations
        </h1>
        <p
          className="mt-1 text-sm text-[#6B7280]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Stay connected with your property manager
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-8">
        <InfoBanner message="Your property manager controls which channels are active for your account. Contact them to enable additional notification channels." />
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* WhatsApp */}
        <ChannelCard
          iconBg="bg-[#25D366]/10"
          icon={<MessageCircle className="h-5 w-5 text-[#25D366]" />}
          name="WhatsApp Notifications"
          statusLabel="Managed by Owner"
          statusStyle="bg-gray-100 text-gray-500"
          description="Receive automated rent reminders and property updates directly on WhatsApp."
          features={[
            'Monthly rent payment reminders',
            'Ticket status updates and replies',
            'Lease renewal notifications',
          ]}
          note={
            <div className="rounded-xl bg-[#FFFAE2] px-4 py-3">
              <p
                className="text-xs leading-relaxed text-[#92700A]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Contact your property manager to enable WhatsApp notifications for your account.
              </p>
            </div>
          }
        />

        {/* Telegram */}
        <ChannelCard
          iconBg="bg-[#0088CC]/10"
          icon={<Send className="h-5 w-5 text-[#0088CC]" />}
          name="Telegram Bot"
          statusLabel="Managed by Owner"
          statusStyle="bg-gray-100 text-gray-500"
          description="Connect Telegram to receive instant notifications for tickets, payment confirmations, and lease updates."
          features={[
            'Instant ticket and payment alerts',
            'Lease update and expiry reminders',
            'Real-time status notifications',
          ]}
          note={
            <div className="rounded-xl bg-[#FFFAE2] px-4 py-3">
              <p
                className="text-xs leading-relaxed text-[#92700A]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Ask your property manager or use the support page to get connected to the Telegram notification bot.
              </p>
            </div>
          }
        />

        {/* Email */}
        <ChannelCard
          iconBg="bg-blue-50"
          icon={<Mail className="h-5 w-5 text-blue-500" />}
          name="Email Notifications"
          statusLabel="Active"
          statusStyle="bg-green-100 text-green-700"
          description="You'll receive email notifications at your registered email address for all important updates."
          features={[
            'Ticket creation and status updates',
            'Payment confirmation receipts',
            'Lease expiry reminders',
          ]}
          note={
            tenant?.email ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p
                  className="text-xs text-[#6B7280]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Notifications delivered to
                </p>
                <p
                  className="mt-0.5 text-sm font-semibold text-[#1A1A1A]"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {tenant.email}
                </p>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  )
}
