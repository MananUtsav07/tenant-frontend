import { useMemo, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail, MessageCircle, MoveRight, Send } from 'lucide-react'
import countryList from 'react-select-country-list'
import ReactCountryFlag from 'react-country-flag'
import Select from 'react-select'
import { Link, Navigate, useNavigate } from 'react-router-dom'

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

export function OwnerLoginPage() {
  const navigate = useNavigate()
  const { owner, login, register } = useOwnerAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    support_email: '',
    support_whatsapp: '',
    country_code: '',
  })

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
          company_name: form.company_name || undefined,
          support_email: form.support_email || undefined,
          support_whatsapp: form.support_whatsapp || undefined,
          country_code: form.country_code,
        })
        trackEvent('owner_signup_form_submit', { user_type: 'owner' })
      }

      navigate(ROUTES.ownerDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side: Brand Identity */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#FED609] p-12 md:flex md:w-1/2">
        {/* Decorative blurs */}
        <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -mb-48 -ml-48 bottom-0 left-0 h-96 w-96 rounded-full bg-black/5 blur-3xl" />

        {/* Logo & Tagline */}
        <div className="relative z-10">
          <div className="mb-2 font-['Sora'] text-3xl font-black tracking-tighter text-white">Prophives</div>
          <p className="font-['DM_Sans'] text-sm font-medium uppercase tracking-wide text-white/90">
            AI-Powered Property Management
          </p>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex flex-grow items-center justify-center">
          <div className="relative w-full max-w-md" style={{ aspectRatio: '1' }}>
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
        <div className="relative z-10 rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
          <p className="mb-4 font-['Sora'] text-lg font-semibold italic text-white">
            "Prophives changed how I manage my property portfolio."
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/20">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2L_L8S2BpUVBstxOk1N46L7Jv2MQnUZ7qC3qrlLlcgFsxnOzDfVUG35zmm_dIHriXbQ6F5kNVLWSfD1OrsJIS_pJ4hTI4nULbllKvk4BjZ55mx1LhSHXOB_eubFRGC0NlUxNvV6cOqdEsopxcFBoDgWqRF2foYmQDOIFZlwuXewyqqqOCf6fqa-U7Qe4HNmj0Tvh_N4kbWRLmX7KR2hLVieKVmFzDhNnunVBWy2GvN35fK6jO-vmjve2yvngbJnja06hOYk_RDPVC"
                alt="Omar K."
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-['DM_Sans'] text-sm font-bold leading-none text-white">Omar K.</p>
              <p className="text-xs font-medium text-white/70">Portfolio Owner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Interaction Area */}
      <section className="flex w-full items-center justify-center bg-white p-6 md:w-1/2 md:p-12 lg:p-24">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 md:hidden">
            <span className="font-['Sora'] text-2xl font-black text-[#FED609]">Prophives</span>
          </div>

          {/* Tabs */}
          <div className="mb-10 flex gap-8 border-b border-stone-100">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null) }}
              className={`relative pb-4 font-['Sora'] font-bold transition-colors ${
                mode === 'login' ? 'text-[#1A1A1A]' : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              Login
              {mode === 'login' && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#FED609]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null) }}
              className={`relative pb-4 font-['Sora'] font-bold transition-colors ${
                mode === 'register' ? 'text-[#1A1A1A]' : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              Register
              {mode === 'register' && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-[#FED609]" />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['Sora'] text-3xl font-bold text-[#1A1A1A]">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-2 font-['Manrope'] text-[#6B7280]">
              {mode === 'login'
                ? 'Access your property dashboard and AI insights.'
                : 'Set up your Prophives owner workspace.'}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="mb-2 block font-['DM_Sans'] text-sm font-bold text-[#1A1A1A]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type="email"
                  name="owner_email"
                  autoComplete="email"
                  placeholder="owner@example.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  className="w-full rounded-lg border-transparent bg-[#FEFAEF] py-3 pl-12 pr-4 font-['Manrope'] text-[#1A1A1A] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FED609]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="font-['DM_Sans'] text-sm font-bold text-[#1A1A1A]">Password</label>
                {mode === 'login' && (
                  <Link
                    to={ROUTES.ownerForgotPassword}
                    className="font-['DM_Sans'] text-sm font-bold text-[#FFD70B] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="owner_password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  className="w-full rounded-lg border-transparent bg-[#FEFAEF] py-3 pl-12 pr-12 font-['Manrope'] text-[#1A1A1A] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FED609]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A]"
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
                  variant="light"
                  name="owner_full_name"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                />
                <FormInput
                  label="Company Name"
                  variant="light"
                  name="owner_company_name"
                  autoComplete="organization"
                  value={form.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                />
                <FormInput
                  label="Support Email"
                  type="email"
                  variant="light"
                  name="owner_support_email"
                  autoComplete="email"
                  value={form.support_email}
                  onChange={(e) => updateField('support_email', e.target.value)}
                />
                <FormInput
                  label="Support WhatsApp"
                  variant="light"
                  name="owner_support_whatsapp"
                  autoComplete="tel"
                  value={form.support_whatsapp}
                  onChange={(e) => updateField('support_whatsapp', e.target.value)}
                />

                <label className="block space-y-2">
                  <span className="font-['DM_Sans'] text-sm font-bold text-[#1A1A1A]">
                    Country where your properties are located
                  </span>
                  <Select<CountrySelectOption, false>
                    inputId="owner_country_code"
                    name="owner_country_code"
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(option) => updateField('country_code', option?.value ?? '')}
                    placeholder="Type to search country..."
                    noOptionsMessage={() => 'No country found'}
                    isSearchable
                    styles={getProphivesReactSelectStyles<CountrySelectOption, false>()}
                    isOptionDisabled={(option) => !option.isSupported}
                    formatOptionLabel={(option) => (
                      <span className="flex items-center gap-2">
                        <ReactCountryFlag
                          countryCode={option.value}
                          svg
                          aria-label={option.label}
                          style={{ width: '1.1em', height: '1.1em' }}
                        />
                        <span>{option.isSupported ? option.label : `${option.label} (Coming soon)`}</span>
                      </span>
                    )}
                  />
                  <span className="text-xs text-[#6B7280]">
                    Used to set your rent currency and regional pricing. Countries marked "Coming soon" cannot be
                    selected yet.
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
                  className="h-5 w-5 cursor-pointer rounded border-stone-200 text-[#FED609] focus:ring-[#FED609]"
                />
                <label
                  htmlFor="remember"
                  className="ml-3 cursor-pointer select-none font-['Manrope'] text-sm font-medium text-[#6B7280]"
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
              className="w-full rounded-lg bg-[#FED609] py-4 font-['Sora'] font-bold text-[#1A1A1A] shadow-lg shadow-[#FED609]/20 transition-all hover:bg-[#FFD70B] active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 font-['DM_Sans'] font-bold tracking-widest text-[#6B7280]">or</span>
              </div>
            </div>

            {/* Login as Tenant link */}
            <div className="text-center">
              <Link
                to={ROUTES.tenantLogin}
                className="group inline-flex items-center gap-2 font-['DM_Sans'] text-sm font-bold text-[#1A1A1A] transition-colors hover:text-[#FFD70B]"
              >
                Login as Tenant
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </form>

          {/* Footer support */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-100 pt-8 sm:flex-row">
            <p className="font-['Manrope'] text-xs font-medium text-[#6B7280]">Need assistance?</p>
            <div className="flex gap-4">
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 transition-colors hover:border-[#25D366]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span className="font-['DM_Sans'] text-xs font-bold">WhatsApp</span>
              </a>
              <a
                href="https://t.me/prophives"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 transition-colors hover:border-[#0088cc]"
              >
                <Send className="h-4 w-4 text-[#0088cc]" />
                <span className="font-['DM_Sans'] text-xs font-bold">Telegram Bot</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
