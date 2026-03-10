import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, LogIn } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { SectionContainer } from '../../components/common/SectionContainer'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'
import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'

export function TenantLoginPage() {
  const navigate = useNavigate()
  const { tenant, login } = useTenantAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantAccessId, setTenantAccessId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const revealVariants = useMotionVariants(revealUp)

  usePageSeo({
    title: 'Tenant Login',
    description: 'Login to the tenant portal using your tenant access ID and password.',
  })

  if (tenant) {
    return <Navigate to={ROUTES.tenantDashboard} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      await login(tenantAccessId, password, email || undefined)
      trackEvent('tenant_login_form_submit', {
        user_type: 'tenant',
      })
      navigate(ROUTES.tenantDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionContainer className="py-12">
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)]"
      >
        <h1 className="font-[Space_Grotesk] text-3xl font-semibold text-slate-900">Tenant Login</h1>
        <p className="mt-2 text-sm text-slate-600">Access your property support dashboard.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Tenant Access ID"
            variant="light"
            name="tenant_access_id"
            autoComplete="username"
            value={tenantAccessId}
            onChange={(event) => setTenantAccessId(event.target.value)}
            required
          />
          <FormInput
            label="Email (optional)"
            type="email"
            variant="light"
            name="tenant_email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FormInput
            label="Password"
            type="password"
            variant="light"
            name="tenant_password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <ErrorState message={error} variant="light" /> : null}

          <Button
            type="submit"
            disabled={busy}
            variant="secondary"
            className="w-full justify-center"
            iconLeft={<LogIn className="h-4 w-4" />}
          >
            {busy ? 'Please wait...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Owner?{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-600" to={ROUTES.ownerLogin}>
            Login here
          </Link>
        </p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          <KeyRound className="h-3.5 w-3.5 text-blue-700" />
          Use the tenant access ID shared by your property owner.
        </p>
      </motion.div>
    </SectionContainer>
  )
}


