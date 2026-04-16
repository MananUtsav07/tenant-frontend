import { useState } from 'react'
import { CheckCircle2, ChevronRight, X } from 'lucide-react'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'

type Props = {
  onComplete: () => void
  onSkip: () => void
}

const STEP_SUBTITLES: Record<number, string> = {
  1: "Let's add your first property to get started.",
  2: 'Add a tenant to your property, or skip and do it later.',
  3: "You're ready to manage your properties like a pro.",
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      {/* Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1
          const isCompleted = step < current
          const isCurrent = step === current
          return (
            <div
              key={step}
              className={`rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'w-6 h-3 bg-[#FED609]'
                  : isCompleted
                  ? 'w-3 h-3 bg-[#FED609]'
                  : 'w-3 h-3 bg-gray-200'
              }`}
            />
          )
        })}
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-[#FED609] rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
        />
      </div>
      <p className="text-xs font-['DM_Sans'] text-gray-400 tracking-wide uppercase">
        Step {current} of {total}
      </p>
    </div>
  )
}

export function OwnerOnboardingWizard({ onComplete, onSkip }: Props) {
  const { token } = useOwnerAuth()

  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null)
  const [createdPropertyName, setCreatedPropertyName] = useState<string | null>(null)
  const [createdTenantAccessId, setCreatedTenantAccessId] = useState<string | null>(null)
  const [tenantSkipped, setTenantSkipped] = useState(false)

  // Property form
  const [propertyName, setPropertyName] = useState('')
  const [address, setAddress] = useState('')
  const [unitNumber, setUnitNumber] = useState('')

  // Tenant form
  const [tenantName, setTenantName] = useState('')
  const [tenantEmail, setTenantEmail] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [tenantPassword, setTenantPassword] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [paymentDueDay, setPaymentDueDay] = useState('1')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseEnd, setLeaseEnd] = useState('')

  const inputClass =
    'rounded-xl border border-gray-200 bg-[#FEFAEF] px-4 py-3 w-full focus:ring-2 focus:ring-[#FED609] focus:outline-none text-[#1A1A1A] font-[\'Manrope\'] text-sm placeholder-gray-400 transition'

  const labelClass = "block text-xs font-['DM_Sans'] font-semibold text-gray-500 uppercase tracking-wide mb-1"

  async function handleAddProperty() {
    if (!propertyName.trim()) {
      setError('Property name is required.')
      return
    }
    if (!address.trim()) {
      setError('Address is required.')
      return
    }
    if (!token) {
      setError('Not authenticated.')
      return
    }

    setError(null)
    setBusy(true)

    try {
      const res = await api.createOwnerProperty(token, {
        property_name: propertyName.trim(),
        address: address.trim(),
        ...(unitNumber.trim() ? { unit_number: unitNumber.trim() } : {}),
      })
      setCreatedPropertyId(res.property.id)
      setCreatedPropertyName(res.property.property_name)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleAddTenant() {
    if (!tenantName.trim()) {
      setError('Full name is required.')
      return
    }
    if (!tenantPassword.trim()) {
      setError('A login password is required for the tenant.')
      return
    }
    if (!createdPropertyId || !token) {
      setError('Missing property or auth token.')
      return
    }

    setError(null)
    setBusy(true)

    try {
      const res = await api.createOwnerTenant(token, {
        property_id: createdPropertyId,
        full_name: tenantName.trim(),
        ...(tenantEmail.trim() ? { email: tenantEmail.trim() } : {}),
        ...(tenantPhone.trim() ? { phone: tenantPhone.trim() } : {}),
        password: tenantPassword,
        ...(monthlyRent ? { monthly_rent: parseFloat(monthlyRent) } : { monthly_rent: 0 }),
        payment_due_day: parseInt(paymentDueDay, 10) || 1,
        ...(leaseStart ? { lease_start_date: leaseStart } : {}),
        ...(leaseEnd ? { lease_end_date: leaseEnd } : {}),
        status: 'active',
        payment_status: 'pending',
      })
      setCreatedTenantAccessId(res.tenant.tenant_access_id)
      setTenantSkipped(false)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tenant. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function handleSkipTenant() {
    setTenantSkipped(true)
    setStep(3)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full mx-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-['Sora'] text-[#1A1A1A] mb-1">
            Welcome to Prophives 👋
          </h1>
          <p className="text-sm font-['Manrope'] text-gray-500">{STEP_SUBTITLES[step]}</p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} total={3} />

        {/* Error banner */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-['Manrope']">
            {error}
          </div>
        )}

        {/* ── STEP 1: Add Property ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Property Name *</label>
              <input
                className={inputClass}
                placeholder="e.g. Marina Heights Tower"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>Address *</label>
              <input
                className={inputClass}
                placeholder="e.g. 12 Baker Street, London"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>Unit Number (optional)</label>
              <input
                className={inputClass}
                placeholder="e.g. 1204"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                disabled={busy}
              />
            </div>

            <button
              onClick={handleAddProperty}
              disabled={busy}
              className="mt-2 bg-[#FED609] text-[#1A1A1A] font-bold rounded-xl px-8 py-4 w-full font-['Sora'] text-sm hover:bg-[#FFD70B] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="animate-pulse">Adding property…</span>
              ) : (
                <>
                  Add Property &amp; Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2: Add Tenant ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {createdPropertyName && (
              <div className="flex items-center gap-2 rounded-xl bg-[#FEFAEF] border border-[#FED609]/30 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#D4A800] flex-shrink-0" />
                <span className="text-xs font-['DM_Sans'] text-gray-600">
                  Property: <span className="font-bold text-[#1A1A1A]">{createdPropertyName}</span>
                </span>
              </div>
            )}

            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                className={inputClass}
                placeholder="e.g. Ahmed Al Rashidi"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="tenant@email.com"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="+971 50 000 0000"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Monthly Rent (AED)</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="e.g. 8500"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>Payment Due Day</label>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  max="28"
                  placeholder="1–28"
                  value={paymentDueDay}
                  onChange={(e) => setPaymentDueDay(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Lease Start Date</label>
                <input
                  className={inputClass}
                  type="date"
                  value={leaseStart}
                  onChange={(e) => setLeaseStart(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>Lease End Date</label>
                <input
                  className={inputClass}
                  type="date"
                  value={leaseEnd}
                  onChange={(e) => setLeaseEnd(e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Tenant Login Password *</label>
              <input
                className={inputClass}
                type="password"
                placeholder="Set a secure password for the tenant"
                value={tenantPassword}
                onChange={(e) => setTenantPassword(e.target.value)}
                disabled={busy}
              />
            </div>

            <button
              onClick={handleAddTenant}
              disabled={busy}
              className="mt-2 bg-[#FED609] text-[#1A1A1A] font-bold rounded-xl px-8 py-4 w-full font-['Sora'] text-sm hover:bg-[#FFD70B] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="animate-pulse">Adding tenant…</span>
              ) : (
                <>
                  Add Tenant &amp; Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={handleSkipTenant}
              disabled={busy}
              className="text-sm font-['Manrope'] text-gray-400 hover:text-gray-600 transition-colors text-center w-full py-1 disabled:cursor-not-allowed"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* ── STEP 3: All set ── */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-6">
            {/* Celebration icon */}
            <div className="w-20 h-20 rounded-full bg-[#FED609]/15 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#D4A800]" />
            </div>

            {/* Checklist */}
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-[#FEFAEF] border border-[#FED609]/30 px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4A800] flex-shrink-0" />
                <div>
                  <p className="text-sm font-['Manrope'] font-semibold text-[#1A1A1A]">Property added</p>
                  {createdPropertyName && (
                    <p className="text-xs text-gray-500 font-['DM_Sans']">{createdPropertyName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-[#FEFAEF] border border-[#FED609]/30 px-4 py-3">
                <CheckCircle2
                  className={`w-5 h-5 flex-shrink-0 ${tenantSkipped ? 'text-gray-300' : 'text-[#D4A800]'}`}
                />
                <div>
                  {tenantSkipped ? (
                    <p className="text-sm font-['Manrope'] text-gray-400">
                      Tenant setup skipped — add anytime
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-['Manrope'] font-semibold text-[#1A1A1A]">Tenant added</p>
                      {createdTenantAccessId && (
                        <p className="text-xs text-gray-500 font-['DM_Sans'] mt-0.5">
                          Access ID:{' '}
                          <span className="font-bold text-[#1A1A1A] tracking-wider">
                            {createdTenantAccessId}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {createdTenantAccessId && !tenantSkipped && (
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-['DM_Sans'] text-amber-700 text-center">
                  Share the Access ID above with your tenant — they'll use it to log in to the tenant portal.
                </p>
              </div>
            )}

            <button
              onClick={onComplete}
              className="bg-[#FED609] text-[#1A1A1A] font-bold rounded-xl px-8 py-4 w-full font-['Sora'] text-sm hover:bg-[#FFD70B] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
