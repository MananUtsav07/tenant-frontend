import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

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
    <SectionContainer className="py-12">
      <SEO
        title="Admin Login"
        description="Secure admin access for TenantFlow platform operations."
        canonicalPath={ROUTES.adminLogin}
      />
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)]">
        <h1 className="inline-flex items-center gap-2 font-[Space_Grotesk] text-3xl font-semibold text-slate-900">
          <ShieldCheck className="h-6 w-6 text-blue-700" />
          Admin Access
        </h1>
        <p className="mt-2 text-sm text-slate-600">Login to manage platform operations, content, and analytics.</p>

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

          <Button type="submit" disabled={busy} variant="secondary" className="w-full justify-center">
            {busy ? 'Please wait...' : 'Login to Admin Portal'}
          </Button>
        </form>
      </div>
    </SectionContainer>
  )
}


