import { AlertTriangle, BellRing, FileText, RefreshCw, Workflow } from 'lucide-react'
import { useMemo } from 'react'

import { AutomationActivityList } from '../../components/automation/AutomationActivityList'
import { AutomationFailurePanel } from '../../components/automation/AutomationFailurePanel'
import { AutomationRunTimeline } from '../../components/automation/AutomationRunTimeline'
import { AutomationSectionTabs } from '../../components/automation/AutomationSectionTabs'
import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { SummaryCard } from '../../components/common/SummaryCard'
import { dashboardInfoPanelClassName } from '../../components/common/formTheme'
import { useOwnerAutomationWorkspace } from '../../hooks/useOwnerAutomationWorkspace'
import { ROUTES } from '../../routes/constants'
import type { AutomationError } from '../../types/api'
import { formatCurrency, formatDateTime } from '../../utils/date'

function mergeOwnerFailures({
  automationErrors,
  failedRuns,
}: {
  automationErrors: AutomationError[]
  failedRuns: Array<{
    id: string
    flow_name: string
    started_at: string
  }>
}) {
  const syntheticRunFailures = failedRuns
    .filter((run) => !automationErrors.some((error) => error.run_id === run.id))
    .map<AutomationError>((run) => ({
      id: `run-${run.id}`,
      run_id: run.id,
      job_id: null,
      organization_id: null,
      owner_id: null,
      flow_name: run.flow_name,
      error_message: 'Run finished in failed state. Inspect backend logs or automation_errors for handler details.',
      context: {},
      created_at: run.started_at,
    }))

  return [...automationErrors, ...syntheticRunFailures].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  )
}

function formatComplianceReminderLabel(triggerDateType: string) {
  return triggerDateType.replaceAll('_', ' ')
}

export function OwnerAutomationActivityPage() {
  const { activity, compliance, cashFlow, portfolioVisibility, loading, error, refresh } = useOwnerAutomationWorkspace()

  const orderedRuns = useMemo(
    () =>
      [...activity].sort(
        (left, right) => new Date(right.started_at).getTime() - new Date(left.started_at).getTime(),
      ),
    [activity],
  )

  const alerts = useMemo(() => {
    const complianceAlerts =
      compliance?.sent_reminders.map((event) => ({
        id: event.id,
        title: `${event.threshold_days}-day ${formatComplianceReminderLabel(event.trigger_date_type)}`,
        summary: event.next_action ?? event.message_preview ?? 'Compliance reminder delivered to the owner.',
        sortAt: event.sent_at,
        timestamp: formatDateTime(event.sent_at),
        status: event.notification_type === 'compliance_alert_urgent' ? ('attention' as const) : ('success' as const),
        statusLabel: event.notification_type === 'compliance_alert_urgent' ? 'Urgent' : 'Sent',
        meta: `${event.properties?.property_name ?? 'Property'}${event.properties?.unit_number ? ` - Unit ${event.properties.unit_number}` : ''}`,
      })) ?? []

    const notificationAlerts =
      portfolioVisibility?.recent_alerts.map((alert) => ({
        id: alert.id,
        title: alert.title,
        summary: alert.message,
        sortAt: alert.created_at,
        timestamp: formatDateTime(alert.created_at),
        status: alert.is_read ? ('success' as const) : ('queued' as const),
        statusLabel: alert.is_read ? 'Read' : 'Unread',
        meta: alert.notification_type.replaceAll('_', ' '),
      })) ?? []

    return [...complianceAlerts, ...notificationAlerts]
      .sort((left, right) => new Date(right.sortAt).getTime() - new Date(left.sortAt).getTime())
      .slice(0, 12)
      .map(({ sortAt, ...item }) => {
        void sortAt
        return item
      })
  }, [compliance?.sent_reminders, portfolioVisibility?.recent_alerts])

  const reports = useMemo(() => {
    const cashFlowReports =
      cashFlow?.recent_snapshots.map((snapshot) => ({
        id: snapshot.id,
        title: snapshot.report_label,
        summary: `${formatCurrency(snapshot.portfolio_net_income, snapshot.currency_code)} net income across ${snapshot.property_count} properties.`,
        sortAt: snapshot.created_at,
        timestamp: formatDateTime(snapshot.created_at),
        status: 'success' as const,
        statusLabel: snapshot.trigger_type,
        meta: `${snapshot.report_scope} snapshot`,
      })) ?? []

    const visibilityReports =
      portfolioVisibility?.recent_snapshots.map((snapshot) => ({
        id: snapshot.id,
        title: snapshot.snapshot_label,
        summary: `${snapshot.overdue_rent_count} overdue rent items, ${snapshot.open_ticket_count} open tickets, ${snapshot.upcoming_compliance_count} compliance milestones.`,
        sortAt: snapshot.created_at,
        timestamp: formatDateTime(snapshot.created_at),
        status: 'success' as const,
        statusLabel: snapshot.snapshot_scope,
        meta: `${snapshot.snapshot_scope} digest`,
      })) ?? []

    return [...cashFlowReports, ...visibilityReports]
      .sort((left, right) => new Date(right.sortAt).getTime() - new Date(left.sortAt).getTime())
      .slice(0, 12)
      .map(({ sortAt, ...item }) => {
        void sortAt
        return item
      })
  }, [cashFlow?.recent_snapshots, portfolioVisibility?.recent_snapshots])

  const failures = useMemo(
    () =>
      mergeOwnerFailures({
        automationErrors: compliance?.failures ?? [],
        failedRuns: orderedRuns.filter((run) => run.status === 'failed'),
      }).slice(0, 10),
    [compliance?.failures, orderedRuns],
  )

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Automation Activity</p>
            <h2 className="ph-title mt-3 text-3xl font-semibold text-[var(--ph-text)]">Owner automation history</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Review the owner-facing output of the internal automation engine: alerts sent, reports generated, failures,
              and the scheduler run timeline for your organization.
            </p>
          </div>
          <Button type="button" variant="secondary" iconLeft={<RefreshCw className="h-4 w-4" />} onClick={() => void refresh()}>
            Refresh activity
          </Button>
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

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading automation activity..." rows={6} /> : null}

      {!loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Alerts Sent" value={alerts.length} icon={<BellRing className="h-4 w-4" />} />
            <SummaryCard label="Reports Generated" value={reports.length} icon={<FileText className="h-4 w-4" />} />
            <SummaryCard label="Failures" value={failures.length} icon={<AlertTriangle className="h-4 w-4" />} />
            <SummaryCard label="Tracked Runs" value={orderedRuns.length} icon={<Workflow className="h-4 w-4" />} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AutomationActivityList
              title="Recent alerts sent"
              description="Owner-facing alerts that have recently been generated from compliance and portfolio visibility flows."
              items={alerts}
              emptyTitle="No alerts sent yet"
              emptyDescription="Alerts will appear here once compliance reminders, overdue rent notices, or digest notifications are generated."
            />

            <AutomationActivityList
              title="Recent reports generated"
              description="The latest persisted reporting and digest outputs available to your organization."
              items={reports}
              emptyTitle="No reports generated yet"
              emptyDescription="Cash-flow snapshots and portfolio summaries will appear here after the scheduler or a manual refresh runs."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="ph-form-panel rounded-xl p-5 sm:p-6">
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Run history</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Scheduler executions recorded for your owner and organization scope.
                </p>
              </div>
              <div className="mt-5">
                <AutomationRunTimeline
                  runs={orderedRuns}
                  emptyTitle="No automation runs yet"
                  emptyDescription="Once the internal scheduler dispatches org-scoped jobs, the full timeline will appear here."
                />
              </div>
            </article>

            <AutomationFailurePanel
              failures={failures}
              title="Recent failures"
              description="Compliance delivery failures and failed runs that need owner-side awareness."
            />
          </div>

          <div className={dashboardInfoPanelClassName}>
            This activity screen only shows organization-scoped output that the owner can safely inspect. Queue internals,
            cross-organization comparisons, and deeper flow health remain in the admin automation observatory.
          </div>
        </>
      ) : null}
    </section>
  )
}
