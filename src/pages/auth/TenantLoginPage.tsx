import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, MessageCircle, Send, User } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'

export function TenantLoginPage() {
  const navigate = useNavigate()
  const { tenant, login } = useTenantAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantAccessId, setTenantAccessId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
      await login(tenantAccessId, password, undefined)
      trackEvent('tenant_login_form_submit', { user_type: 'tenant' })
      navigate(ROUTES.tenantDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFAEF] font-['Manrope'] text-[#1A1A1A] antialiased">
      <main className="flex flex-1 flex-col md:flex-row">
        {/* Left Side: Visual & Branding (40%) */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#FEFAEF] p-12 md:flex md:w-[40%] lg:p-16">
          {/* Brand Logo */}
          <div className="z-10">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-[#FED609]">Prophives</span>
          </div>

          {/* Hero Content */}
          <div className="z-10 max-w-md">
            <h1 className="mb-6 font-['Sora'] text-4xl font-extrabold leading-tight text-[#1A1A1A] lg:text-5xl">
              Welcome Back, Tenant
            </h1>
            <p className="text-lg font-medium leading-relaxed text-[#6B7280]">
              Access your property details, payments, and support in one seamless AI-powered experience.
            </p>
          </div>

          {/* Illustration Area */}
          <div className="relative z-10 mx-auto w-full max-w-sm" style={{ aspectRatio: '1' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwmokeBToTZN3roK3mkhXYj_uxCe1Ye7cpLUxXKjMDznbRs6yEaLkVW4pP9KFk6nZKRHttuyCfby9uFJo4aQTJahHjRjsFiTxZ8EFD8GRlQ4HLRw2bmFJfO08cmLZVImIXrqUM5aEbFCvBmbRXEM-Jm5KelDjLLqpEE1QzqFgoaDlaFP4WgD4QU-pddubSzQ5m29XrtmguORCDU-2hGor6BIUY3yBCzhIYaaLBIulGNYzip0aNB-tK1IlUSSv3ohYf7qrb-6aXVghZ"
              alt="Modern apartment illustration"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Decorative background element */}
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FED609]/10 blur-3xl" />
        </section>

        {/* Right Side: Login Form (60%) */}
        <section className="flex w-full flex-col items-center justify-center bg-white p-8 md:w-[60%] lg:p-12">
          {/* Mobile Logo */}
          <div className="mb-12 md:hidden">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-[#FED609]">Prophives</span>
          </div>

          <div className="w-full max-w-2xl px-4 md:px-0">
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
              <h2 className="mb-3 font-['Sora'] text-3xl font-bold text-[#1A1A1A] lg:text-4xl">Tenant Login</h2>
              <p className="font-['DM_Sans'] text-lg text-[#6B7280]">Enter your credentials to manage your home.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Tenant Code / ID */}
              <div className="space-y-3">
                <label
                  htmlFor="tenant-id"
                  className="block font-['DM_Sans'] text-base font-bold text-[#1A1A1A]"
                >
                  Tenant Code / ID
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[#6B7280] transition-colors group-focus-within:text-[#FED609]">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="tenant-id"
                    type="text"
                    name="tenant_access_id"
                    autoComplete="username"
                    placeholder="e.g. PH-88291"
                    value={tenantAccessId}
                    onChange={(e) => setTenantAccessId(e.target.value)}
                    required
                    className="block w-full rounded-xl border-transparent bg-[#FEFAEF] py-5 pl-14 pr-4 font-['Manrope'] text-lg text-[#1A1A1A] outline-none transition-all focus:border-[#FED609] focus:ring-2 focus:ring-[#FED609]/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block font-['DM_Sans'] text-base font-bold text-[#1A1A1A]"
                  >
                    Password
                  </label>
                  <Link
                    to={ROUTES.tenantForgotPassword}
                    className="font-['DM_Sans'] text-base font-semibold text-[#FED609] transition-colors hover:text-[#FFD70B]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[#6B7280] transition-colors group-focus-within:text-[#FED609]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="tenant_password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border-transparent bg-[#FEFAEF] py-5 pl-14 pr-14 font-['Manrope'] text-lg text-[#1A1A1A] outline-none transition-all focus:border-[#FED609] focus:ring-2 focus:ring-[#FED609]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-[#6B7280] hover:text-[#1A1A1A]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-6 w-6 rounded border-[#FEFAEF] text-[#FED609] focus:ring-[#FED609]"
                />
                <label
                  htmlFor="remember"
                  className="ml-4 cursor-pointer select-none font-['DM_Sans'] text-base font-medium text-[#6B7280]"
                >
                  Remember me on this device
                </label>
              </div>

              {error && <ErrorState message={error} variant="light" />}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#FED609] px-8 py-5 font-['Sora'] text-xl font-bold text-[#1A1A1A] shadow-lg shadow-[#FED609]/20 transition-all duration-200 hover:bg-[#FFD70B] active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? 'Please wait...' : 'Sign In'}
              </button>
            </form>

            {/* Support & Footer Actions */}
            <div className="mt-16 border-t border-[#FEFAEF] pt-10 text-center md:text-left">
              <p className="mb-8 font-['DM_Sans'] text-base font-medium text-[#6B7280]">
                Need help?{' '}
                <Link
                  to={ROUTES.ownerLogin}
                  className="font-bold text-[#1A1A1A] underline decoration-[#FED609]/30 underline-offset-4 transition-colors hover:text-[#FED609]"
                >
                  Contact your property owner
                </Link>
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full border border-gray-100 px-8 py-3.5 font-['DM_Sans'] text-sm font-bold text-[#6B7280] transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#25D366]"
                >
                  <MessageCircle className="h-6 w-6" />
                  WhatsApp Support
                </a>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-full border border-gray-100 px-8 py-3.5 font-['DM_Sans'] text-sm font-bold text-[#6B7280] transition-all hover:border-[#0088cc]/30 hover:bg-[#0088cc]/5 hover:text-[#0088cc]"
                >
                  <Send className="h-6 w-6" />
                  Telegram Channel
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#FED609]/20 bg-[#FEFAEF]">
        <div className="mx-auto flex w-full max-w-none flex-col items-center justify-between gap-4 px-8 py-6 md:flex-row">
          <div className="mb-4 md:mb-0">
            <span className="font-['Sora'] text-lg font-bold text-[#1A1A1A]">Prophives</span>
          </div>
          <p className="mb-4 font-['Manrope'] text-sm text-[#6B7280] md:mb-0">
            © 2024 Prophives Property Management. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="font-['Manrope'] text-sm text-[#6B7280] underline decoration-[#FED609] underline-offset-4 transition-all duration-300 hover:text-[#FED609]"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="font-['Manrope'] text-sm text-[#6B7280] underline decoration-[#FED609] underline-offset-4 transition-all duration-300 hover:text-[#FED609]"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="font-['Manrope'] text-sm text-[#6B7280] underline decoration-[#FED609] underline-offset-4 transition-all duration-300 hover:text-[#FED609]"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
