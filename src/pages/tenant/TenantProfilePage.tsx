import { useCallback, useEffect, useState } from 'react'
import { Building2, Calendar, CreditCard, Phone, Save, User } from 'lucide-react'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { api } from '../../services/api'
import type { Property } from '../../types/api'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)
    ?.trim()
    ?.split(',')[0]
    ?.trim()
    .replace(/\/$/, '')
    .replace(/\/api$/, '') ?? 'http://localhost:8787'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">{label}</p>
      <p className="text-sm font-semibold text-[#1A1A1A] font-['Manrope']">{value || '—'}</p>
    </div>
  )
}

const paymentStatusStyles: Record<string, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', classes: 'bg-[#FED609]/20 text-[#92700A]' },
  overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700' },
  partial: { label: 'Partial', classes: 'bg-orange-100 text-orange-700' },
}

export function TenantProfilePage() {
  const { tenant: authTenant, token } = useTenantAuth()

  const [property, setProperty] = useState<Property | null>(null)
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [phone, setPhone] = useState(authTenant?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await api.tenantMe(token)
      setProperty(res.property)
      setCurrencyCode(res.organization?.currency_code ?? 'USD')
      setPhone(res.tenant.phone ?? '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void load() }, [load])

  const handleSavePhone = async () => {
    if (!token) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const res = await fetch(`${BASE_URL}/api/tenants/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim() || null }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }
      setSaveSuccess(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const tenant = authTenant
  const leaseRemaining = daysUntil(tenant?.lease_end_date)
  const payStatus = paymentStatusStyles[tenant?.payment_status ?? ''] ?? paymentStatusStyles.pending

  return (
    <div className="min-h-screen bg-[#FEFAEF]">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">

        {/* Header */}
        <header className="mb-8">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#92700A] font-['DM_Sans']">
            Tenant Portal
          </p>
          <div className="flex items-center gap-2">
            <User className="h-7 w-7 text-[#FED609]" />
            <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-[#1A1A1A]">My Profile</h2>
          </div>
          <p className="mt-1 text-[#6B7280] font-['Manrope']">Your account details and lease information.</p>
        </header>

        {loading && <LoadingState message="Loading profile..." rows={4} />}
        {error && <ErrorState message={error} />}

        {!loading && tenant && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ── Left column ── */}
            <div className="space-y-6">

              {/* Profile card */}
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
                <h3 className="mb-5 font-['Sora'] text-base font-bold text-[#1A1A1A]">Account Info</h3>
                <div className="space-y-4">
                  <ReadOnlyField label="Full Name" value={tenant.full_name} />
                  <ReadOnlyField label="Email" value={tenant.email ?? '—'} />
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">
                      Tenant ID
                    </p>
                    <span className="inline-block rounded-lg bg-[#FEFAEF] px-3 py-1 font-mono text-sm font-bold text-[#1A1A1A]">
                      {tenant.tenant_access_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phone edit */}
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#FED609]" />
                  <h3 className="font-['Sora'] text-base font-bold text-[#1A1A1A]">Contact Number</h3>
                </div>
                <p className="mb-4 text-sm text-[#6B7280] font-['Manrope']">
                  Your phone number is used for WhatsApp and SMS notifications.
                </p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="mb-4 w-full rounded-xl border border-gray-200 bg-[#FEFAEF] px-4 py-3 text-sm font-['Manrope'] text-[#1A1A1A] placeholder-[#6B7280] focus:border-[#FED609] focus:outline-none focus:ring-2 focus:ring-[#FED609]/20"
                />
                {saveError && (
                  <p className="mb-3 text-xs text-red-600 font-['Manrope']">{saveError}</p>
                )}
                {saveSuccess && (
                  <p className="mb-3 text-xs font-semibold text-green-600 font-['Manrope']">Phone number updated.</p>
                )}
                <button
                  type="button"
                  onClick={() => void handleSavePhone()}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#FED609] px-6 py-2.5 font-['Sora'] text-sm font-bold text-[#1A1A1A] shadow-sm transition-all hover:bg-[#FFD70B] active:scale-95 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Payment status */}
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#FED609]" />
                  <h3 className="font-['Sora'] text-base font-bold text-[#1A1A1A]">Payment Status</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-4 py-1.5 text-sm font-bold font-['DM_Sans'] ${payStatus.classes}`}>
                    {payStatus.label}
                  </span>
                  <span className="text-sm text-[#6B7280] font-['Manrope']">
                    Due day {tenant.payment_due_day} each month
                  </span>
                </div>
                <p className="mt-4 text-xs text-[#6B7280] font-['Manrope']">
                  For payment issues, contact your property manager.
                </p>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">

              {/* Lease info */}
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#FED609]" />
                  <h3 className="font-['Sora'] text-base font-bold text-[#1A1A1A]">Lease Details</h3>
                </div>
                <div className="space-y-4">
                  <ReadOnlyField label="Lease Start" value={formatDate(tenant.lease_start_date)} />
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">
                      Lease End
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1A1A1A] font-['Manrope']">{formatDate(tenant.lease_end_date)}</p>
                      {leaseRemaining !== null && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-['DM_Sans'] ${leaseRemaining <= 0 ? 'bg-red-100 text-red-700' : leaseRemaining <= 30 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {leaseRemaining <= 0 ? 'Expired' : `${leaseRemaining}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] font-['DM_Sans']">
                      Monthly Rent
                    </p>
                    <p className="font-['Sora'] text-xl font-extrabold text-[#1A1A1A]">
                      {new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(tenant.monthly_rent)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property */}
              {property && (
                <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#FED609]" />
                    <h3 className="font-['Sora'] text-base font-bold text-[#1A1A1A]">Property</h3>
                  </div>
                  <div className="space-y-3">
                    <ReadOnlyField label="Property Name" value={property.property_name} />
                    <ReadOnlyField label="Address" value={property.address} />
                    {property.unit_number && (
                      <ReadOnlyField label="Unit" value={property.unit_number} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
