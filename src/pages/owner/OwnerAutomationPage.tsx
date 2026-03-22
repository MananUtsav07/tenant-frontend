import {
  Activity,
  BellRing,
  CalendarClock,
  Coins,
  Mail,
  MessageSquareMore,
  RefreshCw,
  Save,
  ShieldCheck,
  TrendingUp,
  Workflow,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AutomationRunTimeline } from '../../components/automation/AutomationRunTimeline'
import { AutomationSectionTabs } from '../../components/automation/AutomationSectionTabs'
import { AutomationSettingsCard } from '../../components/automation/AutomationSettingsCard'
import { AutomationStatusBadge } from '../../components/automation/AutomationStatusBadge'
import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormToggle } from '../../components/common/FormToggle'
import { LoadingState } from '../../components/common/LoadingState'
import { SummaryCard } from '../../components/common/SummaryCard'
import {
  dashboardInfoPanelClassName,
  dashboardSuccessPanelClassName,
} from '../../components/common/formTheme'
import { useOwnerAutomationWorkspace } from '../../hooks/useOwnerAutomationWorkspace'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { CashFlowSnapshot, OwnerAutomationSettings } from '../../types/api'
import { formatCurrency, formatDateTime } from '../../utils/date'

function getExpectedNextCycle(settings: OwnerAutomationSettings | null) {
  if (!settings) {
    return 'Loading scheduler state'
  }

  if (settings.compliance_alerts_enabled || settings.rent_chasing_enabled || settings.daily_digest_enabled) {
    return 'Daily automation sweep active'
  }

  if (settings.weekly_digest_enabled) {
    return 'Weekly operations digest active'
  }

  if (settings.monthly_digest_enabled || settings.cash_flow_reporting_enabled) {
    return 'Month-end reporting cycle active'
  }

  return 'No scheduled automations enabled'
}

function getHealthStatus(settings: OwnerAutomationSettings | null, failureCount: number) {
  if (!settings) {
    return { status: 'idle' as const, label: 'Loading' }
  }

  const enabledCount = [
    settings.compliance_alerts_enabled,
    settings.rent_chasing_enabled,
    settings.portfolio_visibility_enabled,
    settings.cash_flow_reporting_enabled,
    settings.daily_digest_enabled,
    settings.weekly_digest_enabled,
    settings.monthly_digest_enabled,
  ].filter(Boolean).length

  if (enabledCount === 0) {
    return { status: 'idle' as const, label: 'Paused' }
  }

  if (failureCount > 0) {
    return { status: 'attention' as const, label: 'Needs attention' }
  }

  return { status: 'healthy' as const, label: 'Healthy' }
}

export function OwnerAutomationPage() {
  const { token } = useOwnerAuth()
  const { settings, activity, compliance, cashFlow, portfolioVisibility, loading, error, refresh, setSettings } =
    useOwnerAutomationWorkspace()
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const orderedRuns = useMemo(
    () =>
      [...activity].sort(
        (left, right) => new Date(right.started_at).getTime() - new Date(left.started_at).getTime(),
      ),
    [activity],
  )

  const lastRun = orderedRuns[0] ?? null
  const failureCount = compliance?.failures.length ?? 0
  const health = getHealthStatus(settings, failureCount)
  const currentPortfolio = cashFlow?.current_report.portfolio ?? null
  const currentCurrencyCode = currentPortfolio?.currency_code ?? cashFlow?.latest_monthly_snapshot?.currency_code ?? 'INR'
  const latestSnapshots = (cashFlow?.recent_snapshots ?? []).slice(0, 4)
  const currentProperties = (cashFlow?.current_report.properties ?? []).slice(0, 5)

  const toggleField = (
    field: keyof Pick<
      OwnerAutomationSettings,
      | 'compliance_alerts_enabled'
      | 'rent_chasing_enabled'
      | 'portfolio_visibility_enabled'
      | 'cash_flow_reporting_enabled'
      | 'daily_digest_enabled'
      | 'weekly_digest_enabled'
      | 'monthly_digest_enabled'
      | 'status_command_enabled'
    >,
  ) => {
    setSettings((current) => (current ? { ...current, [field]: !current[field] } : current))
  }

  const saveSettings = async () => {
    if (!token || !settings) {
      return
    }

    try {
      setSaving(true)
      setActionError(null)
      setSuccess(null)
      const response = await api.updateOwnerAutomationSettings(token, {
        compliance_alerts_enabled: settings.compliance_alerts_enabled,
        rent_chasing_enabled: settings.rent_chasing_enabled,
        portfolio_visibility_enabled: settings.portfolio_visibility_enabled,
        cash_flow_reporting_enabled: settings.cash_flow_reporting_enabled,
        daily_digest_enabled: settings.daily_digest_enabled,
        weekly_digest_enabled: settings.weekly_digest_enabled,
        monthly_digest_enabled: settings.monthly_digest_enabled,
        status_command_enabled: settings.status_command_enabled,
        yield_alert_threshold_percent: settings.yield_alert_threshold_percent,
        yield_alert_cooldown_days: settings.yield_alert_cooldown_days,
        quiet_hours_start: settings.quiet_hours_start,
        quiet_hours_end: settings.quiet_hours_end,
      })
      setSettings(response.settings)
      setSuccess('Automation settings updated.')
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : 'Failed to save automation settings')
    } finally {
      setSaving(false)
    }
  }

  const generateCashFlowSnapshot = async () => {
    if (!token) {
      return
    }

    try {
      setGenerating(true)
      setActionError(null)
      setSuccess(null)
      await api.generateOwnerAutomationCashFlow(token, { scope: 'current' })
      await refresh()
      setSuccess('Cash-flow snapshot refreshed.')
    } catch (generateError) {
      setActionError(generateError instanceof Error ? generateError.message : 'Failed to generate cash-flow snapshot')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Automation Center</p>
            <h2 className="ph-title mt-3 text-3xl font-semibold text-(--ph-text)">Automation visibility and control</h2>
            <p className="mt-2 text-sm leading-relaxed text-(--ph-text-muted)">
              Configure the automations already live for your organization, review scheduler posture, and keep owner-facing
              alerts disciplined without leaving the Prophives dashboard shell.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AutomationStatusBadge status={health.status} label={health.label} />
            <Button
              type="button"
              variant="secondary"
              iconLeft={<RefreshCw className="h-4 w-4" />}
              onClick={() => void refresh()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <AutomationSectionTabs
        tabs={[
          {
            to: ROUTES.ownerAutomation,
            label: 'Controls',
            description: 'Toggles, thresholds, channel readiness, and scheduler posture.',
          },
          {
            to: ROUTES.ownerAutomationActivity,
            label: 'Activity',
            description: 'Alerts sent, reports generated, failures, and run history.',
          },
        ]}
      />

      {error || actionError ? <ErrorState message={actionError ?? error ?? 'Unknown automation error'} /> : null}
      {loading ? <LoadingState message="Loading automation controls..." rows={6} /> : null}

      {!loading && settings ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Health"
              value={health.label}
              icon={<ShieldCheck className="h-4 w-4" />}
              hint={lastRun ? `Last run ${formatDateTime(lastRun.completed_at ?? lastRun.started_at)}` : 'No runs yet'}
            />
            <SummaryCard
              label="Expected Next Cycle"
              value={getExpectedNextCycle(settings)}
              icon={<CalendarClock className="h-4 w-4" />}
              hint="Derived from the enabled daily, weekly, and monthly schedulers."
            />
            <SummaryCard
              label="Compliance Horizon"
              value={compliance?.upcoming_items.length ?? 0}
              icon={<BellRing className="h-4 w-4" />}
              hint="Items inside the active reminder window."
            />
            <SummaryCard
              label="Recent Failures"
              value={failureCount}
              icon={<Activity className="h-4 w-4" />}
              hint={failureCount > 0 ? 'Review failures before expanding coverage.' : 'No recent compliance failures.'}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <AutomationSettingsCard
              eyebrow="Controls"
              title="Owner automation settings"
              description="These settings are stored against your organization-scoped automation profile and used by the internal scheduler, message renderer, and reporting flows."
              icon={<Workflow className="h-5 w-5" />}
              footer={
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    iconLeft={<Save className="h-4 w-4" />}
                    onClick={() => void saveSettings()}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save automation settings'}
                  </Button>
                  {success ? <span className={dashboardSuccessPanelClassName}>{success}</span> : null}
                </div>
              }
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <FormToggle
                  label="Compliance alerts"
                  description="Daily scanning for Ejari, contract, and RERA milestones."
                  checked={settings.compliance_alerts_enabled}
                  onToggle={() => toggleField('compliance_alerts_enabled')}
                />
                <FormToggle
                  label="Rent chasing"
                  description="Ledger refresh and rent-related follow-up automation."
                  checked={settings.rent_chasing_enabled}
                  onToggle={() => toggleField('rent_chasing_enabled')}
                />
                <FormToggle
                  label="Portfolio visibility"
                  description="Daily, weekly, and monthly owner summaries when material changes exist."
                  checked={settings.portfolio_visibility_enabled}
                  onToggle={() => toggleField('portfolio_visibility_enabled')}
                />
                <FormToggle
                  label="Cash-flow reporting"
                  description="Snapshot generation for current, monthly, and annual reporting."
                  checked={settings.cash_flow_reporting_enabled}
                  onToggle={() => toggleField('cash_flow_reporting_enabled')}
                />
                <FormToggle
                  label="Daily digest"
                  description="Morning summary when there is something actionable to report."
                  checked={settings.daily_digest_enabled}
                  onToggle={() => toggleField('daily_digest_enabled')}
                />
                <FormToggle
                  label="Weekly digest"
                  description="Operational portfolio wrap-up for rent, tickets, and renewals."
                  checked={settings.weekly_digest_enabled}
                  onToggle={() => toggleField('weekly_digest_enabled')}
                />
                <FormToggle
                  label="Monthly digest"
                  description="Higher-level owner summary that pairs well with cash-flow reporting."
                  checked={settings.monthly_digest_enabled}
                  onToggle={() => toggleField('monthly_digest_enabled')}
                />
                <FormToggle
                  label="Status command"
                  description="Reserved for future conversational channels such as WhatsApp."
                  checked={settings.status_command_enabled}
                  onToggle={() => toggleField('status_command_enabled')}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormInput
                  label="Quiet hours start"
                  type="time"
                  value={settings.quiet_hours_start ?? ''}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, quiet_hours_start: event.target.value || null } : current,
                    )
                  }
                  hint="Stored for delivery-window aware providers."
                />
                <FormInput
                  label="Quiet hours end"
                  type="time"
                  value={settings.quiet_hours_end ?? ''}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, quiet_hours_end: event.target.value || null } : current,
                    )
                  }
                  hint="Currently advisory until timezone-aware delivery lands."
                />
                <FormInput
                  label="Yield alert threshold (%)"
                  type="number"
                  value={settings.yield_alert_threshold_percent ?? ''}
                  min={0}
                  max={100}
                  step="0.01"
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            yield_alert_threshold_percent: event.target.value === '' ? null : Number(event.target.value),
                          }
                        : current,
                    )
                  }
                  hint="Used by monthly and annual cash-flow reporting."
                />
                <FormInput
                  label="Yield alert cooldown (days)"
                  type="number"
                  value={String(settings.yield_alert_cooldown_days)}
                  min={1}
                  max={90}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, yield_alert_cooldown_days: Number(event.target.value || 7) } : current,
                    )
                  }
                  hint="Prevents repeated low-yield alerts."
                />
              </div>

              <div className={dashboardInfoPanelClassName}>
                The current owner API supports automation categories, digest cadence, quiet hours, and yield thresholds.
                Delivery-channel preferences are still provider-led on the backend, so channel readiness is shown separately
                instead of being faked in this UI.
              </div>
            </AutomationSettingsCard>

            <div className="space-y-6">
              <AutomationSettingsCard
                eyebrow="Delivery"
                title="Channel readiness"
                description="This shows which automation delivery surfaces are already operational and which ones are prepared for the next integration step."
                icon={<Mail className="h-5 w-5" />}
              >
                <div className="space-y-3">
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-(--ph-text)">Email delivery</p>
                        <p className="mt-1 text-xs text-(--ph-text-muted)">Active for compliance, reporting, and owner-facing automation notifications.</p>
                      </div>
                      <AutomationStatusBadge status="healthy" label="Live" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-(--ph-text)">Dashboard notifications</p>
                        <p className="mt-1 text-xs text-(--ph-text-muted)">Used as the in-product source of truth for owner alerts and operational events.</p>
                      </div>
                      <AutomationStatusBadge status="healthy" label="Live" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-(--ph-text)">WhatsApp abstraction</p>
                        <p className="mt-1 text-xs text-(--ph-text-muted)">Provider-neutral transport is ready, but live template/session delivery still depends on provider setup.</p>
                      </div>
                      <AutomationStatusBadge
                        status={settings.status_command_enabled ? 'queued' : 'idle'}
                        label={settings.status_command_enabled ? 'Integration-ready' : 'Standby'}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-(--ph-text)">Internal command surfaces</p>
                        <p className="mt-1 text-xs text-(--ph-text-muted)">Future status, trigger, and assisted-action commands for conversational workflows.</p>
                      </div>
                      <AutomationStatusBadge status="queued" label="Planned" />
                    </div>
                  </div>
                </div>
              </AutomationSettingsCard>

              <AutomationSettingsCard
                eyebrow="Scheduler"
                title="Operational posture"
                description="The owner screen does not receive raw queue internals, so this summary is derived from your last successful runs, upcoming compliance horizon, and enabled scheduler cadence."
                icon={<CalendarClock className="h-5 w-5" />}
                footer={
                  <Button to={ROUTES.ownerAutomationActivity} variant="outline">
                    Open automation activity
                  </Button>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ph-text-muted)">Last run</p>
                    <p className="mt-2 text-sm font-semibold text-(--ph-text)">
                      {lastRun ? formatDateTime(lastRun.completed_at ?? lastRun.started_at) : 'No runs recorded'}
                    </p>
                    <p className="mt-1 text-xs text-(--ph-text-muted)">
                      {lastRun ? `${lastRun.flow_name.replaceAll('_', ' ')} processed ${lastRun.processed_count}` : 'The scheduler has not logged an org-scoped run yet.'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/3 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--ph-text-muted)">Next cadence</p>
                    <p className="mt-2 text-sm font-semibold text-(--ph-text)">{getExpectedNextCycle(settings)}</p>
                    <p className="mt-1 text-xs text-(--ph-text-muted)">
                      {settings.daily_digest_enabled || settings.compliance_alerts_enabled || settings.rent_chasing_enabled
                        ? 'Expect the next daily pass inside the next 24 hours.'
                        : 'Enable a scheduled category to rejoin the scheduler cycle.'}
                    </p>
                  </div>
                </div>
              </AutomationSettingsCard>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <AutomationSettingsCard
              eyebrow="Reporting"
              title="Cash flow and net yield"
              description="Current portfolio income, cost drag, and yield visibility powered by the native automation reporting service."
              icon={<Coins className="h-5 w-5" />}
              footer={
                <Button
                  type="button"
                  variant="secondary"
                  iconLeft={<RefreshCw className="h-4 w-4" />}
                  onClick={() => void generateCashFlowSnapshot()}
                  disabled={generating}
                >
                  {generating ? 'Refreshing...' : 'Refresh snapshot'}
                </Button>
              }
            >
              {cashFlow && currentPortfolio ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      label="Gross rent received"
                      value={formatCurrency(currentPortfolio.gross_rent_received, currentCurrencyCode)}
                      icon={<Coins className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Maintenance costs"
                      value={formatCurrency(currentPortfolio.maintenance_costs, currentCurrencyCode)}
                      icon={<BellRing className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Net income"
                      value={formatCurrency(currentPortfolio.net_income, currentCurrencyCode)}
                      icon={<ShieldCheck className="h-4 w-4" />}
                    />
                    <SummaryCard
                      label="Yield"
                      value={typeof currentPortfolio.yield_percent === 'number' ? `${currentPortfolio.yield_percent}%` : 'N/A'}
                      icon={<TrendingUp className="h-4 w-4" />}
                    />
                  </div>

                  {currentProperties.length ? (
                    <DataTable headers={['Property', 'Gross Rent', 'Costs', 'Net Income', 'Yield']}>
                      {currentProperties.map((property) => (
                        <tr key={property.property_id}>
                          <td className="px-4 py-3 text-(--ph-text)">
                            <div className="font-medium">{property.property_name}</div>
                            <div className="mt-1 text-xs text-(--ph-text-muted)">
                              {property.unit_number ? `Unit ${property.unit_number}` : 'Unit not provided'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-(--ph-text-soft)">
                            {formatCurrency(property.gross_rent_received, currentCurrencyCode)}
                          </td>
                          <td className="px-4 py-3 text-(--ph-text-soft)">
                            {formatCurrency(property.maintenance_costs + property.fixed_charges, currentCurrencyCode)}
                          </td>
                          <td className="px-4 py-3 text-(--ph-text-soft)">{formatCurrency(property.net_income, currentCurrencyCode)}</td>
                          <td className="px-4 py-3 text-[var(--ph-text-soft)">
                            {typeof property.yield_percent === 'number' ? `${property.yield_percent}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </DataTable>
                  ) : (
                    <EmptyState
                      title="No cash-flow lines yet"
                      description="Property-level metrics will appear once rent ledger and maintenance cost data begin landing."
                    />
                  )}
                </>
              ) : (
                <EmptyState
                  title="Cash-flow reporting is ready"
                  description="Generate a current snapshot once rent ledger or maintenance entries exist for your organization."
                />
              )}
            </AutomationSettingsCard>

            <AutomationSettingsCard
              eyebrow="Reporting history"
              title="Recent report snapshots"
              description="The latest persisted cash-flow snapshots, ready for dashboard use and later channel delivery."
              icon={<Coins className="h-5 w-5" />}
            >
              {latestSnapshots.length ? (
                <DataTable headers={['Report', 'Scope', 'Trigger', 'Net Income', 'Generated']}>
                  {latestSnapshots.map((snapshot: CashFlowSnapshot) => (
                    <tr key={snapshot.id}>
                      <td className="px-4 py-3 text-(--ph-text)">{snapshot.report_label}</td>
                      <td className="px-4 py-3 text-(--ph-text-soft)">{snapshot.report_scope}</td>
                      <td className="px-4 py-3 text-(--ph-text-soft)">{snapshot.trigger_type}</td>
                      <td className="px-4 py-3 text-(--ph-text-soft)">
                        {formatCurrency(snapshot.portfolio_net_income, snapshot.currency_code)}
                      </td>
                      <td className="px-4 py-3 text-(--ph-text-soft)">{formatDateTime(snapshot.created_at)}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState
                  title="No report snapshots yet"
                  description="Snapshots will appear here after manual refreshes, monthly runs, or event-driven recalculations."
                />
              )}
            </AutomationSettingsCard>
          </div>

          <AutomationSettingsCard
            eyebrow="Compliance"
            title="Upcoming legal milestones"
            description="RERA, Ejari, and contract deadlines currently inside the active reminder window, with the next owner action already prepared."
            icon={<MessageSquareMore className="h-5 w-5" />}
          >
            {compliance?.upcoming_items.length ? (
              <DataTable headers={['Property', 'Trigger', 'Date', 'Next Window', 'Next Action']}>
                {compliance.upcoming_items.slice(0, 8).map((item) => (
                  <tr key={`${item.legal_date_id}-${item.trigger_date_type}`}>
                    <td className="px-4 py-3 text-(--ph-text)">
                      <div className="font-medium">{item.property_name}</div>
                      <div className="mt-1 text-xs text-(--ph-text-muted)">
                        {item.unit_number ? `Unit ${item.unit_number}` : 'Unit not provided'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-(--ph-text-soft)">{item.trigger_label}</td>
                    <td className="px-4 py-3 text-(--ph-text-soft)">
                      <div>{item.relevant_date_label}</div>
                      <div className="mt-1 text-xs text-(--ph-text-muted)">{item.days_remaining} days remaining</div>
                    </td>
                    <td className="px-4 py-3 text-(--ph-text-soft)">
                      {item.next_threshold ? `${item.next_threshold} days` : 'Window complete'}
                    </td>
                    <td className="px-4 py-3 text-(--ph-text-soft)">{item.next_action}</td>
                  </tr>
                ))}
              </DataTable>
            ) : (
              <EmptyState
                title="No compliance items in the active window"
                description="Items will appear here once a legal date enters the 120-day reminder horizon."
              />
            )}
          </AutomationSettingsCard>

          <AutomationSettingsCard
            eyebrow="Run history"
            title="Recent automation timeline"
            description="Organization-scoped execution history from the internal scheduler and dispatcher."
            icon={<Workflow className="h-5 w-5" />}
            footer={
              <Button to={ROUTES.ownerAutomationActivity} variant="outline">
                View full activity
              </Button>
            }
          >
            <AutomationRunTimeline runs={orderedRuns.slice(0, 6)} />
          </AutomationSettingsCard>

          {portfolioVisibility?.recent_alerts.length ? (
            <div className={dashboardInfoPanelClassName}>
              {portfolioVisibility.recent_alerts.length} recent owner notification{portfolioVisibility.recent_alerts.length === 1 ? '' : 's'} were generated from portfolio visibility and related automation flows. Open the activity view for full delivery history.
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
