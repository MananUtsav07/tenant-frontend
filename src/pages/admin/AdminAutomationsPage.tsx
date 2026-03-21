import { AlertTriangle, Clock3, Layers3, RefreshCw, Search, Workflow, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { AutomationFailurePanel } from '../../components/automation/AutomationFailurePanel'
import { AutomationRunTimeline } from '../../components/automation/AutomationRunTimeline'
import { AutomationStatusBadge } from '../../components/automation/AutomationStatusBadge'
import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { SummaryCard } from '../../components/common/SummaryCard'
import { dashboardFormPanelClassName, dashboardInfoPanelClassName } from '../../components/common/formTheme'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type {
  AdminAutomationHealth,
  AdminCashFlowOverview,
  AdminConditionReportOverview,
  AdminOrganizationRow,
  AdminPortfolioVisibilityOverview,
  AdminScreeningOverview,
  AdminVacancyOverview,
  AutomationError,
  AutomationJob,
  AutomationRun,
  ComplianceOverview,
} from '../../types/api'
import { formatCurrency, formatDateTime } from '../../utils/date'

type AutomationFilters = {
  organization_id: string
  flow_name: string
  status: '' | AutomationRun['status']
}

function getHealthBadgeStatus(health: AdminAutomationHealth | null) {
  if (!health) {
    return 'idle' as const
  }

  if (health.failed_jobs > 0 || health.errors_last_24h > 0) {
    return 'attention' as const
  }

  if (health.processing_jobs > 0 || health.pending_jobs > 0) {
    return 'running' as const
  }

  return 'healthy' as const
}

function getJobStatus(job: AutomationJob) {
  if (job.lifecycle_status === 'succeeded') {
    return 'succeeded' as const
  }
  if (job.lifecycle_status === 'failed') {
    return 'failed' as const
  }
  if (job.lifecycle_status === 'running') {
    return 'running' as const
  }
  if (job.lifecycle_status === 'queued') {
    return 'queued' as const
  }
  if (job.lifecycle_status === 'skipped') {
    return 'skipped' as const
  }
  return 'cancelled' as const
}

export function AdminAutomationsPage() {
  const { token } = useAdminAuth()
  const [filters, setFilters] = useState<AutomationFilters>({
    organization_id: '',
    flow_name: '',
    status: '',
  })
  const [health, setHealth] = useState<AdminAutomationHealth | null>(null)
  const [jobs, setJobs] = useState<AutomationJob[]>([])
  const [runs, setRuns] = useState<AutomationRun[]>([])
  const [errors, setErrors] = useState<AutomationError[]>([])
  const [compliance, setCompliance] = useState<ComplianceOverview | null>(null)
  const [cashFlow, setCashFlow] = useState<AdminCashFlowOverview | null>(null)
  const [portfolioVisibility, setPortfolioVisibility] = useState<AdminPortfolioVisibilityOverview | null>(null)
  const [vacancy, setVacancy] = useState<AdminVacancyOverview | null>(null)
  const [screening, setScreening] = useState<AdminScreeningOverview | null>(null)
  const [conditionReports, setConditionReports] = useState<AdminConditionReportOverview | null>(null)
  const [organizations, setOrganizations] = useState<AdminOrganizationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPage = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const query = {
        organization_id: filters.organization_id || undefined,
      }

      const [healthResponse, organizationResponse, jobsResponse, runsResponse, errorsResponse, complianceResponse, cashFlowResponse, portfolioResponse, vacancyResponse, screeningResponse, conditionResponse] =
        await Promise.all([
          api.getAdminAutomationHealth(token),
          api.getAdminOrganizations(token, { page: 1, page_size: 100, search: '' }),
          api.getAdminAutomationJobs(token, {
            page: 1,
            page_size: 12,
            organization_id: filters.organization_id || undefined,
            job_type: filters.flow_name || undefined,
          }),
          api.getAdminAutomationRuns(token, {
            page: 1,
            page_size: 18,
            organization_id: filters.organization_id || undefined,
            flow_name: filters.flow_name || undefined,
            status: filters.status || undefined,
          }),
          api.getAdminAutomationErrors(token, {
            page: 1,
            page_size: 10,
            organization_id: filters.organization_id || undefined,
            flow_name: filters.flow_name || undefined,
          }),
          api.getAdminAutomationCompliance(token, query),
          api.getAdminAutomationCashFlow(token, query),
          api.getAdminAutomationPortfolioVisibility(token, query),
          api.getAdminAutomationVacancyCampaigns(token, query),
          api.getAdminAutomationScreening(token, {
            organization_id: filters.organization_id || undefined,
            page: 1,
            page_size: 8,
          }),
          api.getAdminAutomationConditionReports(token, {
            organization_id: filters.organization_id || undefined,
            page: 1,
            page_size: 8,
          }),
        ])

      setHealth(healthResponse.health)
      setOrganizations(organizationResponse.items)
      setJobs(jobsResponse.items)
      setRuns(runsResponse.items)
      setErrors(errorsResponse.items)
      setCompliance(complianceResponse.compliance)
      setCashFlow(cashFlowResponse.cash_flow)
      setPortfolioVisibility(portfolioResponse.portfolio_visibility)
      setVacancy(vacancyResponse.vacancy)
      setScreening(screeningResponse.screening)
      setConditionReports(conditionResponse.condition_reports)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load automation observability')
    } finally {
      setLoading(false)
    }
  }, [filters.flow_name, filters.organization_id, filters.status, token])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  const healthTone = getHealthBadgeStatus(health)
  const filteredOrganizationLabel = useMemo(() => {
    if (!filters.organization_id) {
      return 'All organizations'
    }

    return (
      organizations.find((organization) => organization.id === filters.organization_id)?.name ?? filters.organization_id
    )
  }, [filters.organization_id, organizations])

  return (
    <section className="space-y-6">
      <div className="ph-surface-card-strong rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Automation Observatory</p>
            <h2 className="ph-title mt-3 text-3xl font-semibold text-[var(--ph-text)]">Automation health and inspectability</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Monitor queue health, job distribution, recent failures, and cross-organization automation output from one
              dedicated admin surface.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AutomationStatusBadge status={healthTone} label={health ? healthTone.replaceAll('_', ' ') : 'Loading'} />
            <Button type="button" variant="secondary" iconLeft={<RefreshCw className="h-4 w-4" />} onClick={() => void loadPage()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <article className={`${dashboardFormPanelClassName} space-y-4`}>
        <div>
          <h3 className="text-xl font-semibold text-[var(--ph-text)]">Run history filters</h3>
          <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
            Narrow automation runs and related observability by organization, flow, and status.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_0.9fr_auto]">
          <FormSelect
            label="Organization"
            value={filters.organization_id}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                organization_id: event.target.value,
              }))
            }
          >
            <option value="">All organizations</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </FormSelect>

          <FormInput
            label="Flow search"
            value={filters.flow_name}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                flow_name: event.target.value,
              }))
            }
            placeholder="compliance_scan, cash_flow_refresh..."
            leadingIcon={<Search className="h-4 w-4" />}
          />

          <FormSelect
            label="Run status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as AutomationFilters['status'],
              }))
            }
          >
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="partial">Partial</option>
            <option value="skipped">Skipped</option>
            <option value="cancelled">Cancelled</option>
          </FormSelect>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFilters({
                  organization_id: '',
                  flow_name: '',
                  status: '',
                })
              }
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className={dashboardInfoPanelClassName}>
          Inspecting <span className="font-semibold text-[var(--ph-text)]">{filteredOrganizationLabel}</span>
          {filters.flow_name ? ` with flow filter "${filters.flow_name}"` : ''}.
        </div>
      </article>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading automation observability..." rows={6} /> : null}

      {!loading && health ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Pending Jobs" value={health.pending_jobs} icon={<Layers3 className="h-4 w-4" />} />
            <SummaryCard label="Processing Jobs" value={health.processing_jobs} icon={<Clock3 className="h-4 w-4" />} />
            <SummaryCard label="Failed Jobs" value={health.failed_jobs} icon={<AlertTriangle className="h-4 w-4" />} />
            <SummaryCard label="Runs (24h)" value={health.runs_last_24h} icon={<Workflow className="h-4 w-4" />} />
            <SummaryCard label="Errors (24h)" value={health.errors_last_24h} icon={<Zap className="h-4 w-4" />} />
          </div>

          <article className={`${dashboardFormPanelClassName} space-y-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Queue by flow</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Current queued workload grouped by registered automation job type.
                </p>
              </div>
              {health.last_run ? (
                <div className="rounded-full border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--ph-text-muted)]">
                  Last run: {health.last_run.flow_name}
                </div>
              ) : null}
            </div>

            {health.queued_by_flow.length === 0 ? (
              <EmptyState title="No queued flow data" description="Flow-level queue details will appear after scheduled or event-driven jobs are created." />
            ) : (
              <DataTable headers={['Flow', 'Cadence', 'Phase', 'Pending', 'Processing', 'Failed']}>
                {health.queued_by_flow.map((item) => (
                  <tr key={item.job_type}>
                    <td className="px-4 py-3 text-[var(--ph-text)]">
                      <div className="font-medium">{item.label}</div>
                      <div className="mt-1 text-xs text-[var(--ph-text-muted)]">{item.job_type}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.cadence}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.phase}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.pending}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.processing}</td>
                    <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.failed}</td>
                  </tr>
                ))}
              </DataTable>
            )}
          </article>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Searchable run history</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Filtered run history across the current admin scope.
                </p>
              </div>
              <AutomationRunTimeline
                runs={runs}
                emptyTitle="No matching runs"
                emptyDescription="Adjust filters or wait for the next scheduler cycle to create run history."
              />
            </article>

            <AutomationFailurePanel
              failures={errors}
              title="Recent automation errors"
              description="Captured failures from the dispatcher, delivery layer, and downstream handlers."
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Recent jobs</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Queue entries before and during execution, including event-sourced jobs.
                </p>
              </div>

              {jobs.length === 0 ? (
                <EmptyState title="No matching jobs" description="Queue entries will appear here when schedulers or events enqueue work." />
              ) : (
                <DataTable headers={['Job', 'Status', 'Trigger', 'Next Run', 'Attempts']}>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-4 py-3 text-[var(--ph-text)]">
                        <div className="font-medium">{job.job_type}</div>
                        <div className="mt-1 text-xs text-[var(--ph-text-muted)]">{job.handler_key}</div>
                      </td>
                      <td className="px-4 py-3">
                        <AutomationStatusBadge status={getJobStatus(job)} label={job.lifecycle_status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{job.trigger_type}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{formatDateTime(job.next_run_at)}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">
                        {job.retry_count}/{job.max_attempts}
                      </td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </article>

            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Flow output summary</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Cross-flow snapshot of the outputs currently landing from the automation layer.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Compliance items</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--ph-text)]">{compliance?.upcoming_items.length ?? 0}</p>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{compliance?.sent_reminders.length ?? 0} reminders sent recently</p>
                </div>
                <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Cash-flow snapshots</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--ph-text)]">{cashFlow?.recent_snapshots.length ?? 0}</p>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">Latest report history across owner portfolios</p>
                </div>
                <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Vacancy campaigns</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--ph-text)]">{vacancy?.campaigns.length ?? 0}</p>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">Re-letting workflows currently tracked</p>
                </div>
                <div className="rounded-lg border border-[rgba(83,88,100,0.38)] bg-white/[0.03] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Condition reports</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--ph-text)]">{conditionReports?.summary.total_reports ?? 0}</p>
                  <p className="mt-1 text-xs text-[var(--ph-text-muted)]">{conditionReports?.summary.pending_confirmations_count ?? 0} pending confirmations</p>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Compliance radar</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Legal milestones currently inside the reminder horizon.
                </p>
              </div>
              {compliance?.upcoming_items.length ? (
                <DataTable headers={['Property', 'Trigger', 'Days Remaining', 'Action']}>
                  {compliance.upcoming_items.slice(0, 8).map((item) => (
                    <tr key={`${item.legal_date_id}-${item.trigger_date_type}`}>
                      <td className="px-4 py-3 text-[var(--ph-text)]">
                        {item.property_name}
                        {item.unit_number ? ` (${item.unit_number})` : ''}
                      </td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.trigger_label}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.days_remaining}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{item.next_action}</td>
                    </tr>
                  ))}
                </DataTable>
              ) : (
                <EmptyState title="No compliance items" description="The compliance window is clear for the current admin filter." />
              )}
            </article>

            <article className={`${dashboardFormPanelClassName} space-y-4`}>
              <div>
                <h3 className="text-xl font-semibold text-[var(--ph-text)]">Portfolio and finance highlights</h3>
                <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                  Latest digest and cash-flow output across the filtered scope.
                </p>
              </div>
              {portfolioVisibility?.recent_snapshots.length || cashFlow?.recent_snapshots.length ? (
                <div className="space-y-3">
                  {portfolioVisibility?.recent_snapshots.slice(0, 3).map((snapshot) => (
                    <div key={snapshot.id} className="rounded-lg border border-[rgba(83,88,100,0.36)] bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--ph-text)]">{snapshot.snapshot_label}</p>
                      <p className="mt-1 text-sm text-[var(--ph-text-soft)]">
                        {snapshot.overdue_rent_count} overdue rent items, {snapshot.open_ticket_count} open tickets, {snapshot.upcoming_compliance_count} compliance milestones.
                      </p>
                      <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{formatDateTime(snapshot.created_at)}</p>
                    </div>
                  ))}

                  {cashFlow?.recent_snapshots.slice(0, 3).map((snapshot) => (
                    <div key={snapshot.id} className="rounded-lg border border-[rgba(83,88,100,0.36)] bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--ph-text)]">{snapshot.report_label}</p>
                      <p className="mt-1 text-sm text-[var(--ph-text-soft)]">
                        Net income {formatCurrency(snapshot.portfolio_net_income, snapshot.currency_code)}
                        {typeof snapshot.portfolio_yield_percent === 'number' ? ` - Yield ${snapshot.portfolio_yield_percent}%` : ''}
                      </p>
                      <p className="mt-2 text-xs text-[var(--ph-text-muted)]">{formatDateTime(snapshot.created_at)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No portfolio output yet" description="Digest and reporting output will appear here after the next scheduler cycle." />
              )}
            </article>
          </div>

          <div className={dashboardInfoPanelClassName}>
            Screening records: <span className="font-semibold text-[var(--ph-text)]">{screening?.applicants.length ?? 0}</span>.
            Vacancy campaigns: <span className="font-semibold text-[var(--ph-text)]">{vacancy?.campaigns.length ?? 0}</span>.
            Condition reports: <span className="font-semibold text-[var(--ph-text)]">{conditionReports?.summary.total_reports ?? 0}</span>.
            This screen stays read-heavy by design so admins can diagnose automation state without mutating owner workflows from the wrong surface.
          </div>
        </>
      ) : null}
    </section>
  )
}
