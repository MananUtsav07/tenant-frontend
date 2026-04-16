import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail, MoveRight } from 'lucide-react'
import countryList from 'react-select-country-list'
import ReactCountryFlag from 'react-country-flag'
import Select from 'react-select'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { PasswordStrengthBar } from '../../components/common/PasswordStrengthBar'
import { getProphivesReactSelectStyles } from '../../components/common/formTheme'
import { allCountryOptions } from '../../constants/countryCurrency'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'

type Mode = 'login' | 'register'
type CountrySelectOption = {
  value: string
  label: string
  isSupported: boolean
}

type Testimonial = {
  quote: string
  author: string
  title: string
  image: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Prophives changed how I manage my property portfolio.',
    author: 'Omar K.',
    title: 'Portfolio Owner',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%234F46E5%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EOK%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'The AI insights have helped me optimize my rental strategy significantly.',
    author: 'Sarah M.',
    title: 'Real Estate Developer',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%2310B981%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3ESM%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'Managing tenant communications is now effortless with the integrated platform.',
    author: 'Ahmed Hassan',
    title: 'Property Manager',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22F59E0B%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2240%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EAH%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'The automated ticket system has reduced our support response time by 70%.',
    author: 'Layla Ahmed',
    title: 'Operations Director',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%228B5CF6%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3ELA%3C/text%3E%3C/svg%3E',
  },
  {
    quote: 'Best investment I made for my property business. Highly recommended!',
    author: 'Mohammed Ali',
    title: 'Portfolio Owner',
    image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22EC4899%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2255%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22central%22%3EMA%3C/text%3E%3C/svg%3E',
  },
]

export function OwnerLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { owner, login, register } = useOwnerAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    support_email: '',
    country_code: '',
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const supportedCountryCodes = useMemo(() => new Set(allCountryOptions.map((option) => option.code)), [])
  const countryOptions = useMemo<CountrySelectOption[]>(() => {
    const options = countryList()
      .getData()
      .map((option) => ({
        value: option.value,
        label: option.label,
        isSupported: supportedCountryCodes.has(option.value),
      }))

    const supportedOptions = options.filter((option) => option.isSupported)
    const unsupportedOptions = options
      .filter((option) => !option.isSupported)
      .sort((left, right) => left.label.localeCompare(right.label))

    return [...supportedOptions, ...unsupportedOptions]
  }, [supportedCountryCodes])

  const selectedCountry = useMemo(
    () => countryOptions.find((option) => option.value === form.country_code) ?? null,
    [countryOptions, form.country_code],
  )

  usePageSeo({
    title: 'Owner Login',
    description: 'Login or register as a property owner to run premium resident operations inside Prophives.',
  })

  if (owner) {
    return <Navigate to={ROUTES.ownerDashboard} replace />
  }

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        trackEvent('owner_login_form_submit', { user_type: 'owner' })
      } else {
        if (!form.country_code) {
          setError('Please select the country where your properties are located.')
          setBusy(false)
          return
        }

        await register({
          email: form.email,
          password: form.password,
          full_name: form.full_name || undefined,
          support_email: form.support_email || undefined,
          country_code: form.country_code,
        })
        trackEvent('owner_signup_form_submit', { user_type: 'owner' })
      }

      const next = searchParams.get('next')
      navigate(next && next.startsWith('/') ? next : ROUTES.ownerDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex flex-col md:flex-row md:min-h-screen">
      {/* Left Side: Brand Identity */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#1A3A8A] p-6 md:flex md:w-1/2">
        {/* Decorative blurs */}
        <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -mb-48 -ml-48 bottom-0 left-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        {/* Logo & Tagline */}
        <div className="relative z-10">
          <div className="mb-1 font-['Sora'] text-2xl font-black tracking-tighter text-white">Prophives</div>
          <p className="font-['DM_Sans'] text-xs font-medium uppercase tracking-wide text-white/90">
            AI-Powered Property Management
          </p>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex flex-grow items-center justify-center py-4">
          <div className="relative w-full max-w-xs" style={{ aspectRatio: '1' }}>
            <div className="absolute inset-0 rotate-3 rounded-xl bg-white/20" />
            <div className="absolute inset-0 -rotate-3 rounded-xl bg-white/10" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrcceWusQb9Uk72qkwozr8ouxL_9GqGk78y9O83igns86PzNPcC0xFn9VFMYWUr-j5T8f6jNfnJckd0eCDEYaNBgNo8UOaAj5HNxL5epgeRV_MA0bIeKyEYuxfkXN7Od-ZZLMXNoxgbjwkerfOcA3Tbx-UA9869iqvGzOqaCFJdG4rnw_64jcwB36UPpn0i6lvf0ZEMaO6Nsh8lSj15DuSX3AFJnXPD6CXEtrSkUohDh_AdM4SKSNrWzpVcIxGkuv4auboAd1AcSDE"
              alt="Property management illustration"
              className="relative z-10 h-full w-full rounded-xl object-cover opacity-80 shadow-2xl grayscale brightness-110 contrast-125 mix-blend-multiply"
            />
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 space-y-3">
          <div className="rounded-2xl border-2 border-white/20 bg-[rgba(0,0,0,0.3)] p-6 backdrop-blur-lg transition-all duration-500 hover:bg-[rgba(0,0,0,0.4)]">
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
                <p className="text-xs font-medium text-white/80">{TESTIMONIALS[currentTestimonialIndex].title}</p>
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
      </section>

      {/* Right Side: Interaction Area */}
      <section className="flex w-full flex-col items-center justify-start bg-[#06070B] p-4 md:justify-center md:w-1/2 md:p-8 md:min-h-screen lg:p-12">
        <div className="w-full max-w-md pt-0 md:pt-0">
          {/* Mobile brand */}
          <div className="mb-4 md:hidden">
            <span className="font-['Sora'] text-2xl font-black text-[#4E79FF]">Prophives</span>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-6 border-b border-[#272839]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null) }}
              className={`relative pb-4 font-['Sora'] font-bold transition-colors ${
                mode === 'login' ? 'text-white' : 'text-[#8D8D96] hover:text-white'
              }`}
            >
              Login
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#2251E3]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null) }}
              className={`relative pb-4 font-['Sora'] font-bold transition-colors ${
                mode === 'register' ? 'text-white' : 'text-[#8D8D96] hover:text-white'
              }`}
            >
              Register
              {mode === 'register' && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#2251E3]" />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="mb-5">
            <h1 className="font-['Sora'] text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-0.5 font-['Manrope'] text-sm text-[#8D8D96]">
              {mode === 'login'
                ? 'Access your property dashboard and AI insights.'
                : 'Set up your Prophives owner workspace.'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="mb-2 block font-['DM_Sans'] text-sm font-bold text-white">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8D8D96]" />
                <input
                  type="email"
                  name="owner_email"
                  autoComplete="email"
                  placeholder="owner@example.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#272839] bg-[#101114] py-3 pl-12 pr-4 font-['Manrope'] text-white placeholder-[#8D8D96] transition-all focus:border-[#2251E3] focus:outline-none focus:ring-2 focus:ring-[rgba(34,81,227,0.2)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-['DM_Sans'] text-sm font-bold text-white">Password</label>
                {mode === 'login' && (
                  <Link
                    to={ROUTES.ownerForgotPassword}
                    className="font-['DM_Sans'] text-sm font-bold text-[#4E79FF] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8D8D96]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="owner_password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#272839] bg-[#101114] py-3 pl-12 pr-12 font-['Manrope'] text-white placeholder-[#8D8D96] transition-all focus:border-[#2251E3] focus:outline-none focus:ring-2 focus:ring-[rgba(34,81,227,0.2)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D8D96] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === 'register' && form.password && <PasswordStrengthBar password={form.password} />}
            </div>

            {/* Register extra fields */}
            {mode === 'register' && (
              <>
                <FormInput
                  label="Full Name"
                  variant="dark"
                  name="owner_full_name"
                  autoComplete="name"
                  placeholder="John Smith"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                />
                <FormInput
                  label="Support Email"
                  type="email"
                  variant="dark"
                  name="owner_support_email"
                  autoComplete="email"
                  placeholder="support@yourcompany.com"
                  value={form.support_email}
                  onChange={(e) => updateField('support_email', e.target.value)}
                />

                <label className="block space-y-2">
                  <span className="font-['DM_Sans'] text-sm font-bold text-white">
                    Country where your properties are located
                  </span>
                  <Select<CountrySelectOption, false>
                    inputId="owner_country_code"
                    name="owner_country_code"
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(option) => updateField('country_code', option?.value ?? '')}
                    placeholder="Search and select your country..."
                    noOptionsMessage={() => 'No country found'}
                    isSearchable
                    styles={getProphivesReactSelectStyles<CountrySelectOption, false>('dark')}
                    formatOptionLabel={(option) => (
                      <span className="flex items-center gap-2">
                        <ReactCountryFlag
                          countryCode={option.value}
                          svg
                          aria-label={option.label}
                          style={{ width: '1.1em', height: '1.1em' }}
                        />
                        <span>{option.label}</span>
                      </span>
                    )}
                  />
                  <span className="text-xs text-[#8D8D96] leading-tight">
                    Used to set your rent currency and regional pricing.
                  </span>
                </label>
              </>
            )}

            {/* Remember me (login only) */}
            {mode === 'login' && (
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer rounded border-[#272839] text-[#2251E3] focus:ring-[#2251E3] bg-[#101114]"
                />
                <label
                  htmlFor="remember"
                  className="ml-3 cursor-pointer select-none font-['Manrope'] text-sm font-medium text-[#8D8D96]"
                >
                  Remember me for 30 days
                </label>
              </div>
            )}

            {error && <ErrorState message={error} variant="light" />}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-[#2251E3] py-3 font-['Sora'] font-bold text-white shadow-lg shadow-[#2251E3]/25 transition-all hover:bg-[#4E79FF] active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
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

            {/* Login as Tenant link */}
            <div className="text-center">
              <Link
                to={ROUTES.tenantLogin}
                className="group inline-flex items-center gap-1.5 font-['DM_Sans'] text-xs font-bold text-white transition-colors hover:text-[#4E79FF]"
              >
                Login as Tenant
                <MoveRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </form>

        </div>
      </section>
    </main>
  )
}
