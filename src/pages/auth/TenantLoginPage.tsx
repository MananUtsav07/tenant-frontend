import { useState, useEffect, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'

type Testimonial = {
  quote: string
  author: string
  title: string
  image: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Prophives makes managing my apartment so much easier!',
    author: 'Fatima Al-Mansouri',
    title: 'Tenant',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%2306B6D4%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2244%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EFM%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'Quick and seamless ticket support whenever I need it.',
    author: 'Rashid Ahmed',
    title: 'Resident',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%2314B8A6%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3ERA%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'Love how easy it is to access my lease and payment history.',
    author: 'Noor Hassan',
    title: 'Tenant',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%238B5CF6%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3ENH%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'The platform is intuitive and customer support is responsive.',
    author: 'Ibrahim Al-Marri',
    title: 'Resident',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23F59E0B%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2244%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EIM%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'Best app for managing my rental payments and maintenance requests!',
    author: 'Aisha Mohammed',
    title: 'Tenant',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23EF4444%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2244%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EAM%3C/text%3E%3C/svg%3E',
  },
]

export function TenantLoginPage() {
  const navigate = useNavigate()
  const { tenant, login } = useTenantAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantAccessId, setTenantAccessId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="flex min-h-screen flex-col bg-[#06070B] font-['Manrope'] text-white antialiased">
      <main className="flex flex-col md:flex-row md:flex-1">
        {/* Left Side: Visual & Branding (40%) */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#1A3A8A] p-6 md:flex md:w-[40%]">
          {/* Brand Logo */}
          <div className="z-10">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-white">Prophives</span>
          </div>

          {/* Hero Content */}
          <div className="z-10 max-w-sm">
            <h1 className="mb-3 font-['Sora'] text-2xl font-extrabold leading-tight text-white">
              Welcome Back, Tenant
            </h1>
            <p className="text-sm font-medium leading-relaxed text-white/80">
              Access your property details, payments, and support in one seamless AI-powered experience.
            </p>
          </div>

          {/* Illustration Area */}
          <div className="relative z-10 mx-auto w-full max-w-xs py-4" style={{ aspectRatio: '1' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwmokeBToTZN3roK3mkhXYj_uxCe1Ye7cpLUxXKjMDznbRs6yEaLkVW4pP9KFk6nZKRHttuyCfby9uFJo4aQTJahHjRjsFiTxZ8EFD8GRlQ4HLRw2bmFJfO08cmLZVImIXrqUM5aEbFCvBmbRXEM-Jm5KelDjLLqpEE1QzqFgoaDlaFP4WgD4QU-pddubSzQ5m29XrtmguORCDU-2hGor6BIUY3yBCzhIYaaLBIulGNYzip0aNB-tK1IlUSSv3ohYf7qrb-6aXVghZ"
              alt="Modern apartment illustration"
              className="h-full w-full object-contain opacity-90"
            />
          </div>

          {/* Testimonial */}
          <div className="relative z-10 space-y-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition-all duration-500 hover:bg-white/15">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-[#4E79FF]" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 line-clamp-3 font-['Sora'] text-sm font-semibold leading-relaxed italic text-white">
                "{TESTIMONIALS[currentTestimonialIndex].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/20 shadow-lg">
                  <img
                    src={TESTIMONIALS[currentTestimonialIndex].image}
                    alt={TESTIMONIALS[currentTestimonialIndex].author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-['DM_Sans'] text-sm font-bold text-white">
                    {TESTIMONIALS[currentTestimonialIndex].author}
                  </p>
                  <p className="text-xs font-medium text-white/75">{TESTIMONIALS[currentTestimonialIndex].title}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTestimonialIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#4E79FF]/20 blur-3xl" />
        </section>

        {/* Right Side: Login Form (60%) */}
        <section className="flex w-full flex-col items-center justify-start bg-[#06070B] p-4 md:justify-center md:w-[60%] md:p-8 md:min-h-screen">
          {/* Mobile Logo */}
          <div className="mb-4 md:hidden">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-[#4E79FF]">Prophives</span>
          </div>

          <div className="w-full max-w-md px-4 md:px-0">
            {/* Header */}
            <div className="mb-5 text-center md:text-left">
              <h2 className="mb-1 font-['Sora'] text-2xl font-bold text-white">Tenant Login</h2>
              <p className="font-['DM_Sans'] text-sm text-[#8D8D96]">Enter your credentials to manage your home.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Tenant Code / ID */}
              <div className="space-y-2">
                <label
                  htmlFor="tenant-id"
                  className="block font-['DM_Sans'] text-sm font-bold text-white"
                >
                  Tenant Code / ID
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[#8D8D96] transition-colors group-focus-within:text-[#4E79FF]">
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
                    className="block w-full rounded-lg border border-[#272839] bg-[#101114] py-3 pl-11 pr-4 font-['Manrope'] text-sm text-white placeholder-[#8D8D96] outline-none transition-all focus:border-[#2251E3] focus:ring-2 focus:ring-[rgba(34,81,227,0.2)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block font-['DM_Sans'] text-sm font-bold text-white"
                  >
                    Password
                  </label>
                  <Link
                    to={ROUTES.tenantForgotPassword}
                    className="font-['DM_Sans'] text-xs font-semibold text-[#4E79FF] transition-colors hover:text-[#2251E3]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[#8D8D96] transition-colors group-focus-within:text-[#4E79FF]">
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
                    className="block w-full rounded-lg border border-[#272839] bg-[#101114] py-3 pl-11 pr-11 font-['Manrope'] text-sm text-white placeholder-[#8D8D96] outline-none transition-all focus:border-[#2251E3] focus:ring-2 focus:ring-[rgba(34,81,227,0.2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-[#8D8D96] hover:text-white"
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
                  className="h-4 w-4 rounded border-[#272839] bg-[#101114] text-[#2251E3] focus:ring-[#2251E3]"
                />
                <label
                  htmlFor="remember"
                  className="ml-3 cursor-pointer select-none font-['DM_Sans'] text-xs font-medium text-[#8D8D96]"
                >
                  Remember me on this device
                </label>
              </div>

              {error && <ErrorState message={error} variant="light" />}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-[#2251E3] py-3 font-['Sora'] font-bold text-white shadow-lg shadow-[rgba(34,81,227,0.3)] transition-all duration-200 hover:bg-[#4E79FF] active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? 'Please wait...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative py-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#272839]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#06070B] px-4 font-['DM_Sans'] font-bold tracking-widest text-[#8D8D96]">or</span>
                </div>
              </div>

              {/* Login as Owner link */}
              <div className="text-center">
                <Link
                  to={ROUTES.ownerLogin}
                  className="group inline-flex items-center gap-1.5 font-['DM_Sans'] text-xs font-bold text-[#C0C0C5] transition-colors hover:text-[#4E79FF]"
                >
                  Login as Owner
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
