import { AlertTriangle, Save, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormToggle } from '../../components/common/FormToggle'
import { LoadingState } from '../../components/common/LoadingState'
import {
  dashboardDangerPanelClassName,
  dashboardFormPanelClassName,
  dashboardInfoPanelClassName,
  dashboardSuccessPanelClassName,
} from '../../components/common/formTheme'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerAiSettings } from '../../types/api'

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
      setSuccess('AI settings saved. Supported AI-assisted workflows can use your selected model when automation is enabled.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className={dashboardFormPanelClassName}>
        <h2 className="ph-title inline-flex items-center gap-2 text-2xl font-semibold text-[var(--ph-text)]">
          <Sparkles className="h-6 w-6 text-[var(--ph-accent)]" />
          AI Settings
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ph-text-muted)]">
          Configure the model and master toggle used by supported AI-assisted workflows and future releases.
        </p>
      </div>

      {!loading && !aiConfigured ? (
        <div className={dashboardDangerPanelClassName}>
          <p className="inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>OpenAI is not configured yet. AI features cannot be enabled.</span>
          </p>
        </div>
      ) : null}

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading AI settings..." rows={4} /> : null}

      {!loading && settings ? (
        <article className={`${dashboardFormPanelClassName} space-y-4`}>
          <FormToggle
            label="Enable AI Automation"
            description="Master switch for future AI-powered workflows."
            checked={settings.automation_enabled}
            onToggle={() => toggleField('automation_enabled')}
            disabled={!aiConfigured}
          />
          <FormToggle
            label="Ticket Classification"
            description="Future: classify ticket intent and category automatically."
            checked={settings.ticket_classification_enabled}
            onToggle={() => toggleField('ticket_classification_enabled')}
            disabled={!aiConfigured}
          />
          <FormToggle
            label="Reminder Generation"
            description="Future: generate optimized reminder messages."
            checked={settings.reminder_generation_enabled}
            onToggle={() => toggleField('reminder_generation_enabled')}
            disabled={!aiConfigured}
          />
          <FormToggle
            label="Ticket Summarization"
            description="Future: summarize long ticket threads for owners."
            checked={settings.ticket_summarization_enabled}
            onToggle={() => toggleField('ticket_summarization_enabled')}
            disabled={!aiConfigured}
          />

          <FormInput
            label="AI Model"
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
            hint="Used as the preferred model for supported AI-assisted workflows in your organization."
          />

          <div className={dashboardInfoPanelClassName}>
            AI remains assistive here: owners still review outputs, and workflows keep their existing human approval
            steps.
          </div>

          {success ? <div className={dashboardSuccessPanelClassName}>{success}</div> : null}

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
