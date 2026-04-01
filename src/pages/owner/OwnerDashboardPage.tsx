import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCheck,
  ChevronRight,
  Clock3,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { OwnerOnboardingWizard } from '../../components/owner/OwnerOnboardingWizard'
import { useOwnerOnboarding } from '../../hooks/useOwnerOnboarding'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { ComplianceUpcomingItem, OwnerNotification, OwnerPortfolioVisibilityOverview, OwnerRentPaymentApproval, OwnerSummary, AutomationRun } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

// Helper to get time difference string
function getTimeAgoString(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

// Helper to get activity icon and color based on status
function getActivityIcon(flowName: string, status: string) {
  const statusColors: Record<string, { bgColor: string; textColor: string; icon: typeof CheckCheck }> = {
    success: { bgColor: 'bg-green-100', textColor: 'text-green-600', icon: CheckCheck },
    failed: { bgColor: 'bg-red-100', textColor: 'text-red-600', icon: AlertTriangle },
    partial: { bgColor: 'bg-amber-100', textColor: 'text-amber-600', icon: Wrench },
    skipped: { bgColor: 'bg-gray-100', textColor: 'text-gray-600', icon: Clock3 },
  }

  const config = statusColors[status] || statusColors.partial
  const Icon = config.icon

  return {
    icon: <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center ${config.textColor} shrink-0`}><Icon className="w-5 h-5" /></div>,
  }
}

export function OwnerDashboardPage() {
  const { token, owner } = useOwnerAuth()
  const { showWizard, dismissWizard } = useOwnerOnboarding()
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [, setPortfolioOverview] = useState<OwnerPortfolioVisibilityOverview | null>(null)
  const [approvals, setApprovals] = useState<OwnerRentPaymentApproval[]>([])
  const [recentActivity, setRecentActivity] = useState<AutomationRun[]>([])
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [upcomingItems, setUpcomingItems] = useState<ComplianceUpcomingItem[]>([])
  const [chartBars, setChartBars] = useState<Array<{ label: string; pct: number; opacity: string; tooltip: string }>>([])
  const [totalProperties, setTotalProperties] = useState(0)
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
        } else {
          throw approvalsError
        }
      }

      // Fetch total properties count
      try {
        const propertiesResponse = await api.getOwnerProperties(token)
        setTotalProperties(propertiesResponse.properties?.length || 0)
      } catch (propertiesError) {
        if (!(propertiesError instanceof Error && propertiesError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load properties:', propertiesError)
        }
      }

      // Fetch recent automation activities
      try {
        const activityResponse = await api.getOwnerAutomationActivity(token, { page: 1, page_size: 3 })
        setRecentActivity(activityResponse.items || [])
      } catch (activityError) {
        if (!(activityError instanceof Error && activityError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load automation activity:', activityError)
        }
      }

      // Fetch recent notifications for activity feed
      try {
        const notificationsResponse = await api.getOwnerNotifications(token)
        setNotifications((notificationsResponse.notifications || []).slice(0, 5))
      } catch (notifError) {
        if (!(notifError instanceof Error && notifError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load notifications:', notifError)
        }
      }

      // Fetch compliance upcoming items for reminders
      try {
        const complianceResponse = await api.getOwnerAutomationCompliance(token)
        setUpcomingItems(complianceResponse.compliance?.upcoming_items || [])
      } catch (complianceError) {
        if (!(complianceError instanceof Error && complianceError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load compliance data:', complianceError)
        }
      }

      // Fetch cash flow data for chart
      try {
        const cashFlowResponse = await api.getOwnerAutomationCashFlow(token)
        if (cashFlowResponse.ok && cashFlowResponse.cash_flow) {
          const cf = cashFlowResponse.cash_flow
          // Build chart bars from recent snapshots (last 6 months)
          const recentSnapshots = cf.recent_snapshots?.slice(-6) || []
          const maxAmount = Math.max(...recentSnapshots.map(s => s.portfolio_gross_rent || 0), 100000)

          const bars = recentSnapshots.map((snapshot) => {
            const monthIndex = snapshot.report_month - 1
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const month = monthNames[monthIndex] || 'N/A'

            // Use portfolio gross rent as the amount
            const amount = snapshot.portfolio_gross_rent || 0
            const tooltip = formatCurrency(amount)

            // Calculate percentage relative to max
            const pct = Math.min(100, (amount / maxAmount) * 100)

            const opacityLevels = ['bg-[#FED609]/20', 'bg-[#FED609]/40', 'bg-[#FED609]/60', 'bg-[#FED609]/80', 'bg-[#FED609]']
            const opacityIndex = Math.floor((pct / 100) * (opacityLevels.length - 1))
            const opacity = opacityLevels[opacityIndex]

            return { label: month, pct, opacity, tooltip }
          })
          setChartBars(bars)
        }
      } catch (cashFlowError) {
        if (!(cashFlowError instanceof Error && cashFlowError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load cash flow data:', cashFlowError)
        }
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

  return (
    <div className="p-6 w-full bg-[#FEFAEF] min-h-screen">
      {showWizard && <OwnerOnboardingWizard onComplete={dismissWizard} onSkip={dismissWizard} />}

      {/* Greeting */}
      <motion.div
        variants={revealUp}
        initial="hidden"
        animate="show"
        className="mb-8 px-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
              Welcome back, {ownerName}
            </h1>
            <p className="font-['Manrope'] text-[#6B7280] font-medium mt-1">
              Here is what&apos;s happening with your portfolio today.
            </p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Properties */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#FED609]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Portfolio</span>
              </div>
              <div className="text-[#6B7280] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Total Properties</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-[#1A1A1A]">
                {totalProperties}
              </div>
            </motion.div>

            {/* Active Tenants */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#FED609]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <div className="text-[#6B7280] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Active Tenants</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-[#1A1A1A]">{summary.active_tenants}</div>
            </motion.div>

            {/* Open Tickets */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#FED609]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                {summary.open_tickets > 0 && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {summary.open_tickets > 3 ? `${summary.open_tickets} open` : 'Urgent'}
                  </span>
                )}
              </div>
              <div className="text-[#6B7280] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Open Tickets</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-[#1A1A1A]">{summary.open_tickets}</div>
            </motion.div>

            {/* Pending Payments / Awaiting Approvals */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-[#FED609]/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                {summary.awaiting_approvals > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>
              <div className="text-[#6B7280] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Pending Payments</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-[#1A1A1A]">{summary.awaiting_approvals}</div>
            </motion.div>
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Rent Collection chart + Recent Activity */}
            <div className="lg:col-span-8 space-y-8">

              {/* Rent Collection Chart */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-white p-8 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-['Sora'] text-xl font-bold text-[#1A1A1A]">Rent Collection</h2>
                    <p className="text-sm text-[#6B7280] font-['Manrope']">Monthly collection trends for 2024</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="px-3 py-1 text-xs font-bold bg-[#FED609] text-[#1A1A1A] rounded-full">Monthly</button>
                    <button type="button" className="px-3 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">Quarterly</button>
                  </div>
                </div>
                {/* CSS Bar Chart */}
                {chartBars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-[#6B7280]">
                    <TrendingUp className="w-10 h-10 text-[#FED609]/40 mb-3" />
                    <p className="text-sm font-['Manrope'] font-medium">No collection data yet</p>
                    <p className="text-xs mt-1">Chart will populate once rent payments are recorded</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between h-64 gap-6 px-2">
                      {chartBars.map((bar) => (
                        <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className={`w-full ${bar.opacity} rounded-t-lg relative group`}
                            style={{ height: `${bar.pct}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {bar.tooltip}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase">{bar.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Portfolio metrics row below chart */}
                    <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-[#FEFAEF]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFFAE2]">
                          <Bell className="h-4 w-4 text-[#FED609]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A]">Reminders Pending</p>
                          <p className="text-lg font-['Sora'] font-bold text-[#1A1A1A]">{summary.reminders_pending}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${summary.overdue_rent > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <TrendingUp className={`h-4 w-4 ${summary.overdue_rent > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A]">
                            {summary.overdue_rent > 0 ? 'Overdue Rent' : 'Collections Stable'}
                          </p>
                          <p className="text-lg font-['Sora'] font-bold text-[#1A1A1A]">
                            {summary.overdue_rent > 0 ? summary.overdue_rent : '✓'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-['Sora'] text-xl font-bold text-[#1A1A1A]">Recent Activity</h2>
                  <Link to={ROUTES.ownerTenants} className="text-[#FED609] font-bold text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const timeAgo = getTimeAgoString(notif.created_at)
                      const icon = (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-gray-100 text-gray-400' : 'bg-[#FED609]/15 text-[#D4A800]'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                      )
                      return (
                        <div key={notif.id} className={`p-6 flex items-start gap-4 hover:bg-[#FFFAE2] transition-colors ${!notif.is_read ? 'border-l-2 border-[#FED609]' : ''}`}>
                          {icon}
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-[#1A1A1A] font-['Manrope'] text-sm">{notif.title}</p>
                              <span className="text-xs text-[#6B7280] shrink-0">{timeAgo}</span>
                            </div>
                            <p className="text-sm text-[#6B7280] font-['Manrope'] mt-1">{notif.message}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((item) => {
                      const { icon } = getActivityIcon(item.flow_name, item.status)
                      const timeAgo = getTimeAgoString(item.started_at)
                      const title = `${item.flow_name} — ${item.status === 'success' ? 'completed' : item.status}`
                      const description = `Processed ${item.processed_count} item${item.processed_count !== 1 ? 's' : ''}`
                      return (
                        <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-[#FFFAE2] transition-colors">
                          {icon}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-[#1A1A1A] font-['Manrope'] text-sm">{title}</p>
                              <span className="text-xs text-[#6B7280]">{timeAgo}</span>
                            </div>
                            <p className="text-sm text-[#6B7280] font-['Manrope'] mt-1">{description}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-[#6B7280] font-['Manrope'] text-sm">
                      No recent activity yet.
                    </div>
                  )}
                </div>

                {/* Unread notifications banner inside activity section */}
                {summary.unread_notifications > 0 && (
                  <div className="flex items-center justify-between p-5 border-t border-[#FEFAEF] bg-[rgba(254,214,9,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FED609]">
                        <Bell className="h-4 w-4 text-[#1A1A1A]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {summary.unread_notifications} unread notification{summary.unread_notifications !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-[#6B7280]">Awaiting your review</p>
                      </div>
                    </div>
                    <Link
                      to={ROUTES.ownerNotifications}
                      className="flex items-center gap-2 rounded-lg bg-[#FED609] px-4 py-2 text-sm font-bold text-[#1A1A1A] hover:bg-[#FFD70B] active:scale-95 transition-all"
                    >
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Quick Actions + Upcoming Reminders + AI Insights */}
            <div className="lg:col-span-4 space-y-8">

              {/* Quick Actions */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="font-['Sora'] text-lg font-bold text-[#1A1A1A] mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to={ROUTES.ownerProperties}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-yellow-100 hover:bg-[#FED609]/10 hover:border-[#FED609] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">Add Property</span>
                  </Link>
                  <Link
                    to={ROUTES.ownerTenants}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-yellow-100 hover:bg-[#FED609]/10 hover:border-[#FED609] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">Add Tenant</span>
                  </Link>
                  <Link
                    to={ROUTES.ownerTickets}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-yellow-100 hover:bg-[#FED609]/10 hover:border-[#FED609] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FED609]/10 flex items-center justify-center text-[#FED609] group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">View Tickets</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleProcessReminders()}
                    disabled={processing}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-yellow-100 hover:bg-[#FED609]/10 hover:border-[#FED609] transition-all group disabled:opacity-60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {processing ? 'Sending...' : 'Send Reminder'}
                    </span>
                  </button>
                </div>

                {/* Telegram quick action */}
                <button
                  type="button"
                  className="mt-4 w-full flex items-center gap-3 rounded-xl bg-[#0088cc] px-4 py-3 font-bold text-white text-sm transition-all hover:brightness-105 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                  Send Reminder via Telegram
                </button>
              </motion.div>

              {/* Upcoming Reminders */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="font-['Sora'] text-lg font-bold text-[#1A1A1A] mb-4">Upcoming Reminders</h2>
                <div className="space-y-3">
                  {upcomingItems.length > 0 ? (
                    upcomingItems.slice(0, 4).map((item) => {
                      const date = new Date(item.relevant_date)
                      const month = date.toLocaleString('default', { month: 'short' }).toUpperCase()
                      const day = date.getDate().toString()
                      const isUrgent = item.days_remaining <= 30
                      const propertyLabel = item.unit_number
                        ? `${item.property_name} #${item.unit_number}`
                        : item.property_name
                      return (
                        <div
                          key={item.legal_date_id}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isUrgent ? 'bg-[#FFFAE2] border-l-4 border-[#FED609]' : 'hover:bg-gray-50'}`}
                        >
                          <div className="text-center shrink-0 w-12">
                            <div className="text-[10px] uppercase font-bold text-[#6B7280]">{month}</div>
                            <div className="font-['Sora'] text-lg font-black text-[#1A1A1A]">{day}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{item.trigger_label}</p>
                            <p className="text-[11px] text-[#6B7280] truncate">{propertyLabel}</p>
                          </div>
                          <span className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-full ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.days_remaining}d
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-[#6B7280] text-sm font-['Manrope']">
                      <p>No upcoming reminders</p>
                      <p className="text-[11px] mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm rounded-xl hover:border-[#FED609] hover:text-[#FED609] transition-all"
                >
                  + New Reminder
                </button>
              </motion.div>

              {/* AI Insights */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="group relative overflow-hidden rounded-xl bg-[#1A1A1A] p-6 shadow-lg"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-[#FED609]" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#FED609]">AI Insight</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white mb-4">
                    You could increase revenue by{' '}
                    <span className="text-[#FED609] font-bold">4.2%</span>{' '}
                    by optimizing service charge distribution in your portfolio.
                  </p>
                  <Link
                    to={ROUTES.ownerAiSettings}
                    className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-white inline-block"
                  >
                    View Analysis
                  </Link>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FED609]/20 blur-3xl rounded-full" />
              </motion.div>
            </div>
          </div>
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
        <div className="space-y-4 mt-8">
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
    </div>
  )
}
