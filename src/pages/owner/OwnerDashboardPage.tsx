import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  BrainCircuit,
  Building2,
  CheckCheck,
  ChevronRight,
  Clock3,
  MessageCircle,
  PlusCircle,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { OwnerPortfolioVisibilityOverview, OwnerRentPaymentApproval, OwnerSummary } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

export function OwnerDashboardPage() {
  const { token, owner } = useOwnerAuth()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [, setPortfolioOverview] = useState<OwnerPortfolioVisibilityOverview | null>(null)
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

  const ownerName = owner?.full_name || owner?.company_name || 'Owner'
  const organizationLabel = owner?.organization?.name || owner?.company_name || owner?.full_name || 'Portfolio'

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <motion.div
        variants={revealUp}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="font-['Sora'] text-xl font-bold text-[#1A1A1A]">
            Welcome back, {ownerName}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.1)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-[#92700A]">
              {organizationLabel}
            </span>
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
      </motion.div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading dashboard summary..." rows={6} /> : null}

      {!loading && summary ? (
        <>
          {/* Stats Grid */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Card: Active Tenants */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="rounded-xl border-l-4 border-[#FED609] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Active Tenants</p>
                  <h3 className="mt-1 font-['Sora'] text-3xl font-bold text-[#1A1A1A]">{summary.active_tenants}</h3>
                </div>
                <div className="rounded-lg bg-[#FFFAE2] p-3">
                  <Users className="h-6 w-6 text-[#FED609]" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                <span>Residents in portfolio</span>
              </div>
            </motion.div>

            {/* Card: Open Tickets */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="rounded-xl border-l-4 border-orange-400 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Open Tickets</p>
                  <h3 className="mt-1 font-['Sora'] text-3xl font-bold text-[#1A1A1A]">{summary.open_tickets}</h3>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-orange-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Requires attention</span>
              </div>
            </motion.div>

            {/* Card: Overdue Rent */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="rounded-xl border-l-4 border-red-400 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Overdue Rent</p>
                  <h3 className="mt-1 font-['Sora'] text-3xl font-bold text-[#1A1A1A]">{summary.overdue_rent}</h3>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <Clock3 className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-red-600">
                {summary.overdue_rent > 0 ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Collections need attention</span>
                  </>
                ) : (
                  <span className="text-emerald-600">Collections are stable</span>
                )}
              </div>
            </motion.div>

            {/* Card: Awaiting Approvals */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="rounded-xl border-l-4 border-emerald-500 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Awaiting Approvals</p>
                  <h3 className="mt-1 font-['Sora'] text-3xl font-bold text-[#1A1A1A]">{summary.awaiting_approvals}</h3>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <Wallet className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCheck className="h-3.5 w-3.5" />
                <span>
                  {summary.awaiting_approvals > 0 ? 'Payment confirmations pending' : 'Approval queue is clear'}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Dashboard Row: Payments Table + Quick Actions */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
            {/* Left: Operational Focus / Payments Panel (60%) */}
            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="flex flex-col overflow-hidden rounded-xl border-t-4 border-[#FED609]/10 bg-white shadow-sm lg:col-span-6"
            >
              <div className="flex items-center justify-between border-b border-[#FEFAEF] p-6">
                <h3 className="font-['Sora'] text-lg font-bold text-[#1A1A1A]">Portfolio Status</h3>
                <Link
                  to={ROUTES.ownerTenants}
                  className="text-sm font-bold text-[#FED609] hover:underline"
                >
                  View Tenants
                </Link>
              </div>

              {/* Stats summary rows */}
              <div className="divide-y divide-[#FEFAEF]">
                {/* Reminders pending row */}
                <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#FEFAEF]/40">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FFFAE2]">
                    <Bell className="h-5 w-5 text-[#FED609]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1A1A1A]">Reminders Pending</p>
                    <p className="text-xs text-[#6B7280]">Scheduled follow-ups across rent cycles</p>
                  </div>
                  <span className="font-['Sora'] text-2xl font-bold text-[#1A1A1A]">{summary.reminders_pending}</span>
                </div>

                {/* Unread notifications row */}
                <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#FEFAEF]/40">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FFFAE2]">
                    <Bell className="h-5 w-5 text-[#FED609]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1A1A1A]">Unread Notifications</p>
                    <p className="text-xs text-[#6B7280]">Resident-facing activity awaiting review</p>
                  </div>
                  <span className="font-['Sora'] text-2xl font-bold text-[#1A1A1A]">{summary.unread_notifications}</span>
                </div>

                {/* Collections status row */}
                <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#FEFAEF]/40">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {summary.overdue_rent > 0 ? 'Collections need attention' : 'Collections are currently stable'}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {summary.overdue_rent > 0
                        ? `${summary.overdue_rent} rent items are overdue and should be reviewed.`
                        : 'No overdue rent items are currently flagged.'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                      summary.overdue_rent > 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {summary.overdue_rent > 0 ? 'Action Needed' : 'Stable'}
                  </span>
                </div>

                {/* Approval queue row */}
                <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#FEFAEF]/40">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FFFAE2]">
                    <CheckCheck className="h-5 w-5 text-[#FED609]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {summary.awaiting_approvals > 0 ? 'Approval queue is active' : 'Approval queue is clear'}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {summary.awaiting_approvals > 0
                        ? `${summary.awaiting_approvals} resident payment confirmations are waiting for review.`
                        : 'No resident payment confirmations are waiting for review.'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                      summary.awaiting_approvals > 0
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-[#FED609] text-[#1A1A1A]'
                    }`}
                  >
                    {summary.awaiting_approvals > 0 ? 'Pending' : 'Clear'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Quick Actions + AI Insight (40%) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {/* Quick Actions */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="rounded-xl border-t-4 border-[#FED609]/10 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-5 font-['Sora'] text-lg font-bold text-[#1A1A1A]">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <Link
                    to={ROUTES.ownerProperties}
                    className="flex w-full items-center justify-between rounded-xl bg-[#FED609] px-4 py-3 font-bold text-[#1A1A1A] transition-all hover:bg-[#FFD70B] active:scale-95"
                  >
                    <span className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      Manage Properties
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to={ROUTES.ownerTenants}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-[#FED609] px-4 py-3 font-bold text-[#1A1A1A] transition-all hover:bg-[#FED609]/5 active:scale-95"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      View Tenants
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#FED609]" />
                  </Link>

                  <div className="my-1 h-px bg-[#FEFAEF]" />

                  <button
                    type="button"
                    onClick={() => void handleProcessReminders()}
                    disabled={processing}
                    className="flex w-full items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3 font-bold text-white transition-all hover:brightness-105 active:scale-95 disabled:opacity-60"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {processing ? 'Processing...' : 'Send WhatsApp Reminders'}
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-[#0088cc] px-4 py-3 font-bold text-white transition-all hover:brightness-105 active:scale-95"
                  >
                    <Send className="h-5 w-5" />
                    Send Telegram Reminders
                  </button>
                </div>
              </motion.div>

              {/* AI Insight Card */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="group relative overflow-hidden rounded-xl bg-[#1A1A1A] p-6 shadow-lg"
              >
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2 text-[#FED609]">
                    <BrainCircuit className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Insight</span>
                  </div>
                  <p className="mb-4 text-sm font-medium leading-relaxed text-white">
                    Reminder processing keeps scheduled follow-up disciplined across rent cycles.{' '}
                    <span className="font-bold text-[#FED609]">Payment approvals stay human-led</span> even when
                    notifications are automated.
                  </p>
                  <Link
                    to={ROUTES.ownerAiSettings}
                    className="text-xs font-bold text-[#FED609] underline"
                  >
                    Configure AI settings
                  </Link>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
                  <Sparkles className="h-24 w-24 text-white" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Row: Notifications Banner */}
          {summary.unread_notifications > 0 && (
            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="flex items-center justify-between rounded-xl border border-[rgba(254,214,9,0.2)] bg-[rgba(254,214,9,0.06)] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FED609]">
                  <Bell className="h-5 w-5 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    {summary.unread_notifications} unread notification{summary.unread_notifications !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-[#6B7280]">Resident-facing activity awaiting your review</p>
                </div>
              </div>
              <Link
                to={ROUTES.ownerNotifications}
                className="flex items-center gap-2 rounded-lg bg-[#FED609] px-4 py-2 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-[#FFD70B] active:scale-95"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </>
      ) : null}

      {!loading && !summary && !error ? (
        <EmptyState
          title="No summary data"
          description="Start by adding properties and residents to generate dashboard metrics."
          icon={<AlertTriangle className="h-5 w-5" />}
          actionLabel="Manage Properties"
          actionHref={ROUTES.ownerProperties}
        />
      ) : null}

      {/* Awaiting Approvals Section */}
      {!loading ? (
        <div className="space-y-4">
          <motion.div
            variants={revealUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex items-center justify-between"
          >
            <div>
              <h3 className="font-['Sora'] text-2xl font-bold text-[#1A1A1A]">Awaiting approvals</h3>
              <p className="text-sm text-[#6B7280]">
                Review resident rent payment confirmations pending your verification.
              </p>
            </div>
            {approvals.length > 0 && (
              <span className="rounded bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase text-orange-600">
                Action Required
              </span>
            )}
          </motion.div>

          {approvals.length === 0 ? (
            <EmptyState
              title="No rent approvals pending"
              description="Resident payment confirmations will appear here when submitted."
              icon={<CheckCheck className="h-5 w-5" />}
            />
          ) : (
            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <DataTable headers={['Resident', 'Property', 'Due Date', 'Amount', 'Requested', 'Status', 'Actions']}>
                {approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A1A1A]">{approval.tenants?.full_name ?? '-'}</p>
                      <p className="text-xs text-[#6B7280]">{approval.tenants?.tenant_access_id ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {approval.properties?.property_name ?? '-'}
                      {approval.properties?.unit_number ? ` (${approval.properties.unit_number})` : ''}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">{formatDate(approval.due_date)}</td>
                    <td className="px-4 py-3 font-bold text-[#1A1A1A]">
                      {formatCurrency(approval.amount_paid, owner?.organization?.currency_code)}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{formatDateTime(approval.created_at)}</td>
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
                            className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
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
            </motion.div>
          )}
        </div>
      ) : null}

      {/* Floating Live Yield FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to={ROUTES.ownerAutomation}
          className="flex items-center gap-3 rounded-full bg-[#1A1A1A] px-4 py-3 shadow-2xl transition-transform hover:scale-105"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FED609]">
            <PlusCircle className="h-4 w-4 text-[#1A1A1A]" />
          </div>
          <div className="pr-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-tighter text-[#FED609]">Automation</p>
            <p className="text-sm font-bold text-white">AI Settings</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
