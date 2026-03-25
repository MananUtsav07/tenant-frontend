import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, LogIn, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
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
    <div className="flex min-h-screen">
      {/* Left side — cream/gold branding panel */}
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="hidden w-[45%] flex-col justify-between bg-[#FEFAEF] p-10 lg:flex xl:p-14"
      >
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">Resident Workspace</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-[#1A1A1A] xl:text-5xl">
            A cleaner support and rent experience for residents
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#6B7280]">
            Use your access ID to enter the Prophives resident workspace, view rent status, and follow support activity without operational noise.
          </p>
        </div>

        <div className="space-y-3 text-sm text-[#1A1A1A]/70">
          <p className="inline-flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#92700A]" />
            Secure resident access through owner-issued credentials
          </p>
          <p className="inline-flex items-center gap-2">
            <LogIn className="h-4 w-4 text-[#92700A]" />
            Support requests, rent actions, and property detail visibility
          </p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#92700A]" />
            Separate resident workspace with no owner-level exposure
          </p>
        </div>
      </motion.div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Resident Login</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Access your property support workspace.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              {busy ? 'Please wait...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-[#6B7280]">
            Owner?{' '}
            <Link className="font-semibold text-[#1A1A1A] underline decoration-[#FED609] decoration-2 underline-offset-2 hover:text-[#92700A]" to={ROUTES.ownerLogin}>
              Login here
            </Link>
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FEFAEF] px-4 py-2.5 text-xs text-[#6B7280]">
            <KeyRound className="h-3.5 w-3.5 text-[#92700A]" />
            Use the access ID shared by your property owner.
          </div>

          {/* Support links */}
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#25D366]/30 bg-[#25D366]/5 px-3.5 py-2 text-xs font-medium text-[#25D366] transition hover:bg-[#25D366]/10"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Support
            </a>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#0088cc]/30 bg-[#0088cc]/5 px-3.5 py-2 text-xs font-medium text-[#0088cc] transition hover:bg-[#0088cc]/10"
            >
              <Send className="h-3.5 w-3.5" />
              Telegram Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
