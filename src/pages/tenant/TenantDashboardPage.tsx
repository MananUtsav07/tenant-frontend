import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Ticket,
  UserRound,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../components/common/Button'
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
  TelegramOnboardingState,
  TenantRentPaymentState,
  TenantOwnerContact,
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
  const [ownerContact, setOwnerContact] = useState<TenantOwnerContact | null>(null)
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
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

      const [ownerContactResponse, telegramResponse] = await Promise.allSettled([
        api.getTenantOwnerContact(token),
        api.getTenantTelegramOnboarding(token),
      ])

      if (ownerContactResponse.status === 'fulfilled') {
        setOwnerContact(ownerContactResponse.value.owner)
      } else {
        setOwnerContact(null)
      }

      if (telegramResponse.status === 'fulfilled') {
        setTelegramOnboarding(telegramResponse.value.onboarding)
      } else {
        setTelegramOnboarding(null)
      }

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
  const orgCurrency = authTenant?.organization?.currency_code ?? rentPaymentState?.currency_code ?? 'AED'
  const whatsappHref = ownerContact?.support_whatsapp
    ? `https://wa.me/${ownerContact.support_whatsapp.replace(/\D/g, '')}`
    : null
  const telegramHref = telegramOnboarding?.connect_url ?? null

  return (
    <div className="min-h-screen bg-[#06070B] p-6 lg:p-8 space-y-6 text-white">

      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white font-['Sora']">
            Welcome, {tenantName}
          </h2>
          {property ? (
            <p className="text-[#8D8D96] mt-1 font-medium flex items-center gap-2 font-['Manrope']">
              <MapPin className="h-5 w-5 text-[#4E79FF]" />
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
            className="px-5 py-2.5 bg-[#101114] border border-[#272839] rounded-lg font-['DM_Sans'] font-bold text-sm flex items-center gap-2 hover:border-[#4E79FF]/40 transition-colors text-white"
          >
            <RefreshCw className="h-4 w-4 text-[#4E79FF]" />
            Refresh
          </button>
          {summary ? (
            <button className="px-5 py-2.5 bg-[#101114] border border-[#272839] rounded-lg font-['DM_Sans'] font-bold text-sm flex items-center gap-2 hover:border-[#4E79FF]/40 transition-colors text-white">
              <CalendarDays className="h-4 w-4 text-[#4E79FF]" />
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
          <div className="bg-[#101114] rounded-2xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#4E79FF]/15 flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5 text-[#4E79FF]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D96] font-bold uppercase tracking-wider font-['DM_Sans']">Open Tickets</p>
              <p className="text-2xl font-extrabold text-white font-['Sora']">{summary.open_tickets}</p>
            </div>
          </div>
          <div className="bg-[#101114] rounded-2xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#4E79FF]/15 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-[#4E79FF]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D96] font-bold uppercase tracking-wider font-['DM_Sans']">Reminders</p>
              <p className="text-2xl font-extrabold text-white font-['Sora']">{summary.pending_reminders}</p>
            </div>
          </div>
          <div className="bg-[#101114] rounded-2xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#4E79FF]/15 flex items-center justify-center shrink-0">
              <CircleDollarSign className="h-5 w-5 text-[#4E79FF]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D96] font-bold uppercase tracking-wider font-['DM_Sans']">Monthly Rent</p>
              <p className="text-xl font-extrabold text-white font-['Sora'] leading-tight">
                {formatCurrency(summary.monthly_rent, orgCurrency)}
              </p>
            </div>
          </div>
          <div className="bg-[#101114] rounded-2xl shadow-sm border border-[#272839] hover:border-[#4E79FF]/30 transition-all p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#4E79FF]/15 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-[#4E79FF]" />
            </div>
            <div>
              <p className="text-[10px] text-[#8D8D96] font-bold uppercase tracking-wider font-['DM_Sans']">Next Due</p>
              <p className="text-base font-extrabold text-white font-['Sora']">{formatDate(summary.next_due_date)}</p>
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

      {!loading ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-[#25D366]/25 bg-[#101114] p-5 transition-colors hover:border-[#25D366]/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white font-['Sora']">WhatsApp</p>
                    <p className="mt-1 truncate text-xs text-[#8D8D96] font-['Manrope']">
                      {ownerContact?.support_whatsapp}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#25D366] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                Message your owner quickly for support and urgent updates.
              </p>
            </a>
          ) : (
            <Link
              to={ROUTES.tenantSupport}
              className="group rounded-2xl border border-[#272839] bg-[#101114] p-5 transition-colors hover:border-[#25D366]/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-['Sora']">WhatsApp</p>
                    <p className="mt-1 text-xs text-[#8D8D96] font-['Manrope']">Open support options</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#25D366] transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                View the owner contact page if WhatsApp is not configured yet.
              </p>
            </Link>
          )}

          {telegramHref ? (
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-[#0088CC]/25 bg-[#101114] p-5 transition-colors hover:border-[#0088CC]/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0088CC]/15">
                    <Send className="h-5 w-5 text-[#0088CC]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-['Sora']">Telegram</p>
                    <p className="mt-1 text-xs text-[#8D8D96] font-['Manrope']">
                      {telegramOnboarding?.connected ? 'Connected' : 'Connect now'}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#0088CC] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                Open Telegram for alerts, payment updates, and lease reminders.
              </p>
            </a>
          ) : (
            <Link
              to={ROUTES.tenantIntegrations}
              className="group rounded-2xl border border-[#272839] bg-[#101114] p-5 transition-colors hover:border-[#0088CC]/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0088CC]/15">
                    <Send className="h-5 w-5 text-[#0088CC]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-['Sora']">Telegram</p>
                    <p className="mt-1 text-xs text-[#8D8D96] font-['Manrope']">Manage connection</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#0088CC] transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-sm text-[#8D8D96] font-['Manrope']">
                Open integrations to connect Telegram when it becomes available.
              </p>
            </Link>
          )}
        </section>
      ) : null}

      {/* Main Grid: Property Info + Rent Payment */}
      {!loading && (property || tenant || rentPaymentState) ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left column: Property card + Recent Tickets stacked */}
          <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Property Info Card */}
          {property || tenant ? (
            <div className="bg-[#101114] rounded-xl shadow-sm border border-[#272839] border-t-4 border-t-[#4E79FF] p-6 relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#4E79FF]/5 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-['Sora'] mb-1 flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-[#4E79FF]" />
                      {property?.property_name ?? 'Your Property'}
                    </h3>
                    {property?.address ? (
                      <p className="text-[#8D8D96] text-base font-['Manrope']">{property.address}</p>
                    ) : null}
                  </div>
                  {tenant ? (
                    <span className="px-4 py-1.5 bg-[#4E79FF]/15 text-[#4E79FF] text-xs font-black uppercase tracking-widest rounded-full border border-[#4E79FF]/20 whitespace-nowrap">
                      Active Lease
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-12">
                  {property?.unit_number ? (
                    <div>
                      <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-2 font-['DM_Sans']">Unit Number</p>
                      <p className="font-bold text-white text-lg font-['Manrope']">Unit {property.unit_number}</p>
                    </div>
                  ) : null}
                  {tenant?.payment_status ? (
                    <div>
                      <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-2 font-['DM_Sans']">Payment Status</p>
                      <StatusBadge status={tenant.payment_status} />
                    </div>
                  ) : null}
                  {tenant?.lease_start_date || tenant?.lease_end_date ? (
                    <div className="sm:col-span-2 md:col-span-1">
                      <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-2 font-['DM_Sans']">Lease Period</p>
                      <div className="flex items-center gap-2 text-white font-bold text-lg font-['Manrope']">
                        <span>{formatDate(tenant?.lease_start_date)}</span>
                        <ArrowRight className="h-4 w-4 text-[#4E79FF]" />
                        <span>{formatDate(tenant?.lease_end_date)}</span>
                      </div>
                    </div>
                  ) : null}
                  {summary?.next_due_date ? (
                    <div>
                      <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-2 font-['DM_Sans']">Next Due Date</p>
                      <p className="font-bold text-white text-lg font-['Manrope']">{formatDate(summary.next_due_date)}</p>
                    </div>
                  ) : null}
                </div>

                {/* Assigned Broker */}
                {tenant?.brokers ? (
                  <div className="mt-5 pt-5 border-t border-[#272839]">
                    <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-3 font-['DM_Sans']">Assigned Broker</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-[#141519] border border-[#272839]">
                      <div className="w-10 h-10 rounded-full bg-[#4E79FF]/15 flex items-center justify-center shrink-0">
                        <UserRound className="h-5 w-5 text-[#4E79FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white font-['Manrope'] truncate">{tenant.brokers.full_name}</p>
                        {tenant.brokers.agency_name ? (
                          <p className="text-xs text-[#8D8D96] font-['Manrope'] truncate">{tenant.brokers.agency_name}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tenant.brokers.phone ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4E79FF]/15 text-[#4E79FF] text-xs font-bold rounded-lg font-['DM_Sans']">
                            <Phone className="h-3.5 w-3.5" />
                            {tenant.brokers.phone}
                          </span>
                        ) : null}
                        <a
                          href={`mailto:${tenant.brokers.email}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4E79FF]/15 text-[#4E79FF] text-xs font-bold rounded-lg hover:bg-[#4E79FF]/25 transition-colors font-['DM_Sans']"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {tenant.brokers.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}

              </div>
            </div>
          ) : null}

          {/* Recent Tickets (inside left column) */}
          <div className="bg-[#101114] rounded-xl shadow-sm p-6 border border-[#272839]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-white font-['Sora']">Recent Tickets</h3>
              <Link
                to={ROUTES.tenantTickets}
                className="text-sm font-['DM_Sans'] font-bold text-[#4E79FF] hover:underline"
              >
                View All Tickets
              </Link>
            </div>

            {!loading && summary ? (
              <div className="space-y-3 mb-5">
                {summary.open_tickets > 0 ? (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[#272839] hover:border-[#4E79FF]/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#4E79FF]/15 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-[#4E79FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#4E79FF] transition-colors font-['Manrope']">Open Tickets</p>
                        <p className="text-xs text-[#8D8D96] font-['Manrope']">{summary.open_tickets} ticket(s) awaiting response</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#4E79FF]/15 text-[#4E79FF] text-xs font-bold rounded font-['DM_Sans']">
                      {summary.open_tickets} Open
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[#272839]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#32C382]/15 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-[#32C382]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white font-['Manrope']">All Clear</p>
                        <p className="text-xs text-[#8D8D96] font-['Manrope']">No open tickets at the moment</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#32C382]/15 text-[#32C382] text-xs font-bold rounded font-['DM_Sans']">All Good</span>
                  </div>
                )}
                {summary.pending_reminders > 0 ? (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-[#272839] hover:border-[#4E79FF]/30 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#EBCF42]/15 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-[#EBCF42]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#4E79FF] transition-colors font-['Manrope']">Pending Reminders</p>
                        <p className="text-xs text-[#8D8D96] font-['Manrope']">{summary.pending_reminders} reminder(s) pending</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#EBCF42]/15 text-[#EBCF42] text-xs font-bold rounded font-['DM_Sans']">
                      {summary.pending_reminders}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {loading ? <LoadingState message="" rows={2} /> : null}

            <Link
              to={ROUTES.tenantTickets}
              className="w-full py-3 bg-[#4E79FF] text-white font-['DM_Sans'] font-bold rounded-lg shadow-md hover:bg-[#3E68EE] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create New Ticket
            </Link>
          </div>

          </div>{/* end left column */}

          {/* Rent Payment Card */}
          <div className={`${property || tenant ? 'xl:col-span-1' : 'xl:col-span-3'} bg-[#101114] rounded-xl shadow-sm p-8 flex flex-col border border-[#272839]`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white font-['Sora']">Rent Payment</h3>
              {rentPaymentState ? (
                <span className={`px-3 py-1.5 text-xs font-black rounded-md flex items-center gap-1 uppercase ${
                  rentPaymentState.status === 'approved'
                    ? 'bg-[#32C382]/15 text-[#32C382]'
                    : rentPaymentState.status === 'awaiting_owner_approval'
                    ? 'bg-[#EBCF42]/15 text-[#EBCF42]'
                    : rentPaymentState.status === 'rejected'
                    ? 'bg-[#F25461]/15 text-[#F25461]'
                    : rentPaymentState.status === 'eligible'
                    ? 'bg-[#4E79FF]/15 text-[#4E79FF]'
                    : 'bg-white/8 text-[#8D8D96]'
                }`}>
                  {rentPaymentState.status === 'approved' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : rentPaymentState.status === 'rejected' ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : null}
                  {rentPaymentState.status.replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>

            {rentPaymentState?.is_visible ? (
              <>
                <div className="bg-[#141519] rounded-xl p-6 mb-8 text-center border border-[#272839]">
                  <p className="text-[#8D8D96] text-xs font-['DM_Sans'] font-bold mb-1 uppercase tracking-wider">Next Due Amount</p>
                  <p className="text-5xl font-extrabold text-white font-['Sora'] tracking-tight">
                    {formatCurrency(rentPaymentState.amount_paid, rentPaymentState.currency_code)}
                  </p>
                  <p className="text-[#8D8D96] text-base mt-2 font-['Manrope']">
                    Due: <span className="text-white font-bold">{formatDate(rentPaymentState.due_date)}</span>
                  </p>
                </div>

                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-[#8D8D96] font-bold uppercase tracking-wider mb-4 font-['DM_Sans']">Recent History</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#272839]">
                      <span className="text-base font-medium text-white font-['Manrope']">Cycle</span>
                      <span className="text-sm font-bold text-[#8D8D96]">
                        {rentPaymentState.cycle_month}/{rentPaymentState.cycle_year}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#272839]">
                      <span className="text-base font-medium text-white font-['Manrope']">Window Opens</span>
                      <span className="text-sm font-bold text-[#8D8D96]">{formatDate(rentPaymentState.window_starts_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base font-medium text-white font-['Manrope']">Status</span>
                      <StatusBadge status={rentPaymentState.status === 'eligible' ? 'pending' : rentPaymentState.status} />
                    </div>
                  </div>
                </div>

                {rentPaymentState.status === 'eligible' ? (
                  <div className="mt-6">
                    <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                      {markingPaid ? 'Submitting...' : 'Mark Rent as Paid'}
                    </Button>
                  </div>
                ) : null}

                {rentPaymentState.status === 'awaiting_owner_approval' ? (
                  <div className="mt-6 p-3 bg-[#EBCF42]/10 rounded-xl border border-[#EBCF42]/20">
                    <p className="text-sm font-medium text-[#EBCF42] font-['Manrope']">Waiting for owner verification.</p>
                  </div>
                ) : null}

                {rentPaymentState.status === 'rejected' ? (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-[#F25461] font-['Manrope']">Owner rejected this confirmation.</p>
                    {rentPaymentState.rejection_reason ? (
                      <p className="rounded-xl border border-[#F25461]/20 bg-[#F25461]/10 px-3 py-2 text-sm text-[#F25461] font-['Manrope']">
                        Reason: {rentPaymentState.rejection_reason}
                      </p>
                    ) : null}
                    <Button type="button" variant="primary" disabled={markingPaid} onClick={() => void handleMarkRentPaid()}>
                      {markingPaid ? 'Resubmitting...' : 'Resubmit Mark as Paid'}
                    </Button>
                  </div>
                ) : null}

                {rentPaymentState.status === 'approved' ? (
                  <div className="mt-6 p-3 bg-[#32C382]/10 rounded-xl border border-[#32C382]/20">
                    <p className="text-sm font-medium text-[#32C382] font-['Manrope']">Rent payment confirmed for this cycle.</p>
                  </div>
                ) : null}

                <div className="mt-6 p-4 bg-[#4E79FF]/10 rounded-lg flex items-start gap-3 border border-[#4E79FF]/20">
                  <Info className="h-5 w-5 text-[#4E79FF] shrink-0 mt-0.5" />
                  <p className="text-xs leading-normal text-[#8D8D96] font-medium font-['Manrope']">
                    Mark rent paid from 7 days before due date. Your owner will verify the payment.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#4E79FF]/15 flex items-center justify-center mb-3">
                  <CircleDollarSign className="h-7 w-7 text-[#4E79FF]" />
                </div>
                <p className="text-sm font-bold text-white mb-1 font-['Sora']">Payment window not open yet</p>
                {rentPaymentState?.window_starts_at ? (
                  <p className="text-xs text-[#8D8D96] font-['Manrope']">
                    Opens on <span className="text-white font-semibold">{formatDate(rentPaymentState.window_starts_at)}</span>
                    {' '}— due <span className="text-white font-semibold">{formatDate(rentPaymentState.due_date)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#8D8D96] font-['Manrope']">Rent payment window will appear 7 days before your due date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

    </div>
  )
}
