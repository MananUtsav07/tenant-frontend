import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck, Sparkles } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { SEO } from '../../components/common/SEO'
import { SectionContainer } from '../../components/common/SectionContainer'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { admin, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (admin) {
    return <Navigate to={ROUTES.adminDashboard} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email, password)
      trackEvent('admin_login_form_submit', {
        user_type: 'admin',
      })
      navigate(ROUTES.adminDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Admin login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionContainer size="wide" className="py-12">
      <SEO
        title="Admin Login"
        description="Secure admin access for Prophives platform operations."
        canonicalPath={ROUTES.adminLogin}
      />

      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="ph-surface-navy ph-hex-bg rounded-xl p-6 sm:p-7">
          <span className="ph-kicker">Admin Console</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)]">Platform oversight for growth, health, and governance</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)]">
            Access the Prophives observatory to monitor organizations, analytics, content, and operational health from one secure console.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ph-text-soft)]">
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
              Secure administrative access
            </p>
            <p className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ph-accent)]" />
              Visibility across organizations, support activity, and analytics
            </p>
          </div>
        </div>

        <div className="ph-surface-card-strong rounded-xl p-7">
          <h2 className="ph-title inline-flex items-center gap-2 text-3xl font-semibold text-[var(--ph-text)]">
            <ShieldCheck className="h-6 w-6 text-[var(--ph-accent)]" />
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Login to manage platform operations, content, and analytics.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Admin Email"
              type="email"
              variant="light"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <FormInput
              label="Password"
              type="password"
              variant="light"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error ? <ErrorState message={error} variant="light" /> : null}

            <Button type="submit" disabled={busy} variant="primary" className="w-full justify-center">
              {busy ? 'Please wait...' : 'Login to Admin Console'}
            </Button>
          </form>
        </div>
      </div>
    </SectionContainer>
  )
}
