import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
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

export function TenantResetPasswordPage() {
  const { tenant } = useTenantAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  usePageSeo({
    title: 'Resident Reset Password',
    description: 'Set a new password for your Prophives resident account.',
  })

  if (tenant) {
    return <Navigate to={ROUTES.tenantDashboard} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('This reset link is missing a token. Request a new email and try again.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)

    try {
      const response = await api.tenantResetPassword({
        token,
        password,
      })
      setSuccessMessage(response.message)
      setPassword('')
      setConfirmPassword('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to reset password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Resident Password Reset"
      title="Set a fresh password for your resident workspace"
      description="Use the secure link from your email to replace your temporary or previous password and return to the resident workspace."
      highlights={[
        { icon: <KeyRound className="h-4 w-4" />, text: 'Choose a new password with at least 8 characters' },
        { icon: <ShieldCheck className="h-4 w-4" />, text: 'Invalid or expired reset links are rejected safely' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Your resident access ID stays the same' },
      ]}
      panelTitle="Create new resident password"
      panelDescription="Reset links expire and can only be used once."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="New Password"
          type="password"
          variant="light"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <FormInput
          label="Confirm New Password"
          type="password"
          variant="light"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {successMessage ? <div className={dashboardSuccessPanelClassName}>{successMessage}</div> : null}
        {error ? <ErrorState message={error} variant="light" /> : null}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={busy || !token}>
          {busy ? 'Updating password...' : 'Update password'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-[var(--ph-text-muted)]">
        Need a new link?{' '}
        <Link className="ph-link font-semibold" to={ROUTES.tenantForgotPassword}>
          Request another reset email
        </Link>
      </p>
      <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
        Back to{' '}
        <Link className="ph-link font-semibold" to={ROUTES.tenantLogin}>
          resident login
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
