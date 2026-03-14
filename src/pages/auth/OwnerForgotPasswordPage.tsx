import { Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'

import { AuthSplitLayout } from '../../components/auth/AuthSplitLayout'
import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { dashboardSuccessPanelClassName } from '../../components/common/formTheme'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'

export function OwnerForgotPasswordPage() {
  const { owner } = useOwnerAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  usePageSeo({
    title: 'Owner Forgot Password',
    description: 'Request a secure Prophives owner password reset email.',
  })

  if (owner) {
    return <Navigate to={ROUTES.ownerDashboard} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const response = await api.ownerForgotPassword({ email })
      setSuccessMessage(response.message)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to request password reset')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Owner Password Access"
      title="Recover your owner workspace without breaking the flow"
      description="Request a secure reset link for the Prophives owner command center. We keep the experience calm, secure, and discreet."
      highlights={[
        { icon: <Mail className="h-4 w-4" />, text: 'Reset links are delivered to the owner email on file' },
        { icon: <ShieldCheck className="h-4 w-4" />, text: 'Links are single-use and expire automatically' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Existing owner login and organization access stay intact' },
      ]}
      panelTitle="Request reset link"
      panelDescription="Enter the owner email used for login and we’ll send a secure reset link if the account exists."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Owner Email"
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
        Remembered it?{' '}
        <Link className="ph-link font-semibold" to={ROUTES.ownerLogin}>
          Back to owner login
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
