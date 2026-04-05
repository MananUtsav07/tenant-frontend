import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Calendar, CreditCard, Hash, Home, Mail, Phone, User } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketTable } from '../../components/common/TicketTable'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TenantTicket } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'
import { revealUp, staggerParent, viewportOnce } from '../../utils/motion'

function getNextDueDate(dayOfMonth: number, now = new Date()): Date {
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()
  const daysInCurrentMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate()
  const safeDayCurrentMonth = Math.max(1, Math.min(dayOfMonth, daysInCurrentMonth))
  const currentCandidate = new Date(Date.UTC(currentYear, currentMonth, safeDayCurrentMonth, 9, 0, 0, 0))

  if (currentCandidate >= now) {
    return currentCandidate
  }

  const nextMonthDate = new Date(Date.UTC(currentYear, currentMonth + 1, 1, 9, 0, 0, 0))
  const nextYear = nextMonthDate.getUTCFullYear()
  const nextMonth = nextMonthDate.getUTCMonth()
  const daysInNextMonth = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate()
  const safeDayNextMonth = Math.max(1, Math.min(dayOfMonth, daysInNextMonth))
  return new Date(Date.UTC(nextYear, nextMonth, safeDayNextMonth, 9, 0, 0, 0))
}

type TenantDetailResponse = {
  tenant: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    tenant_access_id: string
    lease_start_date: string | null
    lease_end_date: string | null
    monthly_rent: number
    payment_due_day: number
    payment_status: string
    status: string
    properties?: {
      property_name: string
      address: string
      unit_number: string | null
    }
  }
  tickets: TenantTicket[]
  reminders: Array<{
    id: string
    reminder_type: string
    scheduled_for: string
    sent_at: string | null
    status: string
  }>
}

function InfoField({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-[#8D8D96] font-['DM_Sans']">{label}</p>
      <div className="flex items-center gap-2 text-sm font-medium text-white font-['Manrope']">
        {icon ? <span className="text-[#4E79FF] shrink-0">{icon}</span> : null}
        {value}
      </div>
    </div>
  )
}

export function OwnerTenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token, owner } = useOwnerAuth()
  const [detail, setDetail] = useState<TenantDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!token || !id) return
    try {
      setError(null)
      const response = await api.getOwnerTenantDetail(token, id)
      setDetail({ tenant: response.tenant, tickets: response.tickets, reminders: response.reminders })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { void loadDetail() }, [loadDetail])

  const tenantContact = useMemo(
    () => ({ email: detail?.tenant.email || '-', phone: detail?.tenant.phone || '-' }),
    [detail],
  )

  const leaseRange = useMemo(() => {
    if (!detail) return '-'
    const start = detail.tenant.lease_start_date
    const end = detail.tenant.lease_end_date
    if (!start && !end) return '-'
    return `${formatDate(start)} → ${formatDate(end)}`
  }, [detail])

  return (
    <div className="space-y-8 p-6 w-full bg-[#06070B] min-h-screen">
      {/* Header */}
      <motion.div variants={revealUp} initial="hidden" animate="show" className="flex items-center justify-between">
        <div>
          <h1 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">Tenant Detail</h1>
          <p className="font-['Manrope'] text-[#8D8D96] font-medium mt-1">
            Lease, ticket and reminder details for this tenant.
          </p>
        </div>
        <Button
          to={ROUTES.ownerTenants}
          variant="outline"
          size="sm"
          iconLeft={<ArrowLeft className="h-4 w-4" />}
          className="border-[#272839] bg-[#101114] text-[#8D8D96] hover:text-white hover:border-[#4E79FF]/40"
        >
          Back to tenants
        </Button>
      </motion.div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant detail..." rows={5} /> : null}

      {!loading && detail ? (
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-8">

          {/* Tenant Info Card */}
          <motion.div
            variants={revealUp}
            whileInView="show"
            viewport={viewportOnce}
            className="bg-[#101114] rounded-xl border border-[#272839] p-8"
          >
            {/* Name + status row */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#4E79FF]/15 flex items-center justify-center text-[#4E79FF] shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-['Sora'] text-2xl font-bold text-white">{detail.tenant.full_name}</h2>
                  <p className="text-sm text-[#8D8D96] font-['Manrope'] mt-0.5">{detail.tenant.tenant_access_id}</p>
                </div>
              </div>
              <StatusBadge status={detail.tenant.payment_status} />
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoField
                label="Monthly Rent"
                icon={<CreditCard className="w-4 h-4" />}
                value={formatCurrency(detail.tenant.monthly_rent, owner?.organization?.currency_code)}
              />
              <InfoField
                label="Next Due Date"
                icon={<Calendar className="w-4 h-4" />}
                value={formatDate(getNextDueDate(detail.tenant.payment_due_day).toISOString())}
              />
              <InfoField
                label="Lease Period"
                icon={<Calendar className="w-4 h-4" />}
                value={leaseRange}
              />
              <InfoField
                label="Property"
                icon={<Building2 className="w-4 h-4" />}
                value={detail.tenant.properties?.property_name || '-'}
              />
              <InfoField
                label="Unit"
                icon={<Hash className="w-4 h-4" />}
                value={detail.tenant.properties?.unit_number || '-'}
              />
              <InfoField
                label="Address"
                icon={<Home className="w-4 h-4" />}
                value={detail.tenant.properties?.address || '-'}
              />
              <InfoField
                label="Email"
                icon={<Mail className="w-4 h-4" />}
                value={tenantContact.email}
              />
              <InfoField
                label="Phone"
                icon={<Phone className="w-4 h-4" />}
                value={tenantContact.phone}
              />
            </div>
          </motion.div>

          {/* Support Tickets */}
          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce}>
            <h3 className="font-['Sora'] text-xl font-bold text-white mb-4">Support Tickets</h3>
            {detail.tickets.length === 0 ? (
              <EmptyState title="No tickets" description="Tenant has not raised any support tickets yet." />
            ) : (
              <TicketTable tickets={detail.tickets} />
            )}
          </motion.div>

          {/* Rent Reminders */}
          <motion.div variants={revealUp} whileInView="show" viewport={viewportOnce}>
            <h3 className="font-['Sora'] text-xl font-bold text-white mb-4">Rent Reminders</h3>
            {detail.reminders.length === 0 ? (
              <EmptyState title="No reminders" description="Run reminder processing from owner dashboard." />
            ) : (
              <div className="bg-[#101114] rounded-xl border border-[#272839] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#272839]">
                      {['Type', 'Scheduled For', 'Status', 'Sent At'].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-widest font-semibold text-[#8D8D96] font-['DM_Sans']">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272839]">
                    {detail.reminders.map((reminder) => (
                      <tr key={reminder.id} className="hover:bg-[#141519] transition-colors">
                        <td className="px-5 py-4 font-medium text-white font-['Manrope'] capitalize">
                          {reminder.reminder_type.replaceAll('_', ' ')}
                        </td>
                        <td className="px-5 py-4 text-[#8D8D96] font-['Manrope']">
                          {formatDateTime(reminder.scheduled_for)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={reminder.status} />
                        </td>
                        <td className="px-5 py-4 text-[#8D8D96] font-['Manrope']">
                          {reminder.sent_at ? formatDateTime(reminder.sent_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </motion.div>
      ) : null}
    </div>
  )
}
