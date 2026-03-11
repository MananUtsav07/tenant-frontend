import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCheck, Clock3, LifeBuoy, TriangleAlert, Users } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { SummaryCard } from '../../components/common/SummaryCard'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { OwnerRentPaymentApproval, OwnerSummary } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'

export function OwnerDashboardPage() {
  const { token, owner } = useOwnerAuth()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
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

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Owner Dashboard</h2>
          <p className="text-sm text-slate-400">Quick metrics for your portfolio operations.</p>
        </div>
        <Button
          type="button"
          onClick={() => void handleProcessReminders()}
          disabled={processing}
          variant="outline"
          iconLeft={<Clock3 className="h-4 w-4" />}
          className="border-slate-300 bg-white text-slate-700"
        >
          {processing ? 'Processing...' : 'Process reminders'}
        </Button>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading dashboard summary..." rows={6} /> : null}

      {!loading && summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="Active Tenants" value={summary.active_tenants} icon={<Users className="h-4 w-4" />} />
          <SummaryCard label="Open Tickets" value={summary.open_tickets} icon={<LifeBuoy className="h-4 w-4" />} />
          <SummaryCard label="Overdue Rent" value={summary.overdue_rent} icon={<TriangleAlert className="h-4 w-4" />} />
          <SummaryCard label="Reminders Pending" value={summary.reminders_pending} icon={<Clock3 className="h-4 w-4" />} />
          <SummaryCard
            label="Unread Notifications"
            value={summary.unread_notifications}
            icon={<Bell className="h-4 w-4" />}
          />
          <SummaryCard
            label="Awaiting Approvals"
            value={summary.awaiting_approvals}
            icon={<CheckCheck className="h-4 w-4" />}
          />
        </div>
      ) : null}

      {!loading && !summary && !error ? (
        <EmptyState
          title="No summary data"
          description="Start by adding properties and tenants to generate dashboard metrics."
          icon={<TriangleAlert className="h-5 w-5" />}
          actionLabel="Manage Properties"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}

      {!loading ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Awaiting Approvals</h3>
            <p className="text-sm text-slate-400">Review tenant rent payment confirmations pending your verification.</p>
          </div>

          {approvals.length === 0 ? (
            <EmptyState
              title="No rent approvals pending"
              description="Tenant payment confirmations will appear here when submitted."
              icon={<CheckCheck className="h-5 w-5" />}
            />
          ) : (
            <DataTable headers={['Tenant', 'Property', 'Due Date', 'Amount', 'Requested', 'Status', 'Actions']}>
              {approvals.map((approval) => (
                <tr key={approval.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{approval.tenants?.full_name ?? '-'}</p>
                    <p className="text-xs text-slate-400">{approval.tenants?.tenant_access_id ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {approval.properties?.property_name ?? '-'}
                    {approval.properties?.unit_number ? ` (${approval.properties.unit_number})` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(approval.due_date)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatCurrency(approval.amount_paid, owner?.organization?.currency_code)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(approval.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={approval.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[280px] flex-col gap-2">
                      <input
                        className="tf-field h-9 px-3 text-sm"
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
                          variant="secondary"
                          disabled={reviewingApprovalId === approval.id}
                          onClick={() => void handleReviewApproval(approval.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
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
