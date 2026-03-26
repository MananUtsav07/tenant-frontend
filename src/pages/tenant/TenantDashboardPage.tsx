import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Ticket,
  Wrench,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ConditionReportTenantPanel } from '../../components/condition-reports/ConditionReportTenantPanel'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { OrganizationBadge } from '../../components/common/OrganizationBadge'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type {
  Property,
  Tenant,
  TenantLeaseRenewalIntentState,
  TenantRentPaymentState,
  TenantSummary,
} from '../../types/api'
import { formatCurrency, formatDate } from '../../utils/date'

export function TenantDashboardPage() {
  const { token, tenant: authTenant } = useTenantAuth()
  const [summary, setSummary] = useState<TenantSummary | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [rentPaymentState, setRentPaymentState] = useState<TenantRentPaymentState | null>(null)
  const [, setLeaseRenewalIntentState] = useState<TenantLeaseRenewalIntentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setError(null)
      const [summaryResponse, propertyResponse] = await Promise.all([
        api.getTenantSummary(token),
        api.getTenantProperty(token),
      ])
      setSummary(summaryResponse.summary)
      setProperty(propertyResponse.property)
      setTenant(propertyResponse.tenant)

      try {
        const rentPaymentResponse = await api.getTenantRentPaymentState(token)
        setRentPaymentState(rentPaymentResponse.state)
      } catch (rentPaymentError) {
        if (rentPaymentError instanceof Error && rentPaymentError.message.toLowerCase().includes('route not found')) {
          setRentPaymentState(null)
          return
        }
        throw rentPaymentError
      }

      try {
        const leaseRenewalResponse = await api.getTenantLeaseRenewalIntentState(token)
        setLeaseRenewalIntentState(leaseRenewalResponse.state)
      } catch (leaseRenewalError) {
        if (leaseRenewalError instanceof Error && leaseRenewalError.message.toLowerCase().includes('route not found')) {
          setLeaseRenewalIntentState(null)
          return
        }
        throw leaseRenewalError
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tenant dashboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const handleMarkRentPaid = async () => {
    if (!token) {
      return
    }

    try {
      setMarkingPaid(true)
      setError(null)
      await api.markTenantRentPaid(token)
      await loadDashboard()
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Failed to mark rent as paid')
    } finally {
      setMarkingPaid(false)
    }
  }

  const tenantName = tenant?.full_name ?? authTenant?.full_name ?? 'Resident'
  const orgCurrency = authTenant?.organization?.currency_code

  return (
    <div className="min-h-screen bg-[#FEFAEF] p-6 lg:p-8 space-y-6">

      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#92700A] font-[DM_Sans,sans-serif] mb-1">
            Tenant Portal
          </p>
          <h2 className="text-3xl font-extrabold text-[#1A1A1A] font-[Sora,sans-serif]">
            Welcome, {tenantName}
          </h2>
          {property ? (
            <p className="text-[#6B7280] mt-1 font-medium flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 text-[#FED609] fill-[#FED609]" />
              {property.property_name}
              {property.unit_number ? ` — Unit ${property.unit_number}` : ''}
            </p>
          ) : null}
          {authTenant?.organization ? (
            <div className="mt-2">
              <OrganizationBadge name={authTenant.organization.name} slug={authTenant.organization.slug} />
            </div>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void loadDashboard()}
            className="px-4 py-2.5 bg-white border border-[#FFFAE2] rounded-lg shadow-sm font-bold text-sm flex items-center gap-2 hover:bg-[#FFFAE2] transition-colors text-[#1A1A1A]"
          >
            <RefreshCw className="h-4 w-4 text-[#FED609]" />
            Refresh
          </button>
          {summary ? (
            <button className="px-4 py-2.5 bg-white border border-[#FFFAE2] rounded-lg shadow-sm font-bold text-sm flex items-center gap-2 hover:bg-[#FFFAE2] transition-colors text-[#1A1A1A]">
              <CalendarDays className="h-4 w-4 text-[#FED609]" />
              {formatDate(summary.next_due_date)}
            </button>
          ) : null}
        </div>
      </section>

      {/* Error State */}
      {error ? <ErrorState message={error} /> : null}

      {/* Loading State */}
      {loading ? <LoadingState message="Loading tenant dashboard..." rows={5} /> : null}

      {/* Summary Stat Cards */}
      {!loading && summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.06)] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FED609]/10 flex items-center justify-center flex-shrink-0">
              <Ticket className="h-5 w-5 text-[#92700A]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Open Tickets</p>
              <p className="text-2xl font-extrabold text-[#1A1A1A] font-[Sora,sans-serif]">{summary.open_tickets}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.06)] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FED609]/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-[#92700A]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Reminders</p>
              <p className="text-2xl font-extrabold text-[#1A1A1A] font-[Sora,sans-serif]">{summary.pending_reminders}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.06)] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FED609]/10 flex items-center justify-center flex-shrink-0">
              <CircleDollarSign className="h-5 w-5 text-[#92700A]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Monthly Rent</p>
              <p className="text-xl font-extrabold text-[#1A1A1A] font-[Sora,sans-serif] leading-tight">
                {formatCurrency(summary.monthly_rent, orgCurrency)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.06)] p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#FED609]/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-5 w-5 text-[#92700A]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Next Due</p>
              <p className="text-base font-extrabold text-[#1A1A1A] font-[Sora,sans-serif]">{formatDate(summary.next_due_date)}</p>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !summary ? (
        <EmptyState
          title="No dashboard data yet"
          description="Your summary cards will appear once your account details are ready."
          icon={<CalendarDays className="h-5 w-5" />}
        />
      ) : null}

      {/* Main Grid: Property Info + Rent Payment */}
      {!loading && (property || tenant || rentPaymentState) ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Property Info Card */}
          {property || tenant ? (
            <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border-t-4 border-[#FED609] p-6 relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#FFFAE2] rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] font-[Sora,sans-serif] mb-1 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#FED609]" />
                      {property?.property_name ?? 'Your Property'}
                    </h3>
                    {property?.address ? (
                      <p className="text-[#6B7280] text-sm">{property.address}</p>
                    ) : null}
                  </div>
                  {tenant ? (
                    <span className="px-3 py-1 bg-[#FED609]/10 text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#FED609]/20 whitespace-nowrap">
                      Active Lease
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8">
                  {property?.unit_number ? (
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Unit Number</p>
                      <p className="font-bold text-[#1A1A1A]">Unit {property.unit_number}</p>
                    </div>
                  ) : null}
                  {tenant?.payment_status ? (
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Payment Status</p>
                      <StatusBadge status={tenant.payment_status} />
                    </div>
                  ) : null}
                  {tenant?.lease_start_date || tenant?.lease_end_date ? (
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Lease Period</p>
                      <div className="flex items-center gap-2 text-[#1A1A1A] font-bold">
                        <span>{formatDate(tenant?.lease_start_date)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#FED609]" />
                        <span>{formatDate(tenant?.lease_end_date)}</span>
                      </div>
                    </div>
                  ) : null}
                  {summary?.next_due_date ? (
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Next Due Date</p>
                      <p className="font-bold text-[#1A1A1A]">{formatDate(summary.next_due_date)}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">
                    <MessageCircle className="h-4 w-4 fill-white" />
                    WhatsApp Owner
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">
                    <Send className="h-4 w-4" />
                    Telegram
                  </button>
                  <Link
                    to={ROUTES.tenantTickets}
                    className="flex items-center gap-2 px-4 py-2 border border-[#FED609] text-[#1A1A1A] rounded-lg font-bold text-sm hover:bg-[#FFFAE2] transition-colors active:scale-95"
                  >
                    <Ticket className="h-4 w-4 text-[#FED609]" />
                    My Tickets
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {/* Rent Payment Card */}
          <div className={`${property || tenant ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white rounded-xl shadow-sm p-6 flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1A1A1A] font-[Sora,sans-serif]">Rent Payment</h3>
              {rentPaymentState ? (
                <span className={`px-2.5 py-1 text-[10px] font-black rounded-md flex items-center gap-1 uppercase ${
                  rentPaymentState.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : rentPaymentState.status === 'awaiting_owner_approval'
                    ? 'bg-yellow-100 text-yellow-700'
                    : rentPaymentState.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : rentPaymentState.status === 'eligible'
                    ? 'bg-[#FED609]/10 text-[#92700A]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {rentPaymentState.status === 'approved' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : rentPaymentState.status === 'rejected' ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : null}
                  {rentPaymentState.status.replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>

            {rentPaymentState?.is_visible ? (
              <>
                <div className="bg-[#FFFAE2] rounded-xl p-5 mb-6 text-center">
                  <p className="text-[#6B7280] text-xs font-bold mb-1 uppercase tracking-wider">Next Due Amount</p>
                  <p className="text-4xl font-extrabold text-[#1A1A1A] font-[Sora,sans-serif] tracking-tight">
                    {formatCurrency(rentPaymentState.amount_paid, rentPaymentState.currency_code)}
                  </p>
                  <p className="text-[#6B7280] text-sm mt-2">
                    Due: <span className="text-[#1A1A1A] font-bold">{formatDate(rentPaymentState.due_date)}</span>
                  </p>
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-3">Status Details</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[#FFFAE2]">
                      <span className="text-sm font-medium text-[#1A1A1A]">Cycle</span>
                      <span className="text-xs font-bold text-[#6B7280]">
                        {rentPaymentState.cycle_month}/{rentPaymentState.cycle_year}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#FFFAE2]">
                      <span className="text-sm font-medium text-[#1A1A1A]">Window Opens</span>
                      <span className="text-xs font-bold text-[#6B7280]">{formatDate(rentPaymentState.window_starts_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-[#1A1A1A]">Status</span>
                      <StatusBadge status={rentPaymentState.status === 'eligible' ? 'pending' : rentPaymentState.status} />
                    </div>
                  </div>
                </div>

                {rentPaymentState.status === 'eligible' ? (
                  <div className="mt-4">
                    <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                      {markingPaid ? 'Submitting...' : 'Mark Rent as Paid'}
                    </Button>
                  </div>
                ) : null}

                {rentPaymentState.status === 'awaiting_owner_approval' ? (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-700">Waiting for owner verification.</p>
                  </div>
                ) : null}

                {rentPaymentState.status === 'rejected' ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-red-600">Owner rejected this confirmation.</p>
                    {rentPaymentState.rejection_reason ? (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        Reason: {rentPaymentState.rejection_reason}
                      </p>
                    ) : null}
                    <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                      {markingPaid ? 'Resubmitting...' : 'Resubmit Mark as Paid'}
                    </Button>
                  </div>
                ) : null}

                {rentPaymentState.status === 'approved' ? (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Rent payment confirmed for this cycle.</p>
                  </div>
                ) : null}

                <div className="mt-4 p-3 bg-[#FED609]/10 rounded-lg flex items-start gap-3">
                  <Info className="h-4 w-4 text-[#FED609] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight text-[#1A1A1A] font-medium">
                    Mark rent paid from 7 days before due date. Your owner will verify the payment.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#FFFAE2] flex items-center justify-center mb-3">
                  <CircleDollarSign className="h-7 w-7 text-[#FED609]" />
                </div>
                <p className="text-sm font-bold text-[#1A1A1A] mb-1">No active rent cycle</p>
                <p className="text-xs text-[#6B7280]">Rent payment window will appear 7 days before your due date.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Tickets & Quick Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1A1A1A] font-[Sora,sans-serif]">Recent Tickets</h3>
            <Link
              to={ROUTES.tenantTickets}
              className="text-xs font-bold text-[#FED609] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!loading && summary ? (
            <div className="space-y-3 mb-6">
              {summary.open_tickets > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#FEFAEF] hover:border-[#FED609]/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FED609]/10 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-[#92700A]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#FED609] transition-colors">
                        Open Tickets
                      </p>
                      <p className="text-xs text-[#6B7280]">{summary.open_tickets} ticket(s) awaiting response</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-[#FED609]/10 text-[#92700A] text-[10px] font-bold rounded">
                    {summary.open_tickets} Open
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#FEFAEF]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">All Clear</p>
                      <p className="text-xs text-[#6B7280]">No open tickets at the moment</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded">All Good</span>
                </div>
              )}

              {summary.pending_reminders > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-[#FEFAEF] hover:border-[#FED609]/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#FED609] transition-colors">
                        Pending Reminders
                      </p>
                      <p className="text-xs text-[#6B7280]">{summary.pending_reminders} reminder(s) pending</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded">
                    {summary.pending_reminders}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {loading ? <LoadingState message="" rows={2} /> : null}

          <Link
            to={ROUTES.tenantTickets}
            className="w-full py-3 bg-[#FED609] text-[#1A1A1A] font-bold rounded-lg shadow-sm hover:bg-[#FFD70B] transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create New Ticket
          </Link>
        </div>

        {/* Quick Support */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#1A1A1A] font-[Sora,sans-serif] mb-6">Quick Support</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center gap-3 p-4 bg-[#25D366]/10 text-[#25D366] rounded-xl font-bold hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
            <button className="flex items-center justify-center gap-3 p-4 bg-[#0088cc]/10 text-[#0088cc] rounded-xl font-bold hover:bg-[#0088cc]/20 transition-colors">
              <Send className="h-5 w-5" />
              Message on Telegram
            </button>
          </div>

          <Link
            to={ROUTES.tenantSupport}
            className="w-full py-4 border-2 border-[#FED609] border-dashed rounded-xl text-[#1A1A1A] font-bold hover:bg-[#FFFAE2] transition-all mb-6 flex items-center justify-center gap-2 text-sm"
          >
            <Phone className="h-4 w-4 text-[#FED609]" />
            Create Support Ticket
          </Link>

          <div className="mt-auto p-4 bg-[#FFFAE2] rounded-xl border border-[#FED609]/20">
            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-3">Emergency Contact</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FED609] flex items-center justify-center">
                  <Phone className="h-4 w-4 text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">Maintenance Line</p>
                  <p className="text-xs text-[#6B7280]">Available 24/7</p>
                </div>
              </div>
              <p className="text-sm font-black text-[#1A1A1A]">+971 4 000 0000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Connect Banner */}
      <div className="bg-gradient-to-r from-[#0088cc] to-[#00a2ed] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <Send className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold font-[Sora,sans-serif]">Get instant updates via Telegram</h4>
              <p className="text-white/80 text-sm mt-1">
                Receive lease renewals, payment receipts, and maintenance alerts instantly.
              </p>
            </div>
          </div>
          <button className="whitespace-nowrap px-8 py-3 bg-white text-[#0088cc] font-extrabold rounded-lg shadow-xl hover:bg-[#FFFAE2] active:scale-95 transition-all text-sm">
            Connect Now
          </button>
        </div>
      </div>

      {/* Condition Report Panel */}
      {!loading && token ? (
        <ConditionReportTenantPanel token={token} residentName={tenant?.full_name ?? authTenant?.full_name} />
      ) : null}
    </div>
  )
}
