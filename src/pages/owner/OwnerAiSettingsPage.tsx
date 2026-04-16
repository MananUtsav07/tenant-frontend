import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  CheckCircle,
  Crown,
  Lock,
  MessageCircle,
  Save,
  Send,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import { ROUTES } from '../../routes/constants'
import type { BillingState, OwnerAiSettings } from '../../types/api'

// ─── Gold toggle ──────────────────────────────────────────────────────────────

function GoldToggle({ checked, onToggle, disabled = false }: { checked: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none ${
        checked ? 'bg-[#FED609]' : 'bg-[#2A2A35]'
      } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  )
}

// ─── Plan tier helpers ────────────────────────────────────────────────────────

type PlanTier = 'all' | 'standard' | 'plus'

const TIER_LABELS: Record<PlanTier, string> = {
  all: 'All Plans',
  standard: 'Standard+',
  plus: 'Plus+',
}

const TIER_COLORS: Record<PlanTier, string> = {
  all: 'bg-[#32C382]/15 text-[#32C382] border-[#32C382]/30',
  standard: 'bg-[#4E79FF]/15 text-[#4E79FF] border-[#4E79FF]/30',
  plus: 'bg-[#EBCF42]/15 text-[#EBCF42] border-[#EBCF42]/30',
}

function PlanBadge({ tier }: { tier: PlanTier }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_COLORS[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

type AiFeatureCardProps = {
  icon: React.ReactNode
  iconColor: string
  title: string
  description: string
  tier: PlanTier
  locked: boolean
  active: boolean
  // if configurable via toggle
  toggle?: { checked: boolean; onToggle: () => void }
  // where to use it
  linkTo?: string
  linkLabel?: string
}

function AiFeatureCard({ icon, iconColor, title, description, tier, locked, active, toggle, linkTo, linkLabel }: AiFeatureCardProps) {
  return (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
      locked
        ? 'border-[#272839] bg-[#0d0e12] opacity-75'
        : active
        ? 'border-[rgba(83,88,100,0.5)] bg-[#101114]'
        : 'border-[#272839] bg-[#101114]'
    }`}>
      {locked && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#06070B]/40 z-10">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Lock className="h-5 w-5 text-[#8D8D96]" />
            <p className="text-xs font-bold text-[#8D8D96] font-['DM_Sans']">
              Requires {TIER_LABELS[tier]}
            </p>
            <Link
              to={ROUTES.ownerBilling}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#2251E3] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#4E79FF] transition-colors"
            >
              <Crown className="h-3 w-3" />
              Upgrade
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${iconColor}18` }}>
            <div style={{ color: iconColor }}>{icon}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white font-['Sora']">{title}</p>
              <PlanBadge tier={tier} />
            </div>
            {!locked && (
              <div className="mt-0.5 flex items-center gap-1">
                {active ? (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#32C382]" />
                    <p className="text-[10px] font-bold text-[#32C382] uppercase tracking-wider">Active</p>
                  </>
                ) : (
                  <>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8D8D96]" />
                    <p className="text-[10px] font-bold text-[#8D8D96] uppercase tracking-wider">Available</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {toggle && !locked && (
          <GoldToggle checked={toggle.checked} onToggle={toggle.onToggle} />
        )}
      </div>

      <p className="text-xs leading-relaxed text-[#8D8D96] font-['Manrope']">{description}</p>

      {linkTo && !locked && (
        <Link
          to={linkTo}
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
          style={{ color: iconColor }}
        >
          {linkLabel ?? 'Open feature'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OwnerAiSettingsPage() {
  const { token } = useOwnerAuth()
  const [settings, setSettings] = useState<OwnerAiSettings | null>(null)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const planCode = billing?.status === 'active' ? (billing.planCode ?? 'trial') : (billing?.status === 'trialing' ? 'trial' : 'trial')
  const hasStandard = planCode === 'standard' || planCode === 'plus' || planCode === 'beyond'
  const hasPlus = planCode === 'plus' || planCode === 'beyond'

  const loadSettings = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const [settingsRes, billingRes] = await Promise.all([
        api.getOwnerAiSettings(token),
        api.getBillingState(token),
      ])
      setSettings(settingsRes.settings)
      setAiConfigured(settingsRes.ai_configured)
      setBilling(billingRes.billing)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load AI settings')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void loadSettings() }, [loadSettings])

  const toggleField = (field: keyof Pick<OwnerAiSettings, 'automation_enabled' | 'ticket_classification_enabled' | 'reminder_generation_enabled' | 'ticket_summarization_enabled'>) => {
    setSettings((current) => {
      if (!current) return current
      return { ...current, [field]: !current[field] }
    })
  }

  const saveSettings = async () => {
    if (!token || !settings) return
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const response = await api.updateOwnerAiSettings(token, {
        automation_enabled: settings.automation_enabled,
        ticket_classification_enabled: settings.ticket_classification_enabled,
        reminder_generation_enabled: settings.reminder_generation_enabled,
        ticket_summarization_enabled: settings.ticket_summarization_enabled,
      })
      setSettings(response.settings)
      setAiConfigured(response.ai_configured)
      setSuccess('Settings saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      <div className="mx-auto max-w-5xl p-6 lg:p-8">

        {/* Header */}
        <header className="mb-8">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#4E79FF] font-['DM_Sans']">Owner Portal</p>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="h-7 w-7 text-[#FED609]" />
            <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">AI Features</h2>
          </div>
          <p className="text-[#8D8D96] font-['Manrope']">All AI-powered features — what's active on your account and what's available to unlock.</p>
        </header>

        {/* Plan status bar */}
        {!loading && billing && (
          <div className={`mb-8 flex items-center justify-between rounded-xl border px-5 py-4 ${
            hasPlus ? 'border-[#EBCF42]/30 bg-[#1a1500]' :
            hasStandard ? 'border-[#4E79FF]/30 bg-[#0c1230]' :
            'border-[#272839] bg-[#101114]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasPlus ? 'bg-[#EBCF42]/15' : hasStandard ? 'bg-[#4E79FF]/15' : 'bg-white/8'}`}>
                {hasPlus ? <Crown className="h-5 w-5 text-[#EBCF42]" /> : hasStandard ? <Sparkles className="h-5 w-5 text-[#4E79FF]" /> : <Lock className="h-5 w-5 text-[#8D8D96]" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white font-['DM_Sans']">
                  {billing.status === 'active'
                    ? `${billing.planDisplayName} Plan — ${hasPlus ? '7 of 7 AI features unlocked' : hasStandard ? '5 of 7 AI features unlocked' : '1 of 7 AI features unlocked'}`
                    : `Free Trial — ${billing.isTrialExpired ? 'Expired' : `${billing.daysLeftInTrial ?? 0} days left`} — 1 of 7 AI features unlocked`}
                </p>
                <p className="text-xs text-[#8D8D96]">
                  {hasPlus ? 'Full AI suite active' : hasStandard ? 'Upgrade to Plus for advanced AI features' : 'Upgrade to Standard to unlock AI features'}
                </p>
              </div>
            </div>
            {!hasPlus && (
              <Link
                to={ROUTES.ownerBilling}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#2251E3] px-4 py-2 text-xs font-bold text-white hover:bg-[#4E79FF] transition-colors"
              >
                <Crown className="h-3.5 w-3.5" />
                Upgrade Plan
              </Link>
            )}
          </div>
        )}

        {/* Warnings */}
        {!loading && !aiConfigured && hasStandard && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>OpenAI is not configured on the server. AI features are unavailable until the backend is set up.</span>
          </div>
        )}
        {error && <div className="mb-6"><ErrorState message={error} /></div>}
        {loading && <LoadingState message="Loading AI features..." rows={4} />}

        {!loading && settings && (
          <>
            {/* Master toggle */}
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-[rgba(254,214,9,0.25)] bg-[rgba(254,214,9,0.05)] px-5 py-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-[#FED609]" />
                <div>
                  <p className="text-sm font-bold text-white font-['DM_Sans']">AI Automation Master Switch</p>
                  <p className="text-xs text-[#8D8D96]">Globally enable or disable all AI automation workflows</p>
                </div>
              </div>
              <GoldToggle
                checked={settings.automation_enabled}
                onToggle={() => toggleField('automation_enabled')}
                disabled={!hasStandard || !aiConfigured}
              />
            </div>

            {/* Feature grid */}
            <div className="mb-8 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">All AI Features</p>

              <div className="grid gap-4 md:grid-cols-2">

                {/* 1. Auto-flag urgent tickets */}
                <AiFeatureCard
                  icon={<AlertTriangle className="h-5 w-5" />}
                  iconColor="#F25461"
                  title="Auto-Flag Urgent Tickets"
                  description="Tickets matching urgent keywords (leak, flood, fire, emergency) or high-confidence maintenance AI categories are automatically flagged with a red URGENT badge and sorted to the top."
                  tier="all"
                  locked={false}
                  active={true}
                  linkTo={ROUTES.ownerTickets}
                  linkLabel="Open Tickets"
                />

                {/* 2. Ticket Classification */}
                <AiFeatureCard
                  icon={<Sparkles className="h-5 w-5" />}
                  iconColor="#FED609"
                  title="Ticket Classification"
                  description="Automatically categorise incoming support tickets by type and priority using AI. Results feed the urgent-flag system and future analytics."
                  tier="standard"
                  locked={!hasStandard}
                  active={settings.ticket_classification_enabled}
                  toggle={hasStandard ? { checked: settings.ticket_classification_enabled, onToggle: () => toggleField('ticket_classification_enabled') } : undefined}
                  linkTo={ROUTES.ownerTickets}
                  linkLabel="Open Tickets"
                />

                {/* 3. Smart Payment Reminders */}
                <AiFeatureCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  iconColor="#4E79FF"
                  title="Smart Payment Reminders"
                  description="AI drafts friendly, personalised payment reminder messages sent automatically to tenants via their connected WhatsApp or Telegram channel."
                  tier="standard"
                  locked={!hasStandard}
                  active={settings.reminder_generation_enabled}
                  toggle={hasStandard ? { checked: settings.reminder_generation_enabled, onToggle: () => toggleField('reminder_generation_enabled') } : undefined}
                  linkTo={ROUTES.ownerNotifications}
                  linkLabel="Notifications"
                />

                {/* 4. Broadcast Message Generator */}
                <AiFeatureCard
                  icon={<Bell className="h-5 w-5" />}
                  iconColor="#25D366"
                  title="Broadcast Message Generator"
                  description="Write a topic (e.g. 'water outage on 3rd floor tomorrow 9am') and AI generates a polished broadcast message you can send via WhatsApp, Telegram, or Email."
                  tier="standard"
                  locked={!hasStandard}
                  active={hasStandard}
                  linkTo={ROUTES.ownerNotifications}
                  linkLabel="Compose Broadcast"
                />

                {/* 5. WhatsApp / Telegram Composer */}
                <AiFeatureCard
                  icon={<MessageCircle className="h-5 w-5" />}
                  iconColor="#25D366"
                  title="WhatsApp & Telegram Composer"
                  description="Select any tenant, describe your intent, and AI drafts a personalised message. Opens WhatsApp or Telegram on your device with the tenant's number and message pre-filled — you send it directly from your own phone."
                  tier="standard"
                  locked={!hasStandard}
                  active={hasStandard}
                  linkTo={ROUTES.ownerTenants}
                  linkLabel="Open Tenants"
                />

                {/* 6. AI Reply Draft */}
                <AiFeatureCard
                  icon={<TicketCheck className="h-5 w-5" />}
                  iconColor="#EBCF42"
                  title="AI Reply Draft in Tickets"
                  description="Click '✦ Draft with AI' inside any ticket reply modal. AI reads the full conversation thread and drafts a contextual reply you can edit before sending."
                  tier="plus"
                  locked={!hasPlus}
                  active={hasPlus}
                  toggle={hasPlus ? { checked: settings.ticket_summarization_enabled, onToggle: () => toggleField('ticket_summarization_enabled') } : undefined}
                  linkTo={ROUTES.ownerTickets}
                  linkLabel="Open Tickets"
                />

                {/* 7. Lease Renewal Risk Digest */}
                <AiFeatureCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  iconColor="#F97316"
                  title="Lease Renewal Risk Digest"
                  description="Generates an AI summary of tenants with leases expiring within 60 days and overdue payments. Highlights renewal risks and recommends next actions. Available on Dashboard."
                  tier="plus"
                  locked={!hasPlus}
                  active={hasPlus}
                  linkTo={ROUTES.ownerDashboard}
                  linkLabel="Open Dashboard"
                />

              </div>
            </div>

            {/* Integration status */}
            <div className="mb-8 rounded-2xl border border-[#272839] bg-[#101114] p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#8D8D96] font-['DM_Sans']">Connected Channels</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-[#272839] bg-white/[0.025] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">WhatsApp</p>
                    <p className="text-xs text-[#8D8D96] truncate">
                      Manage in{' '}
                      <Link to={ROUTES.ownerIntegrations} className="text-[#25D366] hover:underline">Integrations</Link>
                    </p>
                  </div>
                  {hasStandard
                    ? <CheckCircle className="h-4 w-4 text-[#32C382] shrink-0 ml-auto" />
                    : <Lock className="h-4 w-4 text-[#8D8D96] shrink-0 ml-auto" />}
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#272839] bg-white/[0.025] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0088CC]/15">
                    <Send className="h-4 w-4 text-[#0088CC]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">Telegram</p>
                    <p className="text-xs text-[#8D8D96] truncate">
                      Manage in{' '}
                      <Link to={ROUTES.ownerIntegrations} className="text-[#0088CC] hover:underline">Integrations</Link>
                    </p>
                  </div>
                  {hasStandard
                    ? <CheckCircle className="h-4 w-4 text-[#32C382] shrink-0 ml-auto" />
                    : <Lock className="h-4 w-4 text-[#8D8D96] shrink-0 ml-auto" />}
                </div>
              </div>
            </div>

            {/* Success */}
            {success && (
              <div className="mb-6 rounded-xl border border-[#32C382]/30 bg-[#32C382]/10 px-4 py-3 text-sm text-[#32C382]">
                {success}
              </div>
            )}

            {/* Save footer */}
            <footer className="flex justify-end gap-3 border-t border-[#272839] pt-6">
              <button
                type="button"
                onClick={() => void loadSettings()}
                className="px-5 py-2.5 text-sm font-bold text-[#8D8D96] hover:text-white transition-colors font-['DM_Sans']"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={saving || !hasStandard}
                className="flex items-center gap-2 rounded-xl bg-[#FED609] px-8 py-2.5 text-sm font-bold text-[#1A1A1A] hover:bg-[#FFD70B] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans']"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
