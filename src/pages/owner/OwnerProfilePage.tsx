import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, Check, CreditCard, Crown, Mail, Pencil, Phone, Save, Shield, Trash2, User } from 'lucide-react'

import { ErrorState } from '../../components/common/ErrorState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { BillingState, OwnerDeletionReason } from '../../types/api'

const DELETE_REASON_OPTIONS: Array<{ value: OwnerDeletionReason; label: string; description: string }> = [
  { value: 'not_satisfied', label: 'Not satisfied', description: 'The overall experience did not work for me.' },
  { value: 'missing_features', label: 'Need better features', description: 'I am missing something important in the product.' },
  { value: 'too_expensive', label: 'Too expensive', description: 'Pricing no longer feels right for my use case.' },
  { value: 'switching_platform', label: 'Switching platform', description: 'I am moving to another tool or workflow.' },
  { value: 'temporary_use_only', label: 'Temporary use only', description: 'I only needed the account for a short time.' },
  { value: 'other', label: 'Other reason', description: 'A different reason fits better.' },
]

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-[DM_Sans,sans-serif]">
        {label}
      </p>
      <p className="break-all font-medium text-white font-[Manrope,sans-serif]">
        {value ?? <span className="italic text-[#8D8D96]">Not set</span>}
      </p>
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h3 className="font-['Sora'] text-base font-bold text-white">{children}</h3>
    </div>
  )
}

export function OwnerProfilePage() {
  const navigate = useNavigate()
  const { owner, token, logout } = useOwnerAuth()

  const [billing, setBilling] = useState<BillingState | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [supportEmail, setSupportEmail] = useState(owner?.support_email ?? '')
  const [supportWhatsapp, setSupportWhatsapp] = useState(owner?.support_whatsapp ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<OwnerDeletionReason[]>([])
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)

  useEffect(() => {
    if (!token) return
    api.getBillingState(token).then((res) => setBilling(res.billing)).catch(() => {})
  }, [token])

  const ownerName = owner?.full_name?.trim() || ''
  const normalizedConfirmationText = deleteConfirmText.trim().toLowerCase()
  const canConfirmDeletion =
    selectedReasons.length > 0 &&
    (normalizedConfirmationText === 'delete my account' ||
      (ownerName.length > 0 && normalizedConfirmationText === ownerName.toLowerCase()))

  const deleteConfirmationHint = ownerName.length > 0 ? `Type "${ownerName}" or "DELETE MY ACCOUNT"` : 'Type "DELETE MY ACCOUNT"'

  const memberSince = owner?.created_at
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(owner.created_at))
    : null

  const resetDeleteState = () => {
    setShowDeleteModal(false)
    setSelectedReasons([])
    setDeleteConfirmText('')
    setDeleteBusy(false)
  }

  const toggleDeleteReason = (reason: OwnerDeletionReason) => {
    setSelectedReasons((current) =>
      current.includes(reason) ? current.filter((value) => value !== reason) : [...current, reason],
    )
  }

  const handleSave = async () => {
    if (!token) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await api.patchOwnerMe(token, {
        support_email: supportEmail.trim() || null,
        support_whatsapp: supportWhatsapp.trim() || null,
      })
      setSuccess('Contact info updated successfully.')
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSupportEmail(owner?.support_email ?? '')
    setSupportWhatsapp(owner?.support_whatsapp ?? '')
    setIsEditing(false)
    setError(null)
  }

  const handleDeleteAccount = async () => {
    if (!token || !canConfirmDeletion) {
      return
    }

    try {
      setDeleteBusy(true)
      setError(null)
      setSuccess(null)

      await api.deleteOwnerMe(token, {
        confirmation_text: deleteConfirmText.trim(),
        reasons: selectedReasons,
      })

      resetDeleteState()
      logout()
      navigate(ROUTES.home, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete account')
      setDeleteBusy(false)
    }
  }

  const selectedReasonCountLabel = useMemo(() => {
    if (selectedReasons.length === 0) return 'Select at least one reason'
    if (selectedReasons.length === 1) return '1 reason selected'
    return `${selectedReasons.length} reasons selected`
  }, [selectedReasons.length])

  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <header className="mb-8">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#4E79FF] font-[DM_Sans,sans-serif]">
            Owner Portal
          </p>
          <div className="mb-1 flex items-center gap-2">
            <User className="h-7 w-7 text-[#4E79FF]" />
            <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">Profile &amp; Settings</h2>
          </div>
          <p className="font-medium text-[#8D8D96] font-[Manrope,sans-serif]">
            Manage your account details and contact preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-[#101114] p-6 shadow-sm" style={{ border: '1.5px solid #272839' }}>
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#4E79FF]" />
                <h3 className="font-['Sora'] text-base font-bold text-white">Profile Overview</h3>
              </div>

              <div className="space-y-5">
                <ReadOnlyField label="Full Name" value={owner?.full_name} />
                <ReadOnlyField label="Login Email" value={owner?.email} />
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-[DM_Sans,sans-serif]">
                    Plan
                  </p>
                  {owner?.organization?.plan_code ? (
                    <span className="inline-flex items-center rounded-full bg-[#4E79FF]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#4E79FF] font-[DM_Sans,sans-serif]">
                      {owner.organization.plan_code}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-white/8 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8D8D96] font-[DM_Sans,sans-serif]">
                      Free
                    </span>
                  )}
                </div>
                <ReadOnlyField label="Country" value={owner?.organization?.country_code} />
                <ReadOnlyField label="Currency" value={owner?.organization?.currency_code} />
                <ReadOnlyField label="Member Since" value={memberSince} />
              </div>
            </div>

            {/* Subscription Plan Card */}
            {billing && (
              <div className="rounded-2xl bg-[#101114] p-6 shadow-sm" style={{ border: '1.5px solid #272839' }}>
                <div className="mb-4 flex items-center gap-2">
                  {billing.status === 'active'
                    ? <Crown className="h-4 w-4 text-[#32C382]" />
                    : <CreditCard className="h-4 w-4 text-[#EBCF42]" />}
                  <h3 className="font-['Sora'] text-base font-bold text-white">Subscription</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-[DM_Sans,sans-serif] mb-1">Current Plan</p>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider font-[DM_Sans,sans-serif] ${
                        billing.status === 'active'
                          ? 'bg-[#32C382]/15 text-[#32C382]'
                          : billing.isTrialExpired
                          ? 'bg-[#F25461]/15 text-[#F25461]'
                          : 'bg-[#EBCF42]/15 text-[#EBCF42]'
                      }`}>
                        {billing.planDisplayName}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded font-[DM_Sans,sans-serif] ${
                      billing.status === 'active'
                        ? 'bg-[#32C382]/10 text-[#32C382]'
                        : billing.isTrialExpired
                        ? 'bg-[#F25461]/10 text-[#F25461]'
                        : 'bg-[#EBCF42]/10 text-[#EBCF42]'
                    }`}>
                      {billing.status === 'active' ? 'Active' : billing.isTrialExpired ? 'Expired' : 'Trial'}
                    </span>
                  </div>
                  {billing.status === 'trialing' && billing.daysLeftInTrial !== null && (
                    <p className="text-sm text-[#8D8D96] font-[Manrope,sans-serif]">
                      {billing.daysLeftInTrial} day{billing.daysLeftInTrial !== 1 ? 's' : ''} remaining in free trial
                      {billing.trialEndsAt ? ` · ends ${new Date(billing.trialEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                    </p>
                  )}
                  {billing.status === 'active' && billing.currentPeriodEnd && (
                    <p className="text-sm text-[#8D8D96] font-[Manrope,sans-serif]">
                      Renews {new Date(billing.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  {billing.isTrialExpired && (
                    <p className="text-sm text-[#F25461]/80 font-[Manrope,sans-serif]">
                      Your trial has ended. Subscribe to restore access.
                    </p>
                  )}
                  <Link
                    to={ROUTES.ownerBilling}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all font-['DM_Sans'] border"
                    style={
                      billing.status === 'active'
                        ? { borderColor: 'rgba(78,121,255,0.3)', color: '#4E79FF', backgroundColor: 'rgba(78,121,255,0.08)' }
                        : { borderColor: 'rgba(34,81,227,0.5)', color: '#FFFFFF', backgroundColor: '#2251E3' }
                    }
                  >
                    <span>{billing.status === 'active' ? 'Manage / Upgrade Plan' : 'Choose a Plan'}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-[#101114] p-6 shadow-sm" style={{ border: '1.5px solid #272839' }}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#4E79FF]" />
                  <h3 className="font-['Sora'] text-base font-bold text-white">Support Contact Info</h3>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#272839] bg-[#141519] px-3 py-1.5 text-xs font-semibold text-[#8D8D96] transition-all hover:border-[#4E79FF]/40 hover:bg-[#4E79FF]/10 hover:text-[#4E79FF] font-['DM_Sans']"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-[#8D8D96] font-[Manrope,sans-serif]">
                Tenants use these contact details to reach you directly.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="support-email"
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-[DM_Sans,sans-serif]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Support Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="support@yourcompany.com"
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-whatsapp"
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8D8D96] font-[DM_Sans,sans-serif]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Support WhatsApp
                  </label>
                  <input
                    id="support-whatsapp"
                    type="text"
                    value={supportWhatsapp}
                    onChange={(e) => setSupportWhatsapp(e.target.value)}
                    disabled={!isEditing}
                    placeholder="+1 234 567 8900"
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4">
                  <ErrorState message={error} />
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-xl border border-[#32C382]/30 bg-[#32C382]/15 px-4 py-3 text-sm text-[#32C382] font-[Manrope,sans-serif]">
                  {success}
                </div>
              )}

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4E79FF] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#3E68EE] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 font-['DM_Sans']"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 rounded-xl border border-[#272839] bg-[#141519] px-4 py-2.5 text-sm font-semibold text-[#8D8D96] transition-colors hover:border-[#4E79FF]/30 hover:text-white disabled:opacity-50 font-['DM_Sans']"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#F25461]/30 bg-[#101114] p-6 shadow-sm">
              <SectionLabel icon={<Shield className="h-4 w-4 text-[#F25461]" />}>Danger Zone</SectionLabel>

              <p className="mb-4 text-sm leading-relaxed text-[#8D8D96] font-[Manrope,sans-serif]">
                This will permanently delete your account from Prophives. We will still email your selected exit reasons and account details to our team.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#F25461]/40 bg-[#F25461]/10 px-6 py-2.5 text-sm font-bold text-[#F25461] transition-all hover:border-[#F25461]/60 hover:bg-[#F25461]/15 active:scale-95 font-['Sora']"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={resetDeleteState} title="Delete Account" size="md">
        <div className="space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F25461]/15">
            <AlertTriangle className="h-6 w-6 text-[#F25461]" />
          </div>

          <div className="text-center">
            <p className="mb-2 font-semibold text-white">Before you go, help us understand why</p>
            <p className="text-sm leading-relaxed text-[#8D8D96]">
              Select the main reason for leaving. Your account will be deleted immediately after confirmation.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8D8D96] font-[DM_Sans,sans-serif]">
                Exit Survey
              </p>
              <span className="text-xs text-[#8D8D96] font-[Manrope,sans-serif]">{selectedReasonCountLabel}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {DELETE_REASON_OPTIONS.map((option) => {
                const active = selectedReasons.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleDeleteReason(option.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      active
                        ? 'border-[#4E79FF]/70 bg-[#4E79FF]/12 shadow-[0_0_0_1px_rgba(78,121,255,0.22)]'
                        : 'border-[#272839] bg-[#141519] hover:border-[#4E79FF]/30 hover:bg-[#171924]'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-white font-[Manrope,sans-serif]">{option.label}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          active ? 'border-[#4E79FF] bg-[#4E79FF] text-white' : 'border-[#3A3D4D] text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#8D8D96] font-[Manrope,sans-serif]">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#272839] bg-[#141519] p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8D8D96] font-[DM_Sans,sans-serif]">
              Final Confirmation
            </p>
            <p className="mb-3 text-sm leading-relaxed text-[#C9CBD4] font-[Manrope,sans-serif]">
              Type your name or <span className="font-bold text-white">DELETE MY ACCOUNT</span> to continue.
            </p>
            {ownerName ? (
              <p className="mb-3 rounded-xl border border-[#272839] bg-[#0B0C10] px-3 py-2 text-sm text-white font-[Manrope,sans-serif]">
                Name to type: <span className="font-bold">{ownerName}</span>
              </p>
            ) : null}
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={deleteConfirmationHint}
              className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm text-white placeholder-[#8D8D96] transition-all focus:outline-none focus:ring-2 focus:ring-[#F25461]/50 font-[Manrope]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetDeleteState}
              className="flex-1 rounded-xl border border-[#272839] bg-[#141519] px-4 py-2.5 text-sm font-semibold text-[#8D8D96] transition-colors hover:border-[#4E79FF]/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={deleteBusy || !canConfirmDeletion}
              className="flex-1 rounded-xl bg-[#F25461] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#E63D52] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteBusy ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
