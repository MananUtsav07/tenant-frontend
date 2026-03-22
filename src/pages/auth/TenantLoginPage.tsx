import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, LogIn, ShieldCheck } from 'lucide-react'
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
    title: 'Resident Login',
    description: 'Access your Prophives resident workspace using your tenant access ID and password.',
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
    <SectionContainer size="wide" className="py-12">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce} className="ph-surface-navy ph-hex-bg rounded-xl p-6 sm:p-7">
          <span className="ph-kicker">Resident Workspace</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)]">A cleaner support and rent experience for residents</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)]">
            Use your access ID to enter the Prophives resident workspace, view rent status, and follow support activity without operational noise.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ph-text-soft)]">
            <p className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[var(--ph-accent)]" />
              Secure resident access through owner-issued credentials
            </p>
            <p className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4 text-[var(--ph-accent)]" />
              Support requests, rent actions, and property detail visibility
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
              Separate resident workspace with no owner-level exposure
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="ph-surface-card-strong rounded-xl p-7"
        >
          <h2 className="ph-title text-3xl font-semibold text-[var(--ph-text)]">Resident Login</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Access your property support workspace.</p>

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

            <div className="-mt-1 flex justify-end">
              <Link className="ph-link text-sm font-semibold" to={ROUTES.tenantForgotPassword}>
                Forgot password?
              </Link>
            </div>

            {error ? <ErrorState message={error} variant="light" /> : null}

            <Button
              type="submit"
              disabled={busy}
              variant="primary"
              className="w-full justify-center"
              iconLeft={<LogIn className="h-4 w-4" />}
            >
              {busy ? 'Please wait...' : 'Login'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-[var(--ph-text-muted)]">
            Owner?{' '}
            <Link className="ph-link font-semibold" to={ROUTES.ownerLogin}>
              Login here
            </Link>
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-xs text-[var(--ph-text-muted)]">
            <KeyRound className="h-3.5 w-3.5 text-[var(--ph-accent)]" />
            Use the access ID shared by your property owner.
          </p>
        </motion.div>
      </div>
    </SectionContainer>
  )
}
