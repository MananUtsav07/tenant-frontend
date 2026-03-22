import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { ConditionReportOwnerPanel } from '../../components/condition-reports/ConditionReportOwnerPanel'
import { DataTable } from '../../components/common/DataTable'
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

export function OwnerTenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token, owner } = useOwnerAuth()
  const [detail, setDetail] = useState<TenantDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!token || !id) {
      return
    }

    try {
      setError(null)
      const response = await api.getOwnerTenantDetail(token, id)
      setDetail({
        tenant: response.tenant,
        tickets: response.tickets,
        reminders: response.reminders,
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const tenantContact = useMemo(
    () => ({
      email: detail?.tenant.email || '-',
      phone: detail?.tenant.phone || '-',
    }),
    [detail],
  )

  return (
    <section className="ph-page-shell">
      <div className="ph-surface-card-strong rounded-xl p-6 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="ph-page-heading">Tenant detail</h2>
            <p className="ph-page-description">
              Lease, rent, support, and reminder history for this resident in one structured owner view.
            </p>
          </div>
        <Button
            to={ROUTES.ownerTenants}
          variant="outline"
          size="sm"
          iconLeft={<ArrowLeft className="h-4 w-4" />}
        >
          Back to tenants
        </Button>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant detail..." rows={5} /> : null}

      {!loading && detail ? (
        <>
          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1cb85]">Resident Overview</p>
                <h3 className="ph-title mt-3 text-2xl font-semibold text-[var(--ph-text)]">{detail.tenant.full_name}</h3>
                <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                  Access ID {detail.tenant.tenant_access_id} with current property, lease, and billing posture.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={detail.tenant.payment_status} />
                <StatusBadge status={detail.tenant.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Monthly rent</p>
                <p className="mt-2 text-sm font-medium text-[var(--ph-text)]">
                  {formatCurrency(detail.tenant.monthly_rent, owner?.organization?.currency_code)}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Next due date</p>
                <p className="mt-2 text-sm font-medium text-[var(--ph-text)]">
                  {formatDate(getNextDueDate(detail.tenant.payment_due_day).toISOString())}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Lease term</p>
                <p className="mt-2 text-sm font-medium text-[var(--ph-text)]">
                  {formatDate(detail.tenant.lease_start_date)} - {formatDate(detail.tenant.lease_end_date)}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Property</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--ph-text)]">
                  <Building2 className="h-4 w-4 text-[var(--ph-accent)]" />
                  {detail.tenant.properties?.property_name || '-'}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Address</p>
                <p className="mt-2 text-sm font-medium text-[var(--ph-text)]">{detail.tenant.properties?.address || '-'}</p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Email</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--ph-text)]">
                  <Mail className="h-4 w-4 text-[var(--ph-accent)]" />
                  {tenantContact.email}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Phone</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--ph-text)]">
                  <Phone className="h-4 w-4 text-[var(--ph-accent)]" />
                  {tenantContact.phone}
                </p>
              </div>
              <div className="rounded-lg border border-[rgba(83,88,100,0.34)] bg-white/[0.025] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ph-text-muted)]">Unit</p>
                <p className="mt-2 text-sm font-medium text-[var(--ph-text)]">{detail.tenant.properties?.unit_number || '-'}</p>
              </div>
            </div>
          </article>

          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <div className="ph-page-header">
              <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Ticket history</h3>
              <p className="text-sm text-[var(--ph-text-muted)]">All tickets raised by this tenant remain visible here without changing the existing support flow.</p>
            </div>
            <div className="mt-5">
              {detail.tickets.length === 0 ? (
                <EmptyState title="No tickets" description="Tenant has not raised any support tickets yet." />
              ) : (
                <TicketTable tickets={detail.tickets} />
              )}
            </div>
          </article>

          <article className="ph-surface-card rounded-xl p-5 sm:p-6">
            <div className="ph-page-header">
              <h3 className="ph-title text-xl font-semibold text-[var(--ph-text)]">Rent reminders</h3>
              <p className="text-sm text-[var(--ph-text-muted)]">Scheduled reminder entries tied to this tenant’s rent cycle.</p>
            </div>
            <div className="mt-5">
              {detail.reminders.length === 0 ? (
                <EmptyState title="No reminders" description="Run reminder processing from owner dashboard." />
              ) : (
                <DataTable headers={['Type', 'Scheduled For', 'Status', 'Sent At']}>
                  {detail.reminders.map((reminder) => (
                    <tr key={reminder.id}>
                      <td className="px-4 py-3 text-[var(--ph-text)]">{reminder.reminder_type.replaceAll('_', ' ')}</td>
                      <td className="px-4 py-3 text-[var(--ph-text-soft)]">{formatDateTime(reminder.scheduled_for)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reminder.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(reminder.sent_at)}</td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </div>
          </article>

          {token ? <ConditionReportOwnerPanel token={token} tenantId={detail.tenant.id} tenantName={detail.tenant.full_name} /> : null}
        </>
      ) : null}
    </section>
  )
}





