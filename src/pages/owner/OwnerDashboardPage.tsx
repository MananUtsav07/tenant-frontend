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
  Crown,
  Lock,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'

import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { BillingState, OwnerNotification, OwnerPortfolioVisibilityOverview, OwnerRentPaymentApproval, OwnerSummary, AutomationRun, Tenant } from '../../types/api'
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
function getActivityIcon(_flowName: string, status: string) {
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
  const [summary, setSummary] = useState<OwnerSummary | null>(null)
  const [, setPortfolioOverview] = useState<OwnerPortfolioVisibilityOverview | null>(null)
  const [approvals, setApprovals] = useState<OwnerRentPaymentApproval[]>([])
  const [recentActivity, setRecentActivity] = useState<AutomationRun[]>([])
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [chartBars] = useState<Array<{ label: string; pct: number; opacity: string; tooltipTitle: string; tooltipLines?: string[] }>>([])
  const [quarterlyBars] = useState<Array<{ label: string; pct: number; opacity: string; tooltipTitle: string; tooltipLines?: string[] }>>([])
  const [rentStats, setRentStats] = useState<{ totalDue: number; totalPaid: number; pending: number; tenantCount: number }>({
    totalDue: 0,
    totalPaid: 0,
    pending: 0,
    tenantCount: 0,
  })
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly')
  const [totalProperties, setTotalProperties] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewingApprovalId, setReviewingApprovalId] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({})
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [dashboardTenants, setDashboardTenants] = useState<Tenant[]>([])
  const [leaseDigest, setLeaseDigest] = useState<string | null>(null)
  const [digestLoading, setDigestLoading] = useState(false)

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

      // Fetch rent ledger for chart (direct — always reflects approved payments)
      try {
        const ledgerResponse = await api.getOwnerRentLedger(token)
        const entries = ledgerResponse.entries ?? []

        // Monthly analytics (current month)
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        const currentEntries = entries.filter(entry => entry.cycle_year === currentYear && entry.cycle_month === currentMonth)
        const totals = currentEntries.reduce((acc, entry) => {
          acc.totalDue += entry.amount_due
          acc.totalPaid += entry.amount_paid
          if (entry.tenant_id) acc.tenantIds.add(entry.tenant_id)
          return acc
        }, { totalDue: 0, totalPaid: 0, tenantIds: new Set<string>() })
        const pending = Math.max(0, totals.totalDue - totals.totalPaid)
        setRentStats({
          totalDue: totals.totalDue,
          totalPaid: totals.totalPaid,
          pending,
          tenantCount: totals.tenantIds.size,
        })
      } catch (ledgerError) {
        if (!(ledgerError instanceof Error && ledgerError.message.toLowerCase().includes('route not found'))) {
          console.error('Failed to load rent ledger:', ledgerError)
        }
      }
      // Fetch tenants for lease digest
      try {
        const tenantsResponse = await api.getOwnerTenants(token)
        setDashboardTenants(tenantsResponse.tenants ?? [])
      } catch {
        // silently fail — digest card will still render without data
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

  useEffect(() => {
    if (!token) return
    api.getBillingState(token).then(res => setBilling(res.billing)).catch(() => {})
  }, [token])

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

  const handleGenerateDigest = async () => {
    if (!token || dashboardTenants.length === 0) return
    try {
      setDigestLoading(true)
      const payload = dashboardTenants.map((t) => ({
        name: t.full_name,
        lease_end_date: t.lease_end_date ?? null,
        payment_status: t.payment_status,
        monthly_rent: Number(t.monthly_rent ?? 0),
      }))
      const result = await api.getOwnerLeaseDigest(token, { tenants: payload })
      if (result.ok && result.digest) {
        setLeaseDigest(result.digest.digest)
      }
    } catch {
      // silently fail
    } finally {
      setDigestLoading(false)
    }
  }

  const ownerName = owner?.full_name || owner?.company_name || 'Owner'
  const rentProgress = rentStats.totalDue > 0 ? Math.round((rentStats.totalPaid / rentStats.totalDue) * 100) : 0
  const rentProgressClamped = Math.min(100, Math.max(0, rentProgress))
  const showChartInLeft = false

  /* ── Trial-expired lock overlay ── */
  if (billing && billing.isTrialExpired && !billing.canAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#06070B] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="rounded-2xl border border-[#F25461]/30 bg-[#101114] p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F25461]/15 mb-5">
              <Lock className="h-8 w-8 text-[#F25461]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-['Sora'] mb-3">Your free trial has ended</h1>
            <p className="text-[#8D8D96] font-['Manrope'] leading-relaxed mb-2">
              Your 14-day trial has expired. Choose a plan to restore access to your portfolio dashboard and all features.
            </p>
            <p className="text-xs text-[#8D8D96]/60 font-['Manrope'] mb-8">
              No data has been deleted — everything is waiting for you.
            </p>
            <Link
              to={ROUTES.ownerBilling}
              className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl bg-[#2251E3] hover:bg-[#4E79FF] transition-all text-white font-['DM_Sans']"
            >
              <CreditCard className="h-4 w-4" />
              Choose a Plan
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full bg-[#06070B] min-h-screen text-white">
      {/* Greeting */}
      <motion.div
        variants={revealUp}
        initial="hidden"
        animate="show"
        className="mb-8 px-2"
      >
        <div>
          <h1 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {ownerName}
          </h1>
          <p className="font-['Manrope'] text-[#8D8D96] font-medium mt-1">
            Here is what&apos;s happening with your portfolio today.
          </p>
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
              className="bg-[#101114] p-6 rounded-xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4E79FF]/15 flex items-center justify-center text-[#4E79FF] group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#32C382] bg-[#32C382]/15 px-2 py-1 rounded">Portfolio</span>
              </div>
              <div className="text-[#8D8D96] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Total Properties</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-white">
                {totalProperties}
              </div>
            </motion.div>

            {/* Active Tenants */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-[#101114] p-6 rounded-xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4E79FF]/15 flex items-center justify-center text-[#4E79FF] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#32C382] bg-[#32C382]/15 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <div className="text-[#8D8D96] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Active Tenants</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-white">{summary.active_tenants}</div>
            </motion.div>

            {/* Open Tickets */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-[#101114] p-6 rounded-xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4E79FF]/15 flex items-center justify-center text-[#4E79FF] group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                {summary.open_tickets > 0 && (
                  <span className="text-xs font-bold text-[#EBCF42] bg-[#EBCF42]/15 px-2 py-1 rounded">
                    {summary.open_tickets > 3 ? `${summary.open_tickets} open` : 'Urgent'}
                  </span>
                )}
              </div>
              <div className="text-[#8D8D96] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Open Tickets</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-white">{summary.open_tickets}</div>
            </motion.div>

            {/* Pending Payments / Awaiting Approvals */}
            <motion.div
              variants={revealUp}
              whileInView="show"
              viewport={viewportOnce}
              className="bg-[#101114] p-6 rounded-xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#4E79FF]/15 flex items-center justify-center text-[#4E79FF] group-hover:scale-110 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                {summary.awaiting_approvals > 0 && (
                  <span className="text-xs font-bold text-[#F25461] bg-[#F25461]/15 px-2 py-1 rounded">
                    Pending
                  </span>
                )}
              </div>
              <div className="text-[#8D8D96] text-sm font-['DM_Sans'] font-medium mb-1 uppercase tracking-wider">Pending Payments</div>
              <div className="font-['Sora'] text-3xl font-extrabold text-white">{summary.awaiting_approvals}</div>
            </motion.div>
          </motion.div>

          {/* Lease Risk Digest */}
          <motion.div variants={revealUp} initial="hidden" animate="show" className="mb-8">
            <div className="bg-[#101114] rounded-xl border p-6" style={{ borderColor: 'rgba(235,207,66,0.25)' }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(235,207,66,0.15)' }}>
                    <AlertTriangle className="w-5 h-5" style={{ color: '#EBCF42' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-['DM_Sans'] uppercase tracking-wider" style={{ color: '#EBCF42' }}>Lease Risk Digest</p>
                    <p className="text-xs font-['Manrope']" style={{ color: '#8D8D96' }}>
                      {dashboardTenants.length > 0
                        ? `${dashboardTenants.filter((t) => { const end = t.lease_end_date ? new Date(t.lease_end_date) : null; const in60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); return end && end >= new Date() && end <= in60 }).length} expiring · ${dashboardTenants.filter((t) => t.payment_status === 'overdue').length} overdue`
                        : 'AI-generated tenant risk summary'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleGenerateDigest()}
                  disabled={digestLoading || dashboardTenants.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(235,207,66,0.12)', color: '#EBCF42', border: '1px solid rgba(235,207,66,0.3)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  {digestLoading ? 'Generating…' : 'Generate AI Summary'}
                </button>
              </div>
              {leaseDigest ? (
                <div className="rounded-lg px-4 py-3 text-sm font-['Manrope'] leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: 'rgba(235,207,66,0.06)', color: '#E5E7EB', border: '1px solid rgba(235,207,66,0.15)' }}>
                  {leaseDigest}
                </div>
              ) : (
                <p className="text-xs font-['Manrope']" style={{ color: '#8D8D96' }}>
                  Click &quot;Generate AI Summary&quot; to get an action-oriented overview of lease renewals and payment risks.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <motion.div variants={revealUp}>
              <Link
                to={ROUTES.ownerIntegrations}
                className="group block rounded-2xl border border-[#272839] bg-[#101114] p-5 transition-colors hover:border-[#25D366]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white font-['Sora']">WhatsApp</p>
                      <p className="mt-1 truncate text-xs text-[#8D8D96] font-['Manrope']">
                        {owner?.support_whatsapp ? `Connected · ${owner.support_whatsapp}` : 'Connect via Integrations'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#25D366] transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                  Connect and manage your WhatsApp Business channel from integrations.
                </p>
              </Link>
            </motion.div>

            <motion.div variants={revealUp}>
              <Link
                to={ROUTES.ownerIntegrations}
                className="group block rounded-2xl border border-[#272839] bg-[#101114] p-5 transition-colors hover:border-[#0088CC]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0088CC]/15">
                      <Send className="h-5 w-5 text-[#0088CC]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-['Sora']">Telegram</p>
                      <p className="mt-1 text-xs text-[#8D8D96] font-['Manrope']">Connect or manage your bot</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#0088CC] transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                  Connect or manage your Telegram bot directly from integrations.
                </p>
              </Link>
            </motion.div>
          </motion.div>

          {/* Billing / Plan Status Card */}
          {billing && (
            <motion.div variants={revealUp} initial="hidden" animate="show" className="mb-8">
              <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${
                billing.status === 'active'
                  ? 'bg-[#0d1f12] border-[#32C382]/30'
                  : billing.isTrialExpired
                  ? 'bg-[#1f0d0d] border-[#F25461]/30'
                  : 'bg-[#1a1500] border-[#EBCF42]/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${billing.status === 'active' ? 'bg-[#32C382]/15' : 'bg-[#EBCF42]/15'}`}>
                    {billing.status === 'active'
                      ? <Crown className="h-5 w-5 text-[#32C382]" />
                      : <CreditCard className="h-5 w-5 text-[#EBCF42]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-['DM_Sans']">
                      {billing.status === 'active'
                        ? `${billing.planDisplayName} Plan — Active`
                        : billing.isTrialExpired
                        ? 'Free Trial Expired'
                        : billing.daysLeftInTrial !== null
                        ? `Free Trial — ${billing.daysLeftInTrial} day${billing.daysLeftInTrial !== 1 ? 's' : ''} remaining`
                        : 'Free Trial — Active'}
                    </p>
                    <p className="text-xs text-[#8D8D96]">
                      {billing.status === 'active'
                        ? `Renews ${billing.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}`
                        : billing.isTrialExpired
                        ? 'Choose a plan to restore full access'
                        : `Trial ends ${billing.trialEndsAt ? new Date(billing.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}`}
                    </p>
                  </div>
                </div>
                {billing.status !== 'active' && (
                  <Link
                    to={ROUTES.ownerBilling}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-[#2251E3] text-white hover:bg-[#4E79FF] transition-all shrink-0"
                  >
                    {billing.isTrialExpired ? 'Choose Plan' : 'View Plans'}
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left Column: Recent Activity */}
            <div className="lg:col-span-8 space-y-8 h-full">
              {showChartInLeft ? (

              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-[#101114] p-8 rounded-xl shadow-sm border border-[#272839]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                  <div>
                    <h2 className="font-['Sora'] text-xl font-bold text-white">Rent Collection</h2>
                    <p className="text-sm text-[#8D8D96] font-['Manrope']">
                      {chartView === 'monthly' ? 'Monthly collection trends' : 'Quarterly collection totals'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setChartView('monthly')}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${chartView === 'monthly' ? 'bg-[#4E79FF] text-white' : 'bg-white/8 hover:bg-white/12 text-[#8D8D96] border border-[#272839]'}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('quarterly')}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${chartView === 'quarterly' ? 'bg-[#4E79FF] text-white' : 'bg-white/8 hover:bg-white/12 text-[#8D8D96] border border-[#272839]'}`}
                    >
                      Quarterly
                    </button>
                  </div>
                </div>
                {/* CSS Bar Chart */}
                {chartBars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-[#8D8D96]">
                    <TrendingUp className="w-10 h-10 text-[#4E79FF]/45 mb-3" />
                    <p className="text-sm font-['Manrope'] font-medium">No collection data yet</p>
                    <p className="text-xs mt-1">Chart will populate once rent payments are recorded</p>
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-4 px-2">
                    {(chartView === 'monthly' ? chartBars : quarterlyBars).map((bar) => (
                      <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                        {/* Fixed-height bar container — percentage height works reliably here */}
                        <div className="relative w-full" style={{ height: '200px' }}>
                          <div
                            className={`absolute bottom-0 left-0 right-0 ${bar.opacity} rounded-t-lg group transition-all duration-500`}
                            style={{ height: `${Math.max(bar.pct, 4)}%` }}
                          >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06070B] border border-[#272839] text-white text-[10px] py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-[180px]">
                              {(() => {
                                const [titleLabel, ...titleRest] = bar.tooltipTitle.split(': ')
                                const titleValue = titleRest.join(': ')
                                return (
                                  <div className="leading-4">
                                    <div className="text-[#C0C0C5]">{titleLabel}</div>
                                    {titleValue ? <div className="font-semibold text-white">{titleValue}</div> : null}
                                  </div>
                                )
                              })()}
                              {bar.tooltipLines?.length ? (
                                <div className="mt-2 space-y-1 leading-4">
                                  {bar.tooltipLines.map((line) => {
                                    const [name, ...rest] = line.split(': ')
                                    const amount = rest.join(': ')
                                    return (
                                      <div key={line} className="break-words">
                                        <div className="text-[#8D8D96]">{name}</div>
                                        <div className="font-semibold text-white">{amount || line}</div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#8D8D96] uppercase">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
              ) : null}


              {/* Recent Activity */}
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-[#101114] rounded-xl shadow-sm overflow-hidden border border-[#272839] h-full flex flex-col"
              >
                <div className="p-6 border-b border-[#272839] flex items-center justify-between">
                  <h2 className="font-['Sora'] text-xl font-bold text-white">Recent Activity</h2>
                  <Link to={ROUTES.ownerTenants} className="text-[#4E79FF] font-bold text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-[#272839]">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const timeAgo = getTimeAgoString(notif.created_at)
                      const icon = (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-white/8 text-[#8D8D96]' : 'bg-[#4E79FF]/15 text-[#4E79FF]'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                      )
                      return (
                        <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-[#141519] transition-colors">
                          {icon}
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-white font-['Manrope'] text-sm">{notif.title}</p>
                              <span className="text-xs text-[#8D8D96] shrink-0">{timeAgo}</span>
                            </div>
                            <p className="text-sm text-[#8D8D96] font-['Manrope'] mt-1">{notif.message}</p>
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
                        <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-[#141519] transition-colors">
                          {icon}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-white font-['Manrope'] text-sm">{title}</p>
                              <span className="text-xs text-[#8D8D96]">{timeAgo}</span>
                            </div>
                            <p className="text-sm text-[#8D8D96] font-['Manrope'] mt-1">{description}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-[#8D8D96] font-['Manrope'] text-sm">
                      No recent activity yet.
                    </div>
                  )}
                </div>

                {/* Unread notifications banner inside activity section */}
                {summary.unread_notifications > 0 && (
                  <div className="flex items-center justify-between p-5 border-t border-[#272839] bg-[#141519]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4E79FF]">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {summary.unread_notifications} unread notification{summary.unread_notifications !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-[#8D8D96]">Awaiting your review</p>
                      </div>
                    </div>
                    <Link
                      to={ROUTES.ownerNotifications}
                      className="flex items-center gap-2 rounded-lg bg-[#4E79FF] px-4 py-2 text-sm font-bold text-white hover:bg-[#3E68EE] active:scale-95 transition-all"
                    >
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Payment Overview */}
            <div className="lg:col-span-4 space-y-8 h-full">
              <motion.div
                variants={revealUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="bg-[#101114] p-6 rounded-xl shadow-sm border border-[#272839] h-full"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-['Sora'] text-lg font-bold text-white">Payment Overview</h3>
                    <p className="text-xs text-[#8D8D96]">Current month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-[#8D8D96]">Pending</p>
                    <p className="text-lg font-bold text-[#F25461]">
                      {formatCurrency(rentStats.pending, owner?.organization?.currency_code)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div
                    className="relative h-24 w-24 rounded-full"
                    style={{
                      background: `conic-gradient(#4E79FF ${rentProgressClamped}%, #1F2430 0)`,
                    }}
                  >
                    <div className="absolute inset-2 rounded-full bg-[#101114] flex items-center justify-center text-xs font-bold text-white">
                      {rentProgressClamped}%
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#8D8D96]">Received</p>
                      <p className="text-base font-bold text-white">
                        {formatCurrency(rentStats.totalPaid, owner?.organization?.currency_code)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#8D8D96]">Total Due</p>
                      <p className="text-base font-bold text-white">
                        {formatCurrency(rentStats.totalDue, owner?.organization?.currency_code)}
                      </p>
                    </div>
                    <p className="text-xs text-[#8D8D96]">{rentStats.tenantCount} tenants</p>
                  </div>
                </div>
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
              <h3 className="font-['Sora'] text-2xl font-bold text-white">Awaiting approvals</h3>
              <p className="text-sm text-[#8D8D96]">
                Review resident rent payment confirmations pending your verification.
              </p>
            </div>
            {approvals.length > 0 && (
              <span className="rounded bg-[#EBCF42]/15 px-2 py-1 text-[10px] font-bold uppercase text-[#EBCF42]">
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
                      <p className="font-medium text-white">{approval.tenants?.full_name ?? '-'}</p>
                      <p className="text-xs text-[#8D8D96]">{approval.tenants?.tenant_access_id ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-[#C0C0C5]">
                      {approval.properties?.property_name ?? '-'}
                      {approval.properties?.unit_number ? ` (${approval.properties.unit_number})` : ''}
                    </td>
                    <td className="px-4 py-3 text-[#C0C0C5]">{formatDate(approval.due_date)}</td>
                    <td className="px-4 py-3 font-bold text-white">
                      {formatCurrency(approval.amount_paid, owner?.organization?.currency_code)}
                    </td>
                    <td className="px-4 py-3 text-[#8D8D96]">{formatDateTime(approval.created_at)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={approval.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[260px] flex-col gap-2">
                        <input
                          className="w-full rounded-lg border border-[#272839] bg-[#06070B] px-3 py-2 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:ring-2 focus:ring-[#4E79FF] transition-all font-['Manrope']"
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
                          <button
                            type="button"
                            disabled={reviewingApprovalId === approval.id}
                            onClick={() => void handleReviewApproval(approval.id, 'approve')}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#4E79FF] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[#3E68EE] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans']"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewingApprovalId === approval.id}
                            onClick={() => void handleReviewApproval(approval.id, 'reject')}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#272839] bg-[#141519] px-3 py-2 text-xs font-bold text-[#F25461] transition-all hover:border-[#F25461]/40 hover:bg-[#F25461]/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans']"
                          >
                            Reject
                          </button>
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


