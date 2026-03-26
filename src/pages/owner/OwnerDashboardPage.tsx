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
  CreditCard,
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

// Bar chart data (static visual, representative of collection trends)
const chartBars = [
  { label: 'Jan', pct: 60, opacity: 'bg-[#FED609]/20', tooltip: 'AED 420k' },
  { label: 'Feb', pct: 75, opacity: 'bg-[#FED609]/40', tooltip: 'AED 510k' },
  { label: 'Mar', pct: 85, opacity: 'bg-[#FED609]/60', tooltip: 'AED 580k' },
  { label: 'Apr', pct: 95, opacity: 'bg-[#FED609]', tooltip: 'AED 640k' },
  { label: 'May', pct: 90, opacity: 'bg-[#FED609]/80', tooltip: 'AED 610k' },
  { label: 'Jun', pct: 100, opacity: 'bg-[#FED609]', tooltip: 'AED 680k' },
]

// Static recent activity items
const recentActivity = [
  {
    icon: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><CheckCheck className="w-5 h-5" /></div>,
    title: 'Rent payment received',
    time: '2 mins ago',
    description: 'Unit 402, Marina Gate — processed and logged.',
  },
  {
    icon: <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><Wrench className="w-5 h-5" /></div>,
    title: 'New ticket: AC Maintenance',
    time: '1 hour ago',
    description: 'Reported by a tenant in Business Bay Tower A.',
  },
  {
    icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><CreditCard className="w-5 h-5" /></div>,
    title: 'Lease agreement signed',
    time: '5 hours ago',
    description: 'New tenant for JVC Villa #18 finalized documentation.',
  },
]

// Upcoming reminders (static illustrative)
const upcomingReminders = [
  { month: 'Oct', day: '05', title: 'Bulk Rent Due', sub: '12 Units - Downtown', highlight: true },
  { month: 'Oct', day: '12', title: 'Lease Expiry', sub: 'Marina Heights #1204', highlight: false },
  { month: 'Oct', day: '20', title: 'Utility Inspection', sub: 'Palm Jumeirah Villa 4', highlight: false },
]

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

  return (
    <div className="p-6 w-full bg-[#FEFAEF] min-h-screen">

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
                {summary.active_tenants > 0 ? '—' : '0'}
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
                  {recentActivity.map((item, idx) => (
                    <div key={idx} className="p-6 flex items-start gap-4 hover:bg-[#FFFAE2] transition-colors">
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-[#1A1A1A] font-['Manrope']">{item.title}</p>
                          <span className="text-xs text-[#6B7280]">{item.time}</span>
                        </div>
                        <p className="text-sm text-[#6B7280] font-['Manrope'] mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
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
                <h2 className="font-['Sora'] text-lg font-bold text-[#1A1A1A] mb-6">Upcoming Reminders</h2>
                <div className="space-y-4">
                  {upcomingReminders.map((reminder, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        reminder.highlight
                          ? 'bg-[#FFFAE2] border-l-4 border-[#FED609]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center shrink-0 w-12">
                        <div className="text-[10px] uppercase font-bold text-[#6B7280]">{reminder.month}</div>
                        <div className="font-['Sora'] text-lg font-black text-[#1A1A1A]">{reminder.day}</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A1A]">{reminder.title}</p>
                        <p className="text-[11px] text-[#6B7280]">{reminder.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
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
