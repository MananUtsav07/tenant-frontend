import { AlertTriangle, Save, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerAiSettings } from '../../types/api'

type ToggleFieldProps = {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
}

function ToggleField({ label, description, checked, onToggle, disabled = false }: ToggleFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
          checked
            ? 'border-blue-500 bg-blue-600'
            : 'border-slate-300 bg-slate-200'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export function OwnerAiSettingsPage() {
  const { token } = useOwnerAuth()
  const [settings, setSettings] = useState<OwnerAiSettings | null>(null)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!token) {
      return
    }

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

  const toggleField = (field: keyof Pick<
    OwnerAiSettings,
    | 'automation_enabled'
    | 'ticket_classification_enabled'
    | 'reminder_generation_enabled'
    | 'ticket_summarization_enabled'
  >) => {
    setSettings((current) => {
      if (!current) {
        return current
      }

      if (!aiConfigured && !current[field]) {
        return current
      }

      return {
        ...current,
        [field]: !current[field],
      }
    })
  }

  const saveSettings = async () => {
    if (!token || !settings) {
      return
    }

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
      setSuccess('AI settings saved. Automation remains in preparation mode.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Sparkles className="h-6 w-6 text-blue-500" />
          AI Settings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Infrastructure is ready for future AI workflows. No AI automation is active in live operations yet.
        </p>
      </div>

      {!loading && !aiConfigured ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p className="inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>OpenAI is not configured yet. AI features cannot be enabled.</span>
          </p>
        </div>
      ) : null}

      {error ? <ErrorState message={error} variant="light" /> : null}
      {loading ? <LoadingState message="Loading AI settings..." tone="light" rows={4} /> : null}

      {!loading && settings ? (
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ToggleField
            label="Enable AI Automation"
            description="Master switch for future AI-powered workflows."
            checked={settings.automation_enabled}
            onToggle={() => toggleField('automation_enabled')}
            disabled={!aiConfigured}
          />
          <ToggleField
            label="Ticket Classification"
            description="Future: classify ticket intent and category automatically."
            checked={settings.ticket_classification_enabled}
            onToggle={() => toggleField('ticket_classification_enabled')}
            disabled={!aiConfigured}
          />
          <ToggleField
            label="Reminder Generation"
            description="Future: generate optimized reminder messages."
            checked={settings.reminder_generation_enabled}
            onToggle={() => toggleField('reminder_generation_enabled')}
            disabled={!aiConfigured}
          />
          <ToggleField
            label="Ticket Summarization"
            description="Future: summarize long ticket threads for owners."
            checked={settings.ticket_summarization_enabled}
            onToggle={() => toggleField('ticket_summarization_enabled')}
            disabled={!aiConfigured}
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">AI Model</span>
            <input
              value={settings.ai_model}
              onChange={(event) =>
                setSettings((current) =>
                  current
                    ? {
                        ...current,
                        ai_model: event.target.value,
                      }
                    : current,
                )
              }
              disabled={!aiConfigured}
              className="tf-field disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Preparation mode: toggles and model selection are stored for rollout readiness, but live workflows remain unchanged.
          </div>

          {success ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            iconLeft={<Save className="h-4 w-4" />}
            onClick={() => void saveSettings()}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save AI Settings'}
          </Button>
        </article>
      ) : null}
    </section>
  )
}



