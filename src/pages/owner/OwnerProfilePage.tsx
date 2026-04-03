import { useState } from 'react'
import { AlertTriangle, Building2, Mail, Pencil, Phone, Save, Shield, Trash2, User, X } from 'lucide-react'
import { motion } from 'framer-motion'

import { ErrorState } from '../../components/common/ErrorState'
import { Modal } from '../../components/common/Modal'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import { revealUp } from '../../utils/motion'

// ─── Read-only field ─────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]">
        {label}
      </p>
      <p className="font-medium text-white font-[Manrope,sans-serif] break-all">
        {value ?? <span className="text-[#8D8D96] italic">Not set</span>}
      </p>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <h3 className="font-['Sora'] text-base font-bold text-white">{children}</h3>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OwnerProfilePage() {
  const { owner, token } = useOwnerAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(owner?.full_name ?? '')
  const [companyName, setCompanyName] = useState(owner?.company_name ?? '')
  const [supportEmail, setSupportEmail] = useState(owner?.support_email ?? '')
  const [supportWhatsapp, setSupportWhatsapp] = useState(owner?.support_whatsapp ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await api.patchOwnerMe(token, {
        full_name: fullName.trim() || null,
        company_name: companyName.trim() || null,
        support_email: supportEmail.trim() || null,
        support_whatsapp: supportWhatsapp.trim() || null,
      })
      setSuccess('Profile updated successfully.')
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFullName(owner?.full_name ?? '')
    setCompanyName(owner?.company_name ?? '')
    setSupportEmail(owner?.support_email ?? '')
    setSupportWhatsapp(owner?.support_whatsapp ?? '')
    setIsEditing(false)
    setError(null)
  }

  const handleDeleteAccount = async () => {
    if (!token || deleteConfirmText !== 'DELETE MY ACCOUNT') {
      return
    }

    try {
      setDeleteBusy(true)
      setError(null)
      // Send email request to support for account deletion
      await api.sendContactMessage({
        name: owner?.full_name || owner?.company_name || 'Owner',
        email: owner?.email || '',
        message: `I would like to request permanent deletion of my Prophives account. I understand this action cannot be undone and all associated data will be removed.`
      })
      setSuccess('Deletion request sent to support. Please check your email for confirmation.')
      setShowDeleteModal(false)
      setDeleteConfirmText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send deletion request')
    } finally {
      setDeleteBusy(false)
    }
  }

  // Format "January 2024"
  const memberSince = owner?.created_at
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(owner.created_at),
      )
    : null

  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      <div className="mx-auto max-w-4xl p-6 lg:p-8">

        {/* ── Page Header ── */}
        <header className="mb-8">
          <p className="mb-1 text-[10px] uppercase tracking-widest font-bold text-[#4E79FF] font-[DM_Sans,sans-serif]">
            Owner Portal
          </p>
          <div className="mb-1 flex items-center gap-2">
            <User className="h-7 w-7 text-[#4E79FF]" />
            <h2 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">
              Profile &amp; Settings
            </h2>
          </div>
          <p className="font-medium text-[#8D8D96] font-[Manrope,sans-serif]">
            Manage your account details and contact preferences.
          </p>
        </header>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">

            {/* Section 1: Profile Overview */}
            <div
              className="rounded-2xl bg-[#101114] p-6 shadow-sm"
              style={{
                border: '1.5px solid #272839',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#4E79FF]" />
                  <h3 className="font-['Sora'] text-base font-bold text-white">Profile Overview</h3>
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

              <div className="space-y-5">
                {isEditing ? (
                  <>
                    {/* Full Name - Editable */}
                    <div>
                      <label
                        htmlFor="full-name"
                        className="mb-1.5 block text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]"
                      >
                        Full Name
                      </label>
                      <input
                        id="full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif]"
                      />
                    </div>

                    {/* Company Name - Editable */}
                    <div>
                      <label
                        htmlFor="company-name"
                        className="mb-1.5 block text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]"
                      >
                        Company Name
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company name"
                        className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <ReadOnlyField label="Full Name" value={owner?.full_name} />
                    <ReadOnlyField label="Company Name" value={owner?.company_name} />
                  </>
                )}

                {/* Login Email (Always Read-only) */}
                <ReadOnlyField label="Login Email" value={owner?.email} />
              </div>

              {isEditing && (
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#4E79FF] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#3E68EE] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans']"
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

            {/* Section 3: Organization Info */}
            <div
              className="rounded-2xl bg-[#101114] p-6 shadow-sm"
              style={{
                border: '1.5px solid #272839',
              }}
            >
              <SectionLabel icon={<Building2 className="h-4 w-4 text-[#4E79FF]" />}>
                Organization Info
              </SectionLabel>

              <div className="space-y-5">
                <ReadOnlyField
                  label="Organization Name"
                  value={owner?.organization?.name}
                />

                {/* Plan badge */}
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]">
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

                <ReadOnlyField
                  label="Country"
                  value={owner?.organization?.country_code}
                />
                <ReadOnlyField
                  label="Currency"
                  value={owner?.organization?.currency_code}
                />
                <ReadOnlyField
                  label="Member Since"
                  value={memberSince}
                />
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-6">

            {/* Section 2: Support Contact Info */}
            <div
              className="rounded-2xl bg-[#101114] p-6 shadow-sm"
              style={{
                border: '1.5px solid #272839',
              }}
            >
              <SectionLabel icon={<Phone className="h-4 w-4 text-[#4E79FF]" />}>
                Support Contact Info
              </SectionLabel>

              <p className="mb-5 text-sm leading-relaxed text-[#8D8D96] font-[Manrope,sans-serif]">
                Tenants use these contact details to reach you directly.
              </p>

              <div className="space-y-4">
                {/* Support Email */}
                <div>
                  <label
                    htmlFor="support-email"
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]"
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
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Support WhatsApp */}
                <div>
                  <label
                    htmlFor="support-whatsapp"
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#8D8D96] font-[DM_Sans,sans-serif]"
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
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Feedback messages */}
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

              {/* Show Save/Cancel buttons when editing - note: they're on Profile Overview section above */}
              {!isEditing && (
                <div className="mt-4 text-xs text-[#8D8D96] font-[Manrope,sans-serif]">
                  Click "Edit" in Profile Overview to modify your contact information.
                </div>
              )}
            </div>

            {/* Section 4: Danger Zone */}
            <div className="rounded-2xl border border-[#F25461]/30 bg-[#101114] p-6 shadow-sm">
              <SectionLabel icon={<Shield className="h-4 w-4 text-[#F25461]" />}>
                Danger Zone
              </SectionLabel>

              <p className="mb-4 text-sm leading-relaxed text-[#8D8D96] font-[Manrope,sans-serif]">
                This will permanently delete your account and all associated data. This action
                cannot be undone.
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F25461]/15 mx-auto">
            <AlertTriangle className="h-6 w-6 text-[#F25461]" />
          </div>

          <div className="text-center">
            <p className="font-semibold text-white mb-2">Are you sure?</p>
            <p className="text-sm text-[#8D8D96]">
              This will permanently delete your account and all associated properties, tenants, and data. This action cannot be undone.
            </p>
          </div>

          <div className="bg-[#141519] rounded-lg p-3">
            <p className="text-xs text-[#8D8D96] mb-2 font-['DM_Sans']">
              Type the following to confirm deletion:
            </p>
            <p className="text-sm font-bold text-white font-['Manrope']">DELETE MY ACCOUNT</p>
          </div>

          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE MY ACCOUNT"
            className="w-full rounded-lg border border-[#272839] bg-[#06070B] px-4 py-3 text-sm text-white placeholder-[#8D8D96] focus:outline-none focus:ring-2 focus:ring-[#F25461]/50 transition-all font-['Manrope']"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
              className="flex-1 rounded-lg border border-[#272839] bg-[#141519] px-4 py-2.5 text-sm font-semibold text-[#8D8D96] transition-colors hover:border-[#4E79FF]/30 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={deleteBusy || deleteConfirmText !== 'DELETE MY ACCOUNT'}
              className="flex-1 rounded-lg bg-[#F25461] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#E63D52] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteBusy ? 'Requesting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

