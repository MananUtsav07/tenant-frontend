import { KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout'
import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { dashboardSuccessPanelClassName } from '../../components/common/formTheme'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'

export function TenantForgotPasswordPage() {
  const { tenant } = useTenantAuth()
  const [tenantAccessId, setTenantAccessId] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  usePageSeo({
    title: 'Resident Forgot Password',
    description: 'Request a secure Prophives resident password reset email.',
  })

  if (tenant) {
    return <Navigate to={ROUTES.tenantDashboard} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const response = await api.tenantForgotPassword({
        tenant_access_id: tenantAccessId,
        email,
      })
      setSuccessMessage(response.message)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to request password reset')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Resident Password Access"
      title="Recover your resident workspace securely"
      description="Use your tenant access ID and the email saved on your resident profile to request a secure Prophives password reset."
      highlights={[
        { icon: <KeyRound className="h-4 w-4" />, text: 'Use the tenant access ID issued by your property team' },
        { icon: <Mail className="h-4 w-4" />, text: 'Reset links are sent to the resident email on file' },
        { icon: <ShieldCheck className="h-4 w-4" />, text: 'Links expire automatically and can only be used once' },
      ]}
      panelTitle="Request resident reset link"
      panelDescription="Enter the access ID and email tied to your resident profile."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Tenant Access ID"
          variant="light"
          autoComplete="username"
          value={tenantAccessId}
          onChange={(event) => setTenantAccessId(event.target.value)}
          required
        />
        <FormInput
          label="Resident Email"
          type="email"
          variant="light"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        {successMessage ? <div className={dashboardSuccessPanelClassName}>{successMessage}</div> : null}
        {error ? <ErrorState message={error} variant="light" /> : null}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={busy}>
          {busy ? 'Sending reset link...' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-[var(--ph-text-muted)]">
        Back to{' '}
        <Link className="ph-link font-semibold" to={ROUTES.tenantLogin}>
          resident login
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
