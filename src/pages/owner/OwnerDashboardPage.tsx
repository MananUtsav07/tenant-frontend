import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCheck, Clock3, LifeBuoy, TriangleAlert, Users } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { OwnerPortfolioVisibilityOverview, OwnerRentPaymentApproval, OwnerSummary, OwnerVacancyOverview } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'

export function OwnerDashboardPage() {
  const { token, owner } = useOwnerAuth()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [portfolioOverview, setPortfolioOverview] = useState<OwnerPortfolioVisibilityOverview | null>(null)
  const [vacancyOverview, setVacancyOverview] = useState<OwnerVacancyOverview | null>(null)
  const [approvals, setApprovals] = useState<OwnerRentPaymentApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [reviewingApprovalId, setReviewingApprovalId] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({})

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const summaryResponse = await api.getOwnerSummary(token)
      setSummary(summaryResponse.summary)

      try {
        const portfolioResponse = await api.getOwnerAutomationPortfolioVisibility(token)
        setPortfolioOverview(portfolioResponse.portfolio_visibility)
      } catch (portfolioError) {
        if (portfolioError instanceof Error && portfolioError.message.toLowerCase().includes('route not found')) {
          setPortfolioOverview(null)
        } else {
          throw portfolioError
        }
      }

      try {
        const vacancyResponse = await api.getOwnerAutomationVacancy(token)
        setVacancyOverview(vacancyResponse.vacancy)
      } catch (vacancyError) {
        if (vacancyError instanceof Error && vacancyError.message.toLowerCase().includes('route not found')) {
          setVacancyOverview(null)
        } else {
          throw vacancyError
        }
      }

      try {
        const approvalsResponse = await api.getOwnerRentPaymentApprovals(token)
        setApprovals(approvalsResponse.approvals)
      } catch (approvalsError) {
        if (approvalsError instanceof Error && approvalsError.message.toLowerCase().includes('route not found')) {
          setApprovals([])
          return
        }
        throw approvalsError
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const handleProcessReminders = async () => {
    if (!token) {
      return
    }

    try {
      setProcessing(true)
      await api.processOwnerReminders(token)
      await loadDashboard()
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : 'Failed to process reminders')
    } finally {
      setProcessing(false)
    }
  }

  const handleReviewApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    if (!token) {
      return
    }

    try {
      setReviewingApprovalId(approvalId)
      setError(null)
      const rejectionReason = action === 'reject' ? rejectionNotes[approvalId]?.trim() : undefined

      await api.reviewOwnerRentPaymentApproval(token, approvalId, {
        action,
        rejection_reason: rejectionReason || undefined,
      })

      if (action === 'reject') {
        setRejectionNotes((current) => ({ ...current, [approvalId]: '' }))
      }

      await loadDashboard()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Failed to review rent payment approval')
    } finally {
      setReviewingApprovalId(null)
    }
  }

  const organizationLabel = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Portfolio'
  const portfolioSnapshot = portfolioOverview?.current_snapshot ?? null
  const monthlyCashFlow = portfolioSnapshot?.payload.cash_flow_summary.latest_monthly_snapshot ?? null
  const annualCashFlow = portfolioSnapshot?.payload.cash_flow_summary.latest_annual_snapshot ?? null

  return (
    <section className="space-y-6">
      <div className="ph-surface-card-strong rounded-[1.9rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1cb85]">Owner Command Center</p>
            <h2 className="ph-title mt-3 text-3xl font-semibold text-[var(--ph-text)]">Portfolio overview</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ph-text-muted)]">
              Monitor residents, support requests, reminders, and approvals from a calmer control surface.
            </p>
            <div className="mt-4">
              <OrganizationBadge name={organizationLabel} slug={owner?.organization?.slug} />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => void handleProcessReminders()}
            disabled={processing}
            variant="secondary"
            iconLeft={<Clock3 className="h-4 w-4" />}
          >
            {processing ? 'Processing...' : 'Process reminder cycle'}
          </Button>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading dashboard summary..." rows={6} /> : null}

      {!loading && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryCard label="Active Residents" value={summary.active_tenants} icon={<Users className="h-4 w-4" />} />
            <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<LifeBuoy className="h-4 w-4" />} />
            <SummaryCard label="Overdue Rent" value={summary.overdue_rent} icon={<TriangleAlert className="h-4 w-4" />} />
            <SummaryCard label="Reminders Pending" value={summary.reminders_pending} icon={<Clock3 className="h-4 w-4" />} />
            <SummaryCard
              label="Unread Notices"
              value={summary.unread_notifications}
              icon={<Bell className="h-4 w-4" />}
            />
            <SummaryCard
              label="Awaiting Approvals"
              value={summary.awaiting_approvals}
              icon={<CheckCheck className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="ph-surface-card rounded-[1.7rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Operational Focus</p>
              <div className="mt-4 space-y-4 text-sm text-[var(--ph-text-soft)]">
                <div>
                  <p className="text-[var(--ph-text)]">{summary.overdue_rent > 0 ? 'Collections need attention' : 'Collections are currently stable'}</p>
                  <p className="mt-1 text-[var(--ph-text-muted)]">
                    {summary.overdue_rent > 0
                      ? `${summary.overdue_rent} rent items are overdue and should be reviewed.`
                      : 'No overdue rent items are currently flagged.'}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--ph-text)]">{summary.awaiting_approvals > 0 ? 'Approval queue is active' : 'Approval queue is clear'}</p>
                  <p className="mt-1 text-[var(--ph-text-muted)]">
                    {summary.awaiting_approvals > 0
                      ? `${summary.awaiting_approvals} resident payment confirmations are waiting for review.`
                      : 'No resident payment confirmations are waiting for review.'}
                  </p>
                </div>
              </div>
            </article>

            <article className="ph-surface-card rounded-[1.7rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Automation Notes</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--ph-text-soft)]">
                <li>Reminder processing keeps scheduled follow-up disciplined across rent cycles.</li>
                <li>Unread notices surface resident-facing activity that still needs attention.</li>
                <li>Payment approvals stay human-led even when reminders and notifications are automated.</li>
              </ul>
            </article>
          </div>

          {portfolioSnapshot ? (
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <article className="ph-surface-card rounded-[1.7rem] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Portfolio Radar</p>
                    <h3 className="mt-3 text-xl font-semibold text-[var(--ph-text)]">Current operating posture</h3>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      Live signals across rent exposure, service activity, compliance, and occupancy.
                    </p>
                  </div>
                  <p className="text-xs text-[var(--ph-text-muted)]">
                    Updated {formatDateTime(portfolioSnapshot.generated_at)}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Overdue Rent</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{portfolioSnapshot.overdue_rent_count}</p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.overdue_rent_items[0]
                        ? `${portfolioSnapshot.payload.overdue_rent_items[0].tenant_name} needs review`
                        : 'No overdue residents currently flagged'}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Urgent Tickets</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">
                      {portfolioSnapshot.urgent_open_ticket_count}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.ticket_highlights.urgent_open[0]
                        ? portfolioSnapshot.payload.ticket_highlights.urgent_open[0].subject
                        : 'No urgent maintenance or support signals'}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">
                      Compliance Horizon
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">
                      {portfolioSnapshot.upcoming_compliance_count}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.compliance_highlights[0]
                        ? `${portfolioSnapshot.payload.compliance_highlights[0].trigger_label} in ${portfolioSnapshot.payload.compliance_highlights[0].days_remaining} days`
                        : 'No milestones inside the active reminder window'}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Occupancy</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">
                      {portfolioSnapshot.occupied_property_count}/{portfolioSnapshot.occupied_property_count + portfolioSnapshot.vacant_property_count}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.vacant_property_count > 0
                        ? `${portfolioSnapshot.vacant_property_count} unit${portfolioSnapshot.vacant_property_count === 1 ? '' : 's'} currently vacant`
                        : 'No current vacancy highlights'}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">
                      Latest Net Income
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">
                      {monthlyCashFlow
                        ? formatCurrency(monthlyCashFlow.portfolio_net_income, monthlyCashFlow.currency_code)
                        : 'N/A'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {monthlyCashFlow?.report_label ?? 'Monthly cash-flow snapshot not generated yet'}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">
                      Trailing Yield
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">
                      {typeof annualCashFlow?.portfolio_yield_percent === 'number'
                        ? `${annualCashFlow.portfolio_yield_percent}%`
                        : 'N/A'}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                      {annualCashFlow?.report_label ?? 'Annual yield signal not generated yet'}
                    </p>
                  </div>
                </div>
              </article>

              <article className="ph-surface-card rounded-[1.7rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Recent Alerts</p>
                <div className="mt-4 space-y-3">
                  {portfolioOverview?.recent_alerts.length ? (
                    portfolioOverview.recent_alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-[var(--ph-text)]">{alert.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-[var(--ph-text-muted)]">{alert.message}</p>
                          </div>
                          <p className="text-[11px] text-[var(--ph-text-muted)]">{formatDateTime(alert.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="No recent alerts"
                      description="Portfolio alerts and digests will appear here as automation activity is generated."
                      icon={<Bell className="h-5 w-5" />}
                    />
                  )}
                </div>
              </article>
            </div>
          ) : null}

          {vacancyOverview ? (
            <article className="ph-surface-card rounded-[1.7rem] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Vacancy Pipeline</p>
                  <h3 className="mt-3 text-xl font-semibold text-[var(--ph-text)]">Re-letting in motion</h3>
                  <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                    Upcoming vacancy, active campaigns, and listing readiness across your portfolio.
                  </p>
                </div>
                <Button to={ROUTES.ownerProperties} variant="ghost" size="sm" className="px-0 hover:bg-transparent">
                  Open properties
                </Button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Active</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{vacancyOverview.summary.active_campaign_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Vacant</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{vacancyOverview.summary.vacant_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Viewings</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{vacancyOverview.summary.scheduled_viewings_count}</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ph-text-muted)]">Applications</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ph-text)]">{vacancyOverview.summary.applications_count}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {vacancyOverview.campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[var(--ph-text)]">
                          {campaign.property?.property_name ?? 'Property'}
                          {campaign.property?.unit_number ? ` (${campaign.property.unit_number})` : ''}
                        </p>
                        <p className="mt-1 text-sm text-[var(--ph-text-muted)]">
                          Expected vacancy {formatDate(campaign.expected_vacancy_date)}. {campaign.next_action}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={campaign.campaign_status} />
                        <StatusBadge status={campaign.vacancy_state} />
                      </div>
                    </div>
                  </div>
                ))}
                {!vacancyOverview.campaigns.length ? (
                  <EmptyState
                    title="No vacancy campaigns active"
                    description="Re-letting campaigns will show here when lease expiry or notice triggers are detected."
                    icon={<TriangleAlert className="h-5 w-5" />}
                  />
                ) : null}
              </div>
            </article>
          ) : null}
        </>
      ) : null}

      {!loading && !summary && !error ? (
        <EmptyState
          title="No summary data"
          description="Start by adding properties and residents to generate dashboard metrics."
          icon={<TriangleAlert className="h-5 w-5" />}
          actionLabel="Manage Properties"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}

      {!loading ? (
        <div className="space-y-3">
          <div>
            <h3 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Awaiting approvals</h3>
            <p className="text-sm text-[var(--ph-text-muted)]">
              Review resident rent payment confirmations pending your verification.
            </p>
          </div>

          {approvals.length === 0 ? (
            <EmptyState
              title="No rent approvals pending"
              description="Resident payment confirmations will appear here when submitted."
              icon={<CheckCheck className="h-5 w-5" />}
            />
          ) : (
            <DataTable headers={['Resident', 'Property', 'Due Date', 'Amount', 'Requested', 'Status', 'Actions']}>
              {approvals.map((approval) => (
                <tr key={approval.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--ph-text)]">{approval.tenants?.full_name ?? '-'}</p>
                    <p className="text-xs text-[var(--ph-text-muted)]">{approval.tenants?.tenant_access_id ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--ph-text-soft)]">
                    {approval.properties?.property_name ?? '-'}
                    {approval.properties?.unit_number ? ` (${approval.properties.unit_number})` : ''}
                  </td>
                  <td className="px-4 py-3 text-[var(--ph-text-soft)]">{formatDate(approval.due_date)}</td>
                  <td className="px-4 py-3 text-[var(--ph-text-soft)]">
                    {formatCurrency(approval.amount_paid, owner?.organization?.currency_code)}
                  </td>
                  <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(approval.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={approval.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[280px] flex-col gap-2">
                      <FormInput
                        label="Reject note"
                        hideLabel
                        wrapperClassName="gap-0"
                        className="min-h-11 rounded-xl px-3 py-2 text-sm"
                        placeholder="Optional reject note"
                        value={rejectionNotes[approval.id] ?? ''}
                        onChange={(event) =>
                          setRejectionNotes((current) => ({
                            ...current,
                            [approval.id]: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          disabled={reviewingApprovalId === approval.id}
                          onClick={() => void handleReviewApproval(approval.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-500/28 bg-red-500/10 text-red-200 hover:bg-red-500/16"
                          disabled={reviewingApprovalId === approval.id}
                          onClick={() => void handleReviewApproval(approval.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      ) : null}
    </section>
  )
}
