import { useCallback, useEffect, useRef, useState } from 'react'
import { Mail, Send, MessageCircle, Instagram, CheckCircle2, Clock, Zap, X, ArrowLeft } from 'lucide-react'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationsStatus = {
  whatsapp: { configured: boolean; provider: string | null; live: boolean; linked: boolean; linked_number: string | null }
  telegram: {
    configured: boolean
    linked: boolean
    bot_username: string | null
    connect_url: string | null
    linked_chat: {
      chat_id: string
      username: string | null
      first_name: string | null
      last_name: string | null
      linked_at: string
    } | null
  }
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
        className="mt-0.5 shrink-0 text-xs font-bold text-[#4E79FF]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        ✓
      </span>
      <span
        className="text-sm text-[#8D8D96]"
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
    active: 'bg-[#32C382]/15 text-[#32C382]',
    inactive: 'bg-white/8 text-[#8D8D96]',
    coming_soon: 'bg-[#4E79FF]/15 text-[#4E79FF]',
    test_mode: 'bg-[#EBCF42]/15 text-[#EBCF42]',
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
    <div className="group flex flex-col rounded-2xl border border-[#272839] bg-[#101114] p-6 shadow-sm transition-all hover:border-[#4E79FF]/20 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h3
              className="text-base font-semibold text-white"
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
        className="mt-4 text-sm leading-relaxed text-[#8D8D96]"
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

// ─── WhatsApp OTP Modal ───────────────────────────────────────────────────────

type WaModalProps = {
  open: boolean
  sandboxMode: boolean
  token: string
  onClose: () => void
  onConnected: () => void
}

function isValidE164(val: string) {
  return /^\+[1-9]\d{6,14}$/.test(val.replace(/\s/g, ''))
}

function WhatsAppModal({ open, sandboxMode, token, onClose, onConnected }: WaModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('phone')
      setPhone('')
      setOtp('')
      setPhoneError(null)
      setOtpError(null)
      setBusy(false)
    }
  }, [open])

  const handleSendOtp = useCallback(async () => {
    const normalized = phone.replace(/\s/g, '')
    if (!isValidE164(normalized)) {
      setPhoneError('Enter number with country code, e.g. +91 98765 43210')
      return
    }
    setPhoneError(null)
    setBusy(true)
    try {
      await api.ownerWhatsAppSendOtp(token, { phone: normalized })
      setStep('otp')
      setOtp('')
      setOtpError(null)
    } catch (err) {
      setPhoneError(err instanceof Error ? err.message : 'Failed to send code — try again')
    } finally {
      setBusy(false)
    }
  }, [phone, token])

  const handleVerifyOtp = useCallback(async () => {
    const normalized = phone.replace(/\s/g, '')
    setOtpError(null)
    setBusy(true)
    try {
      await api.ownerWhatsAppVerifyOtp(token, { phone: normalized, code: otp.trim() })
      onConnected()
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Verification failed — try again')
    } finally {
      setBusy(false)
    }
  }, [phone, otp, token, onConnected])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-[#272839] bg-[#101114] p-6 shadow-2xl"
      >
        {/* Modal header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#32C382]/15">
              <MessageCircle className="h-4 w-4 text-[#32C382]" />
            </div>
            <h2
              className="text-base font-semibold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Connect WhatsApp
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#8D8D96] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sandbox warning */}
        {sandboxMode && (
          <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
            <p
              className="text-xs leading-relaxed text-amber-400"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <span className="font-semibold">Sandbox mode:</span> your number must have joined the Twilio sandbox first. Send{' '}
              <span className="font-mono font-semibold">join &lt;sandbox-keyword&gt;</span> to +14155238886 on WhatsApp.
            </p>
          </div>
        )}

        {step === 'phone' && (
          <>
            <p
              className="mb-4 text-sm text-[#8D8D96]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Enter your WhatsApp number with country code. We'll send a 6-digit verification code.
            </p>
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium text-[#C0C0C5]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Phone number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !busy) void handleSendOtp() }}
                className="w-full rounded-xl border border-[#272839] bg-[#0C0D10] px-3.5 py-2.5 text-sm text-white placeholder-[#5A5A66] outline-none focus:border-[#25D366]/60 focus:ring-1 focus:ring-[#25D366]/30"
                style={{ fontFamily: "'Manrope', sans-serif" }}
                autoFocus
              />
              {phoneError && (
                <p
                  className="text-xs text-red-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {phoneError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleSendOtp()}
              disabled={busy || !phone.trim()}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#25D366', fontFamily: "'DM Sans', sans-serif" }}
            >
              {busy ? 'Sending…' : 'Send Code →'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setOtpError(null) }}
              className="mb-3 flex items-center gap-1.5 text-xs text-[#8D8D96] transition-colors hover:text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <ArrowLeft className="h-3 w-3" />
              {phone}
            </button>
            <p
              className="mb-4 text-sm text-[#8D8D96]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Enter the 6-digit code sent to your WhatsApp.
            </p>
            <div className="space-y-1.5">
              <label
                className="block text-xs font-medium text-[#C0C0C5]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !busy) void handleVerifyOtp() }}
                className="w-full rounded-xl border border-[#272839] bg-[#0C0D10] px-3.5 py-2.5 text-center text-xl font-mono tracking-[0.4em] text-white placeholder-[#5A5A66] outline-none focus:border-[#25D366]/60 focus:ring-1 focus:ring-[#25D366]/30"
                autoFocus
              />
              {otpError && (
                <p
                  className="text-xs text-red-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {otpError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleVerifyOtp()}
              disabled={busy || otp.length !== 6}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#25D366', fontFamily: "'DM Sans', sans-serif" }}
            >
              {busy ? 'Verifying…' : 'Verify & Connect'}
            </button>
            <button
              type="button"
              onClick={() => { setOtp(''); setOtpError(null); void handleSendOtp() }}
              disabled={busy}
              className="mt-2 w-full text-center text-xs text-[#8D8D96] transition-colors hover:text-white disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Resend code
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OwnerIntegrationsPage() {
  const { token } = useOwnerAuth()
  const [status, setStatus] = useState<IntegrationsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [waModalOpen, setWaModalOpen] = useState(false)

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

  const openTelegramConnect = useCallback(() => {
    if (!status?.telegram.connect_url) return
    window.open(status.telegram.connect_url, '_blank', 'noopener,noreferrer')
  }, [status?.telegram.connect_url])

  const handleWaConnected = useCallback(() => {
    setWaModalOpen(false)
    void fetchIntegrations()
  }, [fetchIntegrations])

  // ─── WhatsApp footer action ─────────────────────────────────────────────────

  const whatsappFooter = status ? (
    !status.whatsapp.configured ? (
      <button
        className="rounded-xl border border-[#4E79FF] bg-[#101114] px-4 py-2 text-sm font-semibold text-[#4E79FF] transition-colors hover:bg-[#141519]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Setup Required
      </button>
    ) : status.whatsapp.linked ? (
      <span
        className="flex items-center gap-1.5 text-sm font-medium text-[#32C382]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Connected{status.whatsapp.linked_number ? ` (${status.whatsapp.linked_number})` : ''}
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setWaModalOpen(true)}
        className="rounded-xl border border-[#4E79FF] bg-[#101114] px-4 py-2 text-sm font-semibold text-[#4E79FF] transition-colors hover:bg-[#141519]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Connect WhatsApp
      </button>
    )
  ) : null

  // ─── Telegram footer action ─────────────────────────────────────────────────

  const telegramFooter = status ? (
    !status.telegram.configured ? (
      <button
        className="rounded-xl border border-[#4E79FF] bg-[#101114] px-4 py-2 text-sm font-semibold text-[#4E79FF] transition-colors hover:bg-[#141519]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Setup Required
      </button>
    ) : status.telegram.linked ? (
      <span
        className="flex items-center gap-1.5 text-sm font-medium text-[#32C382]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Connected
      </span>
    ) : (
      <button
        type="button"
        onClick={openTelegramConnect}
        disabled={!status.telegram.connect_url}
        className="rounded-xl border border-[#4E79FF] bg-[#101114] px-4 py-2 text-sm font-semibold text-[#4E79FF] transition-colors hover:bg-[#141519] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Connect Telegram
      </button>
    )
  ) : null

  // ─── Email footer action ────────────────────────────────────────────────────

  const emailFooter = (
    <span
      className="flex items-center gap-1.5 text-sm font-medium text-[#32C382]"
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
      className="flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-[#4E79FF]/15 px-4 py-2 text-sm font-semibold text-[#4E79FF] opacity-80"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Clock className="h-3.5 w-3.5" />
      Coming Soon
    </button>
  )

  // ─── WhatsApp provider line ─────────────────────────────────────────────────

  const whatsappProviderLine = status?.whatsapp.provider ? (
    <span className="text-xs text-[#8D8D96]">
      {status.whatsapp.provider} &middot;{' '}
      <span className={status.whatsapp.live ? 'text-[#32C382]' : 'text-orange-500'}>
        {status.whatsapp.live ? 'Live mode' : 'Test mode'}
      </span>
      {status.whatsapp.linked ? ' · linked to owner' : ' · available to connect'}
    </span>
  ) : null

  const telegramProviderLine = status?.telegram.configured ? (
    <span className="text-xs text-[#8D8D96]">
      {status.telegram.bot_username ? `@${status.telegram.bot_username}` : 'Telegram bot configured'}
      {status.telegram.linked ? ' · linked to owner' : ' · click connect then press Start'}
    </span>
  ) : null

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#06070B] p-4 sm:p-6 lg:p-8 text-white">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4E79FF]/15">
            <Zap className="h-5 w-5 text-[#4E79FF]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Integrations
            </h1>
            <p
              className="mt-0.5 text-sm text-[#8D8D96]"
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
            iconBg="bg-[#32C382]/15"
            icon={<MessageCircle className="h-5 w-5 text-[#32C382]" />}
            name="WhatsApp Business"
            badge={
              <StatusBadge
                variant={status.whatsapp.linked ? 'active' : status.whatsapp.configured ? 'test_mode' : 'inactive'}
                label={status.whatsapp.linked ? 'Connected' : status.whatsapp.configured ? 'Available' : 'Not Configured'}
              />
            }
            providerLine={whatsappProviderLine}
            description="Automate tenant reminders, receive payment notifications, and manage your portfolio via WhatsApp Business API."
            features={[
              { text: 'Payment reminders sent automatically on due dates' },
              { text: 'Tenant notifications for tickets and lease updates' },
              { text: 'Owner bot: stats, tickets, approvals via chat commands' },
            ]}
            footerAction={whatsappFooter}
          />

          {/* Telegram */}
          <IntegrationCard
            iconBg="bg-[#2251E3]/15"
            icon={<Send className="h-5 w-5 text-[#2251E3]" />}
            name="Telegram"
            badge={
              <StatusBadge
                variant={status.telegram.linked ? 'active' : status.telegram.configured ? 'test_mode' : 'inactive'}
                label={status.telegram.linked ? 'Connected' : status.telegram.configured ? 'Available' : 'Not Configured'}
              />
            }
            providerLine={telegramProviderLine}
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
            iconBg="bg-[#141519]"
            icon={<Instagram className="h-5 w-5 text-[#EBCF42]" />}
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
            iconBg="bg-[#141519]"
            icon={<Mail className="h-5 w-5 text-[#4E79FF]" />}
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

      {/* WhatsApp OTP Modal */}
      {token && (
        <WhatsAppModal
          open={waModalOpen}
          sandboxMode={status !== null && !status.whatsapp.live}
          token={token}
          onClose={() => setWaModalOpen(false)}
          onConnected={handleWaConnected}
        />
      )}
    </div>
  )
}
