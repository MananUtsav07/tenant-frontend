import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Building2, ShieldCheck, Sparkles, UserRound, UserRoundPlus } from 'lucide-react'
import countryList from 'react-select-country-list'
import ReactCountryFlag from 'react-country-flag'
import Select from 'react-select'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { allCountryOptions } from '../../constants/countryCurrency'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { trackEvent } from '../../utils/analytics'
import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'

type Mode = 'login' | 'register'
type CountrySelectOption = {
  value: string
  label: string
  isSupported: boolean
}

const countrySelectStyles: StylesConfig<CountrySelectOption, false> = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: '48px',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#FED609' : 'rgba(0, 0, 0, 0.12)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(254, 214, 9, 0.2)' : 'none',
    backgroundColor: '#fff',
    '&:hover': {
      borderColor: 'rgba(254, 214, 9, 0.5)',
    },
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#9CA3AF',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: '#1A1A1A',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: '#1A1A1A',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: '0.925rem',
    backgroundColor: state.isFocused ? 'rgba(254, 214, 9, 0.1)' : '#fff',
    color: state.isDisabled ? '#9CA3AF' : '#1A1A1A',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  indicatorSeparator: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  }),
  dropdownIndicator: (baseStyles) => ({
    ...baseStyles,
    color: '#6B7280',
    '&:hover': {
      color: '#FED609',
    },
  }),
}

export function OwnerLoginPage() {
  const navigate = useNavigate()
  const { owner, login, register } = useOwnerAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    support_email: '',
    support_whatsapp: '',
    country_code: '',
  })
  const revealVariants = useMotionVariants(revealUp)
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
        trackEvent('owner_login_form_submit', {
          user_type: 'owner',
        })
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
        trackEvent('owner_signup_form_submit', {
          user_type: 'owner',
        })
      }

      navigate(ROUTES.ownerDashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — gold branding panel */}
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="hidden w-[45%] flex-col justify-between bg-[#FED609] p-10 lg:flex xl:p-14"
      >
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/60">Owner Workspace</span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-[#1A1A1A] xl:text-5xl">
            Operate your portfolio with more control and less noise
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#1A1A1A]/70">
            Prophives gives owners a premium command center for resident support, rent workflows, reminders, and approvals.
          </p>
        </div>

        <div className="space-y-3 text-sm text-[#1A1A1A]/80">
          <p className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#1A1A1A]" />
            Structured property and resident operations
          </p>
          <p className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#1A1A1A]" />
            AI-assisted reminders with human oversight
          </p>
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1A1A1A]" />
            Secure owner, resident, and admin workspace separation
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
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Owner Access</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Login or create your Prophives owner account.</p>

          {/* Tabs */}
          <div className="mt-6 inline-flex rounded-full border border-[rgba(0,0,0,0.08)] bg-[#FEFAEF] p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-[#FED609] text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <UserRound className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === 'register'
                  ? 'bg-[#FED609] text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <UserRoundPlus className="h-4 w-4" />
              Register
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              type="email"
              variant="light"
              name="owner_email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
            <FormInput
              label="Password"
              type="password"
              variant="light"
              name="owner_password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
            />

            {mode === 'login' ? (
              <div className="-mt-1 flex justify-end">
                <Link className="ph-link text-sm font-semibold" to={ROUTES.ownerForgotPassword}>
                  Forgot password?
                </Link>
              </div>
            ) : null}

            {mode === 'register' ? (
              <>
                <FormInput
                  label="Full Name"
                  variant="light"
                  name="owner_full_name"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(event) => updateField('full_name', event.target.value)}
                />
                <FormInput
                  label="Company Name"
                  variant="light"
                  name="owner_company_name"
                  autoComplete="organization"
                  value={form.company_name}
                  onChange={(event) => updateField('company_name', event.target.value)}
                />
                <FormInput
                  label="Support Email"
                  type="email"
                  variant="light"
                  name="owner_support_email"
                  autoComplete="email"
                  value={form.support_email}
                  onChange={(event) => updateField('support_email', event.target.value)}
                />
                <FormInput
                  label="Support WhatsApp"
                  variant="light"
                  name="owner_support_whatsapp"
                  autoComplete="tel"
                  value={form.support_whatsapp}
                  onChange={(event) => updateField('support_whatsapp', event.target.value)}
                />

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#6B7280]">Country where your properties are located</span>
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
                    Used to set your rent currency now and regional pricing later. Countries marked "Coming soon" are
                    listed for visibility and cannot be selected yet.
                  </span>
                </label>
              </>
            ) : null}

            {error ? <ErrorState message={error} variant="light" /> : null}

            <Button
              type="submit"
              disabled={busy}
              variant="primary"
              className="w-full justify-center"
              iconLeft={mode === 'login' ? <UserRound className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-5 text-sm text-[#6B7280]">
            Resident?{' '}
            <Link className="font-semibold text-[#1A1A1A] underline decoration-[#FED609] decoration-2 underline-offset-2 hover:text-[#92700A]" to={ROUTES.tenantLogin}>
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
