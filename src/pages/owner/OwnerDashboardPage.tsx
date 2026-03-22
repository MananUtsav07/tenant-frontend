import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock3, TriangleAlert } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { Tabs } from '../../components/common/Tabs'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { OwnerPortfolioVisibilityOverview, OwnerRentPaymentApproval, OwnerSummary } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'

export function OwnerDashboardPage() {
  const { token, owner } = useOwnerAuth()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [portfolioOverview, setPortfolioOverview] = useState<OwnerPortfolioVisibilityOverview | null>(null)
  const [approvals, setApprovals] = useState<OwnerRentPaymentApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [reviewingApprovalId, setReviewingApprovalId] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('overview')

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
  const summaryItems = useMemo(
    () =>
      summary
        ? [
            {
              label: 'Active Residents',
              value: summary.active_tenants,
              hint: summary.active_tenants > 0 ? 'Live tenancies across the portfolio' : 'No active residents yet',
            },
            {
              label: 'Open Tickets',
              value: summary.open_tickets,
              hint: summary.open_tickets > 0 ? 'Support issues currently in motion' : 'Support queue is quiet',
            },
            {
              label: 'Overdue Rent',
              value: summary.overdue_rent,
              hint: summary.overdue_rent > 0 ? 'Collections need a review pass' : 'Collections are stable',
            },
            {
              label: 'Reminders Pending',
              value: summary.reminders_pending,
              hint: summary.reminders_pending > 0 ? 'Scheduled follow-up still queued' : 'Reminder cycle is clear',
            },
            {
              label: 'Unread Notices',
              value: summary.unread_notifications,
              hint: summary.unread_notifications > 0 ? 'Owner inbox has unread activity' : 'Inbox is fully reviewed',
            },
            {
              label: 'Awaiting Approvals',
              value: summary.awaiting_approvals,
              hint: summary.awaiting_approvals > 0 ? 'Payment confirmations need review' : 'Approval queue is clear',
            },
          ]
        : [],
    [summary],
  )
  const dashboardTabs = useMemo(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'approvals', label: `Approvals (${approvals.length})` },
    { key: 'portfolio', label: 'Portfolio' },
  ], [approvals.length])

  return (
    <section className="ph-page-shell">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="ph-page-header">
          <h2 className="ph-page-heading">Dashboard</h2>
          {summary ? (
            <div className="space-y-1 text-sm text-[var(--ph-text-muted)]">
              <p>
                {summary.overdue_rent > 0
                  ? `${summary.overdue_rent} overdue rent item${summary.overdue_rent === 1 ? '' : 's'} need review.`
                  : 'Collections stable with no overdue rent items.'}
              </p>
              <p>
                {summary.awaiting_approvals > 0
                  ? `${summary.awaiting_approvals} payment approval${summary.awaiting_approvals === 1 ? '' : 's'} waiting for review.`
                  : 'Approval queue is currently clear.'}
              </p>
            </div>
          ) : null}
          <div className="pt-1">
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
          {processing ? 'Processing...' : 'Process reminders'}
        </Button>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading dashboard summary..." rows={6} /> : null}

      {!loading && summary ? (
        <>
          <Tabs tabs={dashboardTabs} activeKey={activeTab} onChange={setActiveTab} />

          {activeTab === 'overview' ? (
            <article className="ph-surface-card overflow-hidden p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {summaryItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`min-w-0 border-[rgba(83,88,100,0.15)] ${
                      index % 2 === 0 ? 'border-r' : ''
                    } ${index < 4 ? 'border-b' : ''} ${index % 3 !== 2 ? 'sm:border-r' : 'sm:border-r-0'} ${
                      index < 3 ? 'sm:border-b' : 'sm:border-b-0'
                    }`}
                  >
                    <SummaryCard label={item.label} value={item.value} hint={item.hint} />
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {activeTab === 'approvals' ? (
            approvals.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--ph-text-muted)]">No rent approvals are pending right now.</p>
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
            )
          ) : null}

          {activeTab === 'portfolio' ? (
            portfolioSnapshot ? (
              <div className="space-y-4">
                <p className="text-xs text-[var(--ph-text-muted)]">Portfolio snapshot · Updated {formatDateTime(portfolioSnapshot.generated_at)}</p>

                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Overdue Rent</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">{portfolioSnapshot.overdue_rent_count}</p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.overdue_rent_items[0]
                        ? `${portfolioSnapshot.payload.overdue_rent_items[0].tenant_name} needs review`
                        : 'No overdue residents flagged'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Urgent Tickets</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">{portfolioSnapshot.urgent_open_ticket_count}</p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.ticket_highlights.urgent_open[0]
                        ? portfolioSnapshot.payload.ticket_highlights.urgent_open[0].subject
                        : 'No urgent signals'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Compliance</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">{portfolioSnapshot.upcoming_compliance_count}</p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.payload.compliance_highlights[0]
                        ? `${portfolioSnapshot.payload.compliance_highlights[0].trigger_label} in ${portfolioSnapshot.payload.compliance_highlights[0].days_remaining}d`
                        : 'No upcoming milestones'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Occupancy</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">
                      {portfolioSnapshot.occupied_property_count}/{portfolioSnapshot.occupied_property_count + portfolioSnapshot.vacant_property_count}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">
                      {portfolioSnapshot.vacant_property_count > 0 ? `${portfolioSnapshot.vacant_property_count} vacant` : 'Fully occupied'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Net Income</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">
                      {monthlyCashFlow ? formatCurrency(monthlyCashFlow.portfolio_net_income, monthlyCashFlow.currency_code) : 'N/A'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{monthlyCashFlow?.report_label ?? 'Not generated yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ph-text-muted)]">Yield</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-[var(--ph-text)]">
                      {typeof annualCashFlow?.portfolio_yield_percent === 'number' ? `${annualCashFlow.portfolio_yield_percent}%` : 'N/A'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ph-text-muted)]">{annualCashFlow?.report_label ?? 'Not generated yet'}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium text-[var(--ph-text-muted)]">Recent alerts</p>
                  {portfolioOverview?.recent_alerts.length ? (
                    <div className="divide-y divide-[rgba(83,88,100,0.1)]">
                      {portfolioOverview.recent_alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <div>
                            <p className="text-sm font-medium text-[var(--ph-text)]">{alert.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--ph-text-muted)]">{alert.message}</p>
                          </div>
                          <p className="shrink-0 text-[10px] text-[var(--ph-text-muted)]">{formatDateTime(alert.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--ph-text-muted)]">No recent alerts yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--ph-text-muted)]">Portfolio visibility not available yet.</p>
            )
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
    </section>
  )
}
