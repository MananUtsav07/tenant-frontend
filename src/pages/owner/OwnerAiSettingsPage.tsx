import {
  AlertTriangle,
  BrainCircuit,
  CalendarDays,
  Crown,
  FileText,
  Info,
  Lock,
  Save,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import { ROUTES } from '../../routes/constants'
import type { BillingState, OwnerAiSettings } from '../../types/api'

// ─── Gold toggle switch ───────────────────────────────────────────────────────

type GoldToggleProps = {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'lg'
}

function GoldToggle({ checked, onToggle, disabled = false, size = 'sm' }: GoldToggleProps) {
  const track = size === 'lg' ? 'w-14 h-8' : 'w-11 h-6'
  const thumb = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  const thumbOn = size === 'lg' ? 'translate-x-7' : 'translate-x-[22px]'
  const thumbOff = size === 'lg' ? 'translate-x-1' : 'translate-x-[2px]'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FED609]/60 focus-visible:ring-offset-2 ${track} ${
        checked ? 'bg-[#FED609]' : 'bg-gray-200'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow transition-transform duration-200 ${thumb} ${
          checked ? thumbOn : thumbOff
        }`}
      />
    </button>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
}

function FeatureCard({ icon, title, description, checked, onToggle, disabled }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/30 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-[#FEFAEF] p-3 transition-colors group-hover:bg-[#FFFAE2]">
          {icon}
        </div>
        <GoldToggle checked={checked} onToggle={onToggle} disabled={disabled} />
      </div>
      <h5 className="mb-2 font-['Sora'] text-base font-bold text-[#1A1A1A]">{title}</h5>
      <p className="text-sm leading-relaxed text-[#6B7280] font-[Manrope,sans-serif]">{description}</p>
    </div>
  )
}

// ─── Analytics progress row ───────────────────────────────────────────────────

function AnalyticsRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-sm font-medium text-[#6B7280] font-[DM_Sans,sans-serif]">
          {label}
        </span>
        <span className="text-sm font-bold text-[#1A1A1A]">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white">
        <div className="h-2 rounded-full bg-[#FED609]" style={{ width: `${pct}%` }} />
      </div>
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

  const isProfessional = billing?.status === 'active' && (billing.planCode === 'standard' || billing.planCode === 'plus' || billing.planCode === 'beyond')

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

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const toggleField = (
    field: keyof Pick<
      OwnerAiSettings,
      | 'automation_enabled'
      | 'ticket_classification_enabled'
      | 'reminder_generation_enabled'
      | 'ticket_summarization_enabled'
    >,
  ) => {
    setSettings((current) => {
      if (!current) return current
      if (!aiConfigured && !current[field]) return current
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
      setSuccess('AI settings saved. Changes take effect immediately for all enabled workflows.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  const isDisabled = !aiConfigured || !isProfessional

  return (
    <div className="min-h-screen bg-[#FEFAEF]">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">

        {/* ── Page Header ── */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#92700A] font-[DM_Sans,sans-serif] mb-1">
              Owner Portal
            </p>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-7 w-7 fill-[#FED609] text-[#FED609]" />
              <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
                AI Settings
              </h2>
            </div>
            <p className="font-medium text-[#6B7280] font-[Manrope,sans-serif]">Configure your AI automation preferences.</p>
          </div>
        </header>

        {/* ── Standard plan gate ── */}
        {!loading && !isProfessional && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-[#2251E3]/30 bg-[rgba(34,81,227,0.06)] p-5 shadow-sm">
            <div className="shrink-0 rounded-xl bg-[#2251E3]/10 p-2.5">
              <Lock className="h-5 w-5 text-[#2251E3]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-[#4E79FF]" />
                <h4 className="font-['Sora'] font-bold text-[#1A1A1A] text-sm">Standard Plan Required</h4>
              </div>
              <p className="text-sm text-[#6B7280] font-[Manrope,sans-serif]">
                AI automation features are available on the Standard plan and above. Upgrade to enable ticket classification, smart reminders, and AI-powered summaries.
              </p>
            </div>
            <Link
              to={ROUTES.ownerBilling}
              className="shrink-0 flex items-center gap-1.5 bg-[#2251E3] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#4E79FF] transition-colors"
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          </div>
        )}

        {/* ── Not-configured warning ── */}
        {!loading && !aiConfigured && isProfessional && (
          <div className="mb-8 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>OpenAI is not configured yet. AI features cannot be enabled.</span>
          </div>
        )}

        {/* ── Error / Loading ── */}
        {error && (
          <div className="mb-8">
            <ErrorState message={error} />
          </div>
        )}
        {loading && (
          <div className="mb-8">
            <LoadingState message="Loading AI settings..." rows={4} />
          </div>
        )}

        {!loading && settings && (
          <>
            {/* ── AI Overview Card ── */}
            <section className="mb-8">
              <div
                className="flex items-center justify-between rounded-2xl bg-white p-8 shadow-sm"
                style={{
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #FED609, #FFD70B) border-box',
                  border: '2px solid transparent',
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="rounded-2xl bg-[#FEFAEF] p-4">
                    <BrainCircuit className="h-10 w-10 text-[#FED609]" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="font-['Sora'] text-xl font-bold text-[#1A1A1A]">AI Automation</h3>
                      {settings.automation_enabled ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="max-w-xl text-[#6B7280] font-[Manrope,sans-serif]">
                      Enable AI-powered features to automate your property management workflow, reducing
                      manual tasks and increasing efficiency.
                    </p>
                  </div>
                </div>
                <GoldToggle
                  checked={settings.automation_enabled}
                  onToggle={() => toggleField('automation_enabled')}
                  disabled={isDisabled}
                  size="lg"
                />
              </div>
            </section>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left column — feature toggles + model selection */}
              <div className="space-y-6 lg:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#6B7280] font-[DM_Sans,sans-serif]">
                  Automation Features
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Ticket Classification */}
                  <FeatureCard
                    icon={<Sparkles className="h-6 w-6 text-[#FED609]" />}
                    title="Ticket Classification"
                    description="Automatically classify incoming support tickets by priority and category using natural language processing."
                    checked={settings.ticket_classification_enabled}
                    onToggle={() => toggleField('ticket_classification_enabled')}
                    disabled={isDisabled}
                  />

                  {/* Smart Reminders */}
                  <FeatureCard
                    icon={<CalendarDays className="h-6 w-6 text-[#FED609]" />}
                    title="Smart Reminders"
                    description="AI generates friendly payment reminders sent automatically to tenants via their connected messaging channels."
                    checked={settings.reminder_generation_enabled}
                    onToggle={() => toggleField('reminder_generation_enabled')}
                    disabled={isDisabled}
                  />

                  {/* Ticket Summarization */}
                  <FeatureCard
                    icon={<FileText className="h-6 w-6 text-[#FED609]" />}
                    title="Ticket Summarization"
                    description="Get AI-generated summaries of lengthy ticket threads for a quick overview of tenant issues and history."
                    checked={settings.ticket_summarization_enabled}
                    onToggle={() => toggleField('ticket_summarization_enabled')}
                    disabled={isDisabled}
                  />

                </div>

              </div>

              {/* Right column — analytics */}
              <div className="space-y-6">
                <div className="sticky top-8 rounded-2xl bg-[#FFFAE2] p-8 shadow-sm">
                  <div className="mb-8 flex items-center justify-between">
                    <h4 className="font-['Sora'] text-lg font-bold text-[#1A1A1A]">AI Analytics</h4>
                    <span className="rounded-full border border-[#FED609]/20 bg-white px-3 py-1 text-xs font-bold text-[#6B7280] font-[DM_Sans,sans-serif]">
                      This Month
                    </span>
                  </div>

                  <div className="space-y-8">
                    <AnalyticsRow label="Tickets Classified" value="1,248" pct={85} />
                    <AnalyticsRow label="Reminders Generated" value="432" pct={62} />
                    <AnalyticsRow label="Summaries Created" value="89" pct={45} />
                  </div>

                  {/* Efficiency boost note */}
                  <div className="mt-10 rounded-2xl border border-white bg-white/60 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Info className="h-5 w-5 text-[#FED609]" />
                      <p className="text-sm font-bold text-[#1A1A1A] font-[Sora,sans-serif]">Efficiency Boost</p>
                    </div>
                    <p className="text-xs leading-relaxed text-[#6B7280] font-[Manrope,sans-serif]">
                      Your team saved approximately{' '}
                      <span className="font-bold text-[#1A1A1A]">42 hours</span> this month using
                      automated ticket classification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Success message ── */}
            {success && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                {success}
              </div>
            )}

            {/* ── Footer actions ── */}
            <footer className="mt-10 flex justify-end gap-4 border-t border-[rgba(0,0,0,0.06)] pt-8">
              <button
                type="button"
                onClick={() => void loadSettings()}
                className="px-6 py-3 font-bold text-[#6B7280] transition-colors hover:text-[#1A1A1A] font-[DM_Sans,sans-serif]"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#FED609] px-10 py-3 font-['Sora'] font-bold text-[#1A1A1A] shadow-md transition-all hover:bg-[#FFD70B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
