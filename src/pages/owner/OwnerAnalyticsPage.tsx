import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { OwnerSummary, RentLedgerEntry } from '../../types/api'
import { formatCurrency } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

type ChartBar = {
  label: string
  pct: number
  opacity: string
  tooltipTitle: string
  tooltipLines?: string[]
}

type PendingTenant = {
  tenantId: string
  tenantName: string
  pendingAmount: number
  propertyLabel: string
}

type AnalyticsState = {
  monthlyBars: ChartBar[]
  quarterlyBars: ChartBar[]
  totalDue: number
  totalPaid: number
  pendingAmount: number
  collectionRate: number
  overdueAmount: number
  topPendingTenants: PendingTenant[]
}

const emptyAnalyticsState: AnalyticsState = {
  monthlyBars: [],
  quarterlyBars: [],
  totalDue: 0,
  totalPaid: 0,
  pendingAmount: 0,
  collectionRate: 0,
  overdueAmount: 0,
  topPendingTenants: [],
}

function buildPropertyLabel(entry: RentLedgerEntry) {
  if (entry.property_name && entry.unit_number) {
    return `${entry.property_name} (${entry.unit_number})`
  }
  return entry.property_name || entry.unit_number || 'Property unavailable'
}

export function OwnerAnalyticsPage() {
  const { token, owner } = useOwnerAuth()
  const displayYear = new Date().getFullYear()
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly')
  const [analytics, setAnalytics] = useState<AnalyticsState>(emptyAnalyticsState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      setLoading(true)

      const [ledgerResponse, summaryResponse] = await Promise.all([
        api.getOwnerRentLedger(token),
        api.getOwnerSummary(token),
      ])

      const entries = ledgerResponse.entries ?? []
      const summary: OwnerSummary | null = summaryResponse.summary ?? null
      const currencyCode = owner?.organization?.currency_code
      const opacityLevels = ['bg-[#4E79FF]/25', 'bg-[#4E79FF]/40', 'bg-[#4E79FF]/55', 'bg-[#4E79FF]/75', 'bg-[#4E79FF]']
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      const monthTotals = new Map<string, { year: number; month: number; total: number; byTenant: Map<string, { name: string; amount: number }> }>()
      const pendingByTenant = new Map<string, PendingTenant>()
      let totalDue = 0
      let totalPaid = 0
      let pendingAmount = 0

      for (const entry of entries) {
        totalDue += entry.amount_due
        totalPaid += entry.amount_paid

        const key = `${entry.cycle_year}-${String(entry.cycle_month).padStart(2, '0')}`
        const tenantLabel = entry.tenant_name || entry.tenant_access_id || 'Tenant'
        const existingMonth = monthTotals.get(key)

        if (existingMonth) {
          existingMonth.total += entry.amount_paid
          const existingTenant = existingMonth.byTenant.get(tenantLabel)
          if (existingTenant) {
            existingTenant.amount += entry.amount_paid
          } else {
            existingMonth.byTenant.set(tenantLabel, { name: tenantLabel, amount: entry.amount_paid })
          }
        } else {
          monthTotals.set(key, {
            year: entry.cycle_year,
            month: entry.cycle_month,
            total: entry.amount_paid,
            byTenant: new Map([[tenantLabel, { name: tenantLabel, amount: entry.amount_paid }]]),
          })
        }

        if (entry.cycle_year === currentYear && entry.cycle_month === currentMonth) {
          const outstanding = Math.max(0, entry.amount_due - entry.amount_paid)
          pendingAmount += outstanding

          if (outstanding > 0) {
            const existingPending = pendingByTenant.get(entry.tenant_id)
            if (existingPending) {
              existingPending.pendingAmount += outstanding
            } else {
              pendingByTenant.set(entry.tenant_id, {
                tenantId: entry.tenant_id,
                tenantName: tenantLabel,
                pendingAmount: outstanding,
                propertyLabel: buildPropertyLabel(entry),
              })
            }
          }
        }
      }

      const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`
      const monthIndex = new Map(monthTotals.entries())
      const windowedMonths: Array<{
        year: number
        month: number
        total: number
        byTenant: Map<string, { name: string; amount: number }>
      }> = []

      for (let month = 1; month <= 12; month += 1) {
        const key = monthKey(currentYear, month)
        const existing = monthIndex.get(key)
        if (existing) {
          windowedMonths.push(existing)
        } else {
          windowedMonths.push({
            year: currentYear,
            month,
            total: 0,
            byTenant: new Map<string, { name: string; amount: number }>(),
          })
        }
      }

      const maxAmount = Math.max(...windowedMonths.map(item => item.total), 1)
      const monthlyBars = windowedMonths.map(item => {
        const pct = Math.min(100, (item.total / maxAmount) * 100)
        const opacityIndex = Math.floor((pct / 100) * (opacityLevels.length - 1))
        const breakdown = [...item.byTenant.values()].sort((a, b) => b.amount - a.amount)
        const capped = breakdown.slice(0, 4)
        const tooltipLines = capped.map(line => `${line.name}: ${formatCurrency(line.amount, currencyCode)}`)
        if (breakdown.length > capped.length) {
          tooltipLines.push(`+${breakdown.length - capped.length} more`)
        }

        return {
          label: monthNames[item.month - 1] ?? 'N/A',
          pct,
          opacity: opacityLevels[opacityIndex],
          tooltipTitle: item.total > 0
            ? `Total: ${formatCurrency(item.total, currencyCode)}`
            : 'No payments yet',
          tooltipLines: item.total > 0 ? tooltipLines : undefined,
        }
      })

      const quarterBuckets: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
      for (const entry of entries) {
        const quarter = entry.cycle_month <= 3 ? 'Q1' : entry.cycle_month <= 6 ? 'Q2' : entry.cycle_month <= 9 ? 'Q3' : 'Q4'
        quarterBuckets[quarter] += entry.amount_paid
      }
      const maxQuarterAmount = Math.max(...Object.values(quarterBuckets), 1)
      const quarterlyBars = Object.entries(quarterBuckets).map(([label, amount]) => {
        const pct = Math.min(100, (amount / maxQuarterAmount) * 100)
        const opacityIndex = Math.floor((pct / 100) * (opacityLevels.length - 1))
        return {
          label,
          pct,
          opacity: opacityLevels[opacityIndex],
          tooltipTitle: formatCurrency(amount, currencyCode),
        }
      })

      const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0
      const topPendingTenants = [...pendingByTenant.values()]
        .sort((a, b) => b.pendingAmount - a.pendingAmount)
        .slice(0, 5)

      setAnalytics({
        monthlyBars,
        quarterlyBars,
        totalDue,
        totalPaid,
        pendingAmount,
        collectionRate: Math.min(100, Math.max(0, collectionRate)),
        overdueAmount: summary?.overdue_rent ?? 0,
        topPendingTenants,
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [owner?.organization?.currency_code, token])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const bars = chartView === 'monthly' ? analytics.monthlyBars : analytics.quarterlyBars
  const currencyCode = owner?.organization?.currency_code

  return (
    <div className="p-6 w-full bg-[#06070B] min-h-screen text-white">
      <motion.div
        variants={revealUp}
        initial="hidden"
        animate="show"
        className="mb-8 px-2"
      >
        <h1 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">Analytics</h1>
        <p className="font-['Manrope'] text-[#8D8D96] font-medium mt-1">
          Track rent collection trends across your portfolio.
        </p>
      </motion.div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading analytics..." rows={6} /> : null}

      {!loading ? (
        <div className="space-y-8">
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {[
              {
                title: 'Collection Rate',
                value: `${analytics.collectionRate}%`,
                hint: `${formatCurrency(analytics.totalPaid, currencyCode)} received`,
                icon: <TrendingUp className="h-5 w-5" />,
                tone: 'text-[#4E79FF] bg-[#4E79FF]/15',
              },
              {
                title: 'Total Received',
                value: formatCurrency(analytics.totalPaid, currencyCode),
                hint: `Out of ${formatCurrency(analytics.totalDue, currencyCode)}`,
                icon: <Wallet className="h-5 w-5" />,
                tone: 'text-[#32C382] bg-[#32C382]/15',
              },
              {
                title: 'Pending This Month',
                value: formatCurrency(analytics.pendingAmount, currencyCode),
                hint: analytics.topPendingTenants.length > 0 ? `${analytics.topPendingTenants.length} tenants pending` : 'No current pending amount',
                icon: <ArrowUpRight className="h-5 w-5" />,
                tone: 'text-[#EBCF42] bg-[#EBCF42]/15',
              },
              {
                title: 'Overdue Rent',
                value: formatCurrency(analytics.overdueAmount, currencyCode),
                hint: analytics.overdueAmount > 0 ? 'Needs follow-up' : 'No overdue balance',
                icon: <AlertTriangle className="h-5 w-5" />,
                tone: 'text-[#F25461] bg-[#F25461]/15',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={revealUp}
                whileInView="show"
                viewport={viewportOnce}
                className="bg-[#101114] border border-[#272839] rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.tone}`}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#8D8D96]">Important</span>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-[#8D8D96]">{card.title}</p>
                <p className="mt-2 font-['Sora'] text-3xl font-extrabold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-[#8D8D96]">{card.hint}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)] gap-8">
            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="w-full bg-[#101114] p-6 md:p-8 rounded-xl shadow-sm border border-[#272839]"
            >
              <div className="mb-8">
                <p className="font-['Sora'] text-xs font-bold uppercase tracking-widest text-[#8D8D96] mb-6">Analytics</p>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h2 className="font-['Sora'] text-[2rem] leading-[1.05] font-bold text-white">Rent Collection</h2>
                    <p className="text-sm text-[#8D8D96] font-['Manrope'] mt-2">
                      {chartView === 'monthly' ? `Monthly collection trends for ${displayYear}` : 'Quarterly collection totals'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => setChartView('monthly')}
                      className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${chartView === 'monthly' ? 'bg-[#4E79FF] text-white' : 'bg-white/8 hover:bg-white/12 text-[#8D8D96] border border-[#272839]'}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('quarterly')}
                      className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${chartView === 'quarterly' ? 'bg-[#4E79FF] text-white' : 'bg-white/8 hover:bg-white/12 text-[#8D8D96] border border-[#272839]'}`}
                    >
                      Quarterly
                    </button>
                  </div>
                </div>
              </div>

              {bars.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-72 text-center text-[#8D8D96]">
                  <TrendingUp className="w-10 h-10 text-[#4E79FF]/45 mb-4" />
                  <p className="text-2xl font-['Manrope'] font-medium">No collection data yet</p>
                  <p className="text-sm mt-2">Chart will populate once rent payments are recorded</p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 md:gap-3 px-1 overflow-x-auto pb-2">
                  {bars.map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center gap-3 flex-1 min-w-[54px] md:min-w-[64px]">
                      <div className="relative w-full" style={{ height: chartView === 'monthly' ? '280px' : '240px' }}>
                        <div
                          className={`absolute bottom-0 left-0 right-0 ${bar.opacity} rounded-t-xl group transition-all duration-500`}
                          style={{ height: `${Math.max(bar.pct, 4)}%` }}
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06070B] border border-[#272839] text-white text-[10px] py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-[190px]">
                            <div className="leading-4">
                              <div className="text-[#C0C0C5]">{bar.tooltipTitle.split(': ')[0]}</div>
                              {bar.tooltipTitle.includes(': ') ? (
                                <div className="font-semibold text-white">{bar.tooltipTitle.split(': ').slice(1).join(': ')}</div>
                              ) : null}
                            </div>
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

            <motion.div
              variants={revealUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="bg-[#101114] border border-[#272839] rounded-xl p-6"
            >
              <div className="mb-6">
                <p className="font-['Sora'] text-xs font-bold uppercase tracking-widest text-[#8D8D96] mb-3">Action List</p>
                <h3 className="font-['Sora'] text-2xl font-bold text-white">Top Pending Tenants</h3>
                <p className="text-sm text-[#8D8D96] mt-2">The highest unpaid balances for the current month.</p>
              </div>

              {analytics.topPendingTenants.length === 0 ? (
                <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-[#272839] text-center text-[#8D8D96]">
                  <div>
                    <p className="font-medium text-white">No pending tenants</p>
                    <p className="mt-1 text-sm">Everyone is clear for the current month.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topPendingTenants.map((tenant, index) => (
                    <div
                      key={tenant.tenantId}
                      className="flex items-start justify-between gap-4 rounded-xl border border-[#272839] bg-[#141519] px-4 py-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4E79FF]/15 text-[11px] font-bold text-[#4E79FF]">
                            {index + 1}
                          </span>
                          <p className="truncate font-semibold text-white">{tenant.tenantName}</p>
                        </div>
                        <p className="mt-2 text-sm text-[#8D8D96]">{tenant.propertyLabel}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-widest text-[#8D8D96]">Pending</p>
                        <p className="mt-1 font-bold text-[#F25461]">
                          {formatCurrency(tenant.pendingAmount, currencyCode)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
