import { useState } from 'react'
import { Building2, Mail, Phone, Save, Shield, User } from 'lucide-react'

import { ErrorState } from '../../components/common/ErrorState'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'

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

  const [supportEmail, setSupportEmail] = useState(owner?.support_email ?? '')
  const [supportWhatsapp, setSupportWhatsapp] = useState(owner?.support_whatsapp ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      setSuccess('Contact info updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
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
              <SectionLabel icon={<User className="h-4 w-4 text-[#4E79FF]" />}>
                Profile Overview
              </SectionLabel>

              <div className="space-y-5">
                <ReadOnlyField label="Full Name" value={owner?.full_name} />
                <ReadOnlyField label="Company Name" value={owner?.company_name} />
                <ReadOnlyField label="Login Email" value={owner?.email} />
              </div>

              <div className="mt-5 rounded-xl bg-[#141519] px-4 py-3 text-xs leading-relaxed text-[#4E79FF] font-[Manrope,sans-serif]">
                Contact support to update your name, company, or login email.
              </div>
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
                    placeholder="support@yourcompany.com"
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif]"
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
                    placeholder="+1 234 567 8900"
                    className="w-full rounded-xl border border-[#272839] bg-[#06070B] px-4 py-3 text-sm font-medium text-white placeholder-[#6B7280]/60 transition-all focus:border-[#4E79FF] focus:outline-none focus:ring-2 focus:ring-[#4E79FF]/30 font-[Manrope,sans-serif]"
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

              {/* Save button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#2251E3] px-8 py-3 font-['Sora'] font-bold text-white shadow-md transition-all hover:bg-[#3E68EE] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
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

              <p className="mb-4 text-xs text-[#8D8D96] font-[Manrope,sans-serif]">
                Contact{' '}
                <a
                  href="mailto:support@prohives.com"
                  className="font-semibold text-[#F25461] underline underline-offset-2 hover:text-[#F25461]"
                >
                  support@prohives.com
                </a>{' '}
                to request account deletion.
              </p>

              <button
                type="button"
                disabled
                title="Contact support to delete your account"
                className="cursor-not-allowed rounded-xl border border-[#F25461]/30 bg-[#F25461]/15 px-6 py-2.5 text-sm font-bold text-[#F25461] opacity-60 font-['Sora']"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

