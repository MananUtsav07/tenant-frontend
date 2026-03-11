import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { TicketTable } from '../../components/common/TicketTable'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import type { TenantTicket } from '../../types/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/date'

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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Tenant Detail</h2>
          <p className="text-sm text-slate-400">Lease, ticket and reminder details for this tenant.</p>
        </div>
        <Button
          to="/owner/tenants"
          variant="outline"
          size="sm"
          className="border-slate-300 bg-white text-slate-700"
          iconLeft={<ArrowLeft className="h-4 w-4" />}
        >
          Back to tenants
        </Button>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading tenant detail..." rows={5} /> : null}

      {!loading && detail ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <p className="text-lg font-semibold text-slate-900">{detail.tenant.full_name}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400">Tenant Access ID</p>
                <p className="text-sm text-slate-800">{detail.tenant.tenant_access_id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Rent</p>
                <p className="text-sm text-slate-800">
                  {formatCurrency(detail.tenant.monthly_rent, owner?.organization?.currency_code)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Payment Status</p>
                <StatusBadge status={detail.tenant.payment_status} />
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Lease</p>
                <p className="text-sm text-slate-800">
                  {formatDate(detail.tenant.lease_start_date)} - {formatDate(detail.tenant.lease_end_date)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Property</p>
                <p className="inline-flex items-center gap-2 text-sm text-slate-800">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  {detail.tenant.properties?.property_name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Address</p>
                <p className="text-sm text-slate-800">{detail.tenant.properties?.address || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Email</p>
                <p className="inline-flex items-center gap-2 text-sm text-slate-800">
                  <Mail className="h-4 w-4 text-blue-600" />
                  {tenantContact.email}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Phone</p>
                <p className="inline-flex items-center gap-2 text-sm text-slate-800">
                  <Phone className="h-4 w-4 text-blue-600" />
                  {tenantContact.phone}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Support Tickets</h3>
            {detail.tickets.length === 0 ? (
              <EmptyState
                title="No tickets"
                description="Tenant has not raised any support tickets yet."
              />
            ) : (
              <TicketTable tickets={detail.tickets} />
            )}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Rent Reminders</h3>
            {detail.reminders.length === 0 ? (
              <EmptyState title="No reminders" description="Run reminder processing from owner dashboard." />
            ) : (
              <DataTable headers={['Type', 'Scheduled For', 'Status', 'Sent At']}>
                {detail.reminders.map((reminder) => (
                  <tr key={reminder.id}>
                    <td className="px-4 py-3 text-slate-800">{reminder.reminder_type.replaceAll('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(reminder.scheduled_for)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reminder.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(reminder.sent_at)}</td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}





