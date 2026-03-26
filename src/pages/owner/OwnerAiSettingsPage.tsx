import {
  AlertTriangle,
  BrainCircuit,
  CalendarDays,
  FileText,
  Info,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerAiSettings } from '../../types/api'

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
    <div className="group rounded-xl border border-gray-50 bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-[#FEFAEF] p-3 transition-colors group-hover:bg-[#FFFAE2]">
          {icon}
        </div>
        <GoldToggle checked={checked} onToggle={onToggle} disabled={disabled} />
      </div>
      <h5 className="mb-2 font-['Sora'] text-base font-bold text-[#1A1A1A]">{title}</h5>
      <p className="text-sm leading-relaxed text-[#6B7280]">{description}</p>
    </div>
  )
}

// ─── Analytics progress row ───────────────────────────────────────────────────

function AnalyticsRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-sm font-medium text-[#6B7280]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.getOwnerAiSettings(token)
      setSettings(response.settings)
      setAiConfigured(response.ai_configured)
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
        ai_model: settings.ai_model,
      })
      setSettings(response.settings)
      setAiConfigured(response.ai_configured)
      setSuccess(
        'AI settings saved. Supported AI-assisted workflows can use your selected model when automation is enabled.',
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  const isDisabled = !aiConfigured

  return (
    <div className="min-h-screen bg-[#FEFAEF]">
      {/* ── Page Header ── */}
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-8 w-8 fill-[#FED609] text-[#FED609]" />
            <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              AI Settings
            </h2>
          </div>
          <p className="font-medium text-[#6B7280]">Configure your AI automation preferences.</p>
        </div>
      </header>

      {/* ── Not-configured warning ── */}
      {!loading && !aiConfigured && (
        <div className="mb-8 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
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
              className="flex items-center justify-between rounded-xl bg-white p-8 shadow-sm"
              style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #FED609, #FFD70B) border-box',
                border: '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-6">
                <div className="rounded-full bg-[#FEFAEF] p-4">
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
                  <p className="max-w-xl text-[#6B7280]">
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
              <h4
                className="mb-4 text-sm font-bold uppercase tracking-widest text-[#6B7280]"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
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
                <div className="group rounded-xl border border-gray-50 bg-white p-6 shadow-sm transition-all hover:border-[#FED609]/30">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex gap-2">
                      <div className="rounded-lg bg-[#FEFAEF] p-3 transition-colors group-hover:bg-[#FFFAE2]">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSfqVrH6l4Ww3Y8Q9eI2OQkKDVxlmMmlbF6Z6WI5vV7pYcbdD86hMfQDuOffu0q-RFmKvi7DALwdIqkPDD0pvqbVia7WFoVTVJ0CPBfmscnyLinwHE_hLiGLqbSdMERkrgMPOYnx-4EZa88PK05091FUk7UUkVX_cHtcrHyW5oFh8BFdxAduZRJ7OwXS7YH-L-Oqbwx9xTFSmTJFH4jsVbJowHiw1_-3Nujuiw6-5UluzhRl73-lgLyXHlJTzUHtLdYrIxmaCk62V3"
                          alt="WhatsApp"
                          className="h-6 w-6"
                        />
                      </div>
                      <div className="rounded-lg bg-[#FEFAEF] p-3 transition-colors group-hover:bg-[#FFFAE2]">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6sgbuABhKx-XrOzdgH7-4My24BEaVyrlotpl3_JqYoMQNl4v3ifvaCX107G4O_3b_yOM8yM-_LLHII8z3CBSGCPstCX-lEcqFsWjyLtEBEIAdP_SQhP6dHUom1TlV0k21RCs9uruTcUGOdFgpAQnjgmRuCynWPv6J2hp_ELNx3NXlvk6oc42Dmy9daMzcc9la6Yv73Wv6f2Xfr8FBx3FVKqkwq6eErSbJ8Js5t-xifQBhfjXnsgQmpVbyvnHy-CyMhi8jSg6uGwSb"
                          alt="Telegram"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                    <GoldToggle
                      checked={settings.reminder_generation_enabled}
                      onToggle={() => toggleField('reminder_generation_enabled')}
                      disabled={isDisabled}
                    />
                  </div>
                  <h5 className="mb-2 font-['Sora'] text-base font-bold text-[#1A1A1A]">Smart Reminders</h5>
                  <p className="text-sm leading-relaxed text-[#6B7280]">
                    AI generates friendly payment reminders and sends them automatically via WhatsApp
                    or Telegram bots.
                  </p>
                </div>

                {/* Ticket Summarization */}
                <FeatureCard
                  icon={<FileText className="h-6 w-6 text-[#FED609]" />}
                  title="Ticket Summarization"
                  description="Get AI-generated summaries of lengthy ticket threads for a quick overview of tenant issues and history."
                  checked={settings.ticket_summarization_enabled}
                  onToggle={() => toggleField('ticket_summarization_enabled')}
                  disabled={isDisabled}
                />

                {/* Reminder Generation */}
                <FeatureCard
                  icon={<CalendarDays className="h-6 w-6 text-[#FED609]" />}
                  title="Reminder Generation"
                  description="Automatically create and schedule periodic rent reminders for tenants based on lease agreements."
                  checked={settings.reminder_generation_enabled}
                  onToggle={() => toggleField('reminder_generation_enabled')}
                  disabled={isDisabled}
                />
              </div>

              {/* ── AI Model Selection ── */}
              <div className="mt-8 rounded-xl border border-gray-50 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#FED609]" />
                  <h5 className="font-['Sora'] text-lg font-bold text-[#1A1A1A]">AI Model Selection</h5>
                </div>
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <label
                      className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#6B7280]"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Select Primary Engine
                    </label>
                    <select
                      value={settings.ai_model}
                      onChange={(e) =>
                        setSettings((current) =>
                          current ? { ...current, ai_model: e.target.value } : current,
                        )
                      }
                      disabled={isDisabled}
                      className="w-full rounded-lg border border-gray-200 bg-[#FEFAEF] px-4 py-3 font-medium text-[#1A1A1A] transition-all focus:border-[#FED609] focus:outline-none focus:ring-2 focus:ring-[#FED609]/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="prophives-lumina-v4.2">Prophives-Lumina v4.2 (Default)</option>
                      <option value="prophives-fasttrack-v2.0">Prophives-FastTrack v2.0</option>
                      <option value="gpt-4o">GPT-4o Optimized Integration</option>
                      <option value={settings.ai_model}>{settings.ai_model}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-[#FFFAE2] px-6 py-4 md:w-1/3">
                    <Zap className="h-8 w-8 shrink-0 text-[#FED609]" />
                    <div>
                      <p className="text-xs font-bold uppercase text-[#FFD70B]">Performance</p>
                      <p className="text-sm font-medium leading-tight text-[#1A1A1A]">
                        Current model processes tickets 3x faster
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preparation mode notice */}
                <div className="mt-6 rounded-xl border border-[#FED609]/30 bg-[#FFFAE2] px-4 py-3 text-xs text-[#92700A]">
                  Preparation mode: toggles and model selection are stored for rollout readiness, but
                  live workflows remain unchanged.
                </div>
              </div>
            </div>

            {/* Right column — analytics */}
            <div className="space-y-6">
              <div className="sticky top-8 rounded-xl bg-[#FFFAE2] p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <h4 className="font-['Sora'] text-lg font-bold text-[#1A1A1A]">AI Analytics</h4>
                  <span className="rounded-full border border-[#FED609]/20 bg-white px-3 py-1 text-xs font-bold text-[#6B7280]">
                    This Month
                  </span>
                </div>

                <div className="space-y-8">
                  <AnalyticsRow label="Tickets Classified" value="1,248" pct={85} />
                  <AnalyticsRow label="Reminders Generated" value="432" pct={62} />
                  <AnalyticsRow label="Summaries Created" value="89" pct={45} />
                </div>

                {/* Efficiency boost note */}
                <div className="mt-12 rounded-xl border border-white bg-white/60 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Info className="h-5 w-5 text-[#FED609]" />
                    <p className="text-sm font-bold text-[#1A1A1A]">Efficiency Boost</p>
                  </div>
                  <p className="text-xs leading-relaxed text-[#6B7280]">
                    Your team saved approximately{' '}
                    <span className="font-bold text-[#1A1A1A]">42 hours</span> this month using
                    automated ticket classification.
                  </p>
                </div>

                {/* Chart image */}
                <div className="mt-8">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4NG2ErfHomXH1cHPzQXHm8DPwgzOCgbAuTH2ZyMWTrRbimudxnvyX0SovAIzUmFFZrdC5oYddtyNMRDIjoB0fbUeRe0GzMuHS-Kb8cLvrHrgIlGADwRKxH7aSZy19205MoHa2b8gE6YcoBUVT_ZKzlZq26o6RCnKfiUr8c5zDFc9YdoiOAhvvCA_QcT5QqfmIftGIFlRp7v0wzs_58_9O8tP8ENOuZssp0XDC209CoW1GJmsPQF160wPE3-7hu1lJH1Dgc9XPJhPr"
                    alt="AI usage trend chart"
                    className="rounded-lg opacity-80 shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Success message ── */}
          {success && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
              {success}
            </div>
          )}

          {/* ── Footer actions ── */}
          <footer className="mt-12 flex justify-end gap-4 border-t border-gray-200 pt-8">
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="px-6 py-3 font-bold text-[#6B7280] transition-colors hover:text-[#1A1A1A]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#FED609] px-10 py-3 font-['Sora'] font-bold text-[#1A1A1A] shadow-md transition-all hover:bg-[#FFD70B] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </footer>
        </>
      )}
    </div>
  )
}
