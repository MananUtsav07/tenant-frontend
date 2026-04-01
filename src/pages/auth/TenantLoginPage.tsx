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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC',
  },
  {
    quote: 'Quick and seamless ticket support whenever I need it.',
    author: 'Rashid Ahmed',
    title: 'Resident',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC',
  },
  {
    quote: 'Love how easy it is to access my lease and payment history.',
    author: 'Noor Hassan',
    title: 'Tenant',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC',
  },
  {
    quote: 'The platform is intuitive and customer support is responsive.',
    author: 'Ibrahim Al-Marri',
    title: 'Resident',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC',
  },
  {
    quote: 'Best app for managing my rental payments and maintenance requests!',
    author: 'Aisha Mohammed',
    title: 'Tenant',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC',
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
    <div className="flex min-h-screen flex-col bg-[#FEFAEF] font-['Manrope'] text-[#1A1A1A] antialiased">
      <main className="flex flex-col md:flex-row md:flex-1">
        {/* Left Side: Visual & Branding (40%) */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#FEFAEF] p-6 md:flex md:w-[40%]">
          {/* Brand Logo */}
          <div className="z-10">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-[#FED609]">Prophives</span>
          </div>

          {/* Hero Content */}
          <div className="z-10 max-w-sm">
            <h1 className="mb-3 font-['Sora'] text-2xl font-extrabold leading-tight text-[#1A1A1A]">
              Welcome Back, Tenant
            </h1>
            <p className="text-sm font-medium leading-relaxed text-[#6B7280]">
              Access your property details, payments, and support in one seamless AI-powered experience.
            </p>
          </div>

          {/* Illustration Area */}
          <div className="relative z-10 mx-auto w-full max-w-xs py-4" style={{ aspectRatio: '1' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwmokeBToTZN3roK3mkhXYj_uxCe1Ye7cpLUxXKjMDznbRs6yEaLkVW4pP9KFk6nZKRHttuyCfby9uFJo4aQTJahHjRjsFiTxZ8EFD8GRlQ4HLRw2bmFJfO08cmLZVImIXrqUM5aEbFCvBmbRXEM-Jm5KelDjLLqpEE1QzqFgoaDlaFP4WgD4QU-pddubSzQ5m29XrtmguORCDU-2hGor6BIUY3yBCzhIYaaLBIulGNYzip0aNB-tK1IlUSSv3ohYf7qrb-6aXVghZ"
              alt="Modern apartment illustration"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Testimonial */}
          <div className="relative z-10 space-y-3">
            <div className="rounded-2xl border-2 border-white/40 bg-linear-to-br from-black/60 to-black/50 p-6 backdrop-blur-lg transition-all duration-500 hover:bg-black/70">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-yellow-300" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 line-clamp-3 font-['Sora'] text-sm font-semibold leading-relaxed italic text-white">
                "{TESTIMONIALS[currentTestimonialIndex].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-300/50 bg-white/20 shadow-lg">
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
                  <p className="text-xs font-medium text-white/90">{TESTIMONIALS[currentTestimonialIndex].title}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTestimonialIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FED609]/10 blur-3xl" />
        </section>

        {/* Right Side: Login Form (60%) */}
        <section className="flex w-full flex-col items-center justify-start bg-white p-4 md:justify-center md:w-[60%] md:p-8 md:min-h-screen">
          {/* Mobile Logo */}
          <div className="mb-4 md:hidden">
            <span className="font-['Sora'] text-2xl font-black tracking-tight text-[#FED609]">Prophives</span>
          </div>

          <div className="w-full max-w-md px-4 md:px-0">
            {/* Header */}
            <div className="mb-5 text-center md:text-left">
              <h2 className="mb-1 font-['Sora'] text-2xl font-bold text-[#1A1A1A]">Tenant Login</h2>
              <p className="font-['DM_Sans'] text-sm text-[#6B7280]">Enter your credentials to manage your home.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Tenant Code / ID */}
              <div className="space-y-2">
                <label
                  htmlFor="tenant-id"
                  className="block font-['DM_Sans'] text-sm font-bold text-[#1A1A1A]"
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
                    className="block w-full rounded-lg border-transparent bg-[#FEFAEF] py-3 pl-11 pr-4 font-['Manrope'] text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#FED609] focus:ring-2 focus:ring-[#FED609]/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block font-['DM_Sans'] text-sm font-bold text-[#1A1A1A]"
                  >
                    Password
                  </label>
                  <Link
                    to={ROUTES.tenantForgotPassword}
                    className="font-['DM_Sans'] text-xs font-semibold text-[#FED609] transition-colors hover:text-[#FFD70B]"
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
                    className="block w-full rounded-lg border-transparent bg-[#FEFAEF] py-3 pl-11 pr-11 font-['Manrope'] text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#FED609] focus:ring-2 focus:ring-[#FED609]/20"
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
                  className="h-4 w-4 rounded border-[#FEFAEF] text-[#FED609] focus:ring-[#FED609]"
                />
                <label
                  htmlFor="remember"
                  className="ml-3 cursor-pointer select-none font-['DM_Sans'] text-xs font-medium text-[#6B7280]"
                >
                  Remember me on this device
                </label>
              </div>

              {error && <ErrorState message={error} variant="light" />}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-[#FED609] py-3 font-['Sora'] font-bold text-[#1A1A1A] shadow-lg shadow-[#FED609]/20 transition-all duration-200 hover:bg-[#FFD70B] active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? 'Please wait...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative py-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#FEFAEF]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 font-['DM_Sans'] font-bold tracking-widest text-[#6B7280]">or</span>
                </div>
              </div>

              {/* Login as Owner link */}
              <div className="text-center">
                <Link
                  to={ROUTES.ownerLogin}
                  className="group inline-flex items-center gap-1.5 font-['DM_Sans'] text-xs font-bold text-[#1A1A1A] transition-colors hover:text-[#FFD70B]"
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
