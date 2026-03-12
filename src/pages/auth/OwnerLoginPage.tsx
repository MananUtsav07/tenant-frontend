import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Building2, UserRound, UserRoundPlus } from 'lucide-react'
import countryList from 'react-select-country-list'
import ReactCountryFlag from 'react-country-flag'
import Select, { type StylesConfig } from 'react-select'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Button } from '../../components/common/Button'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput } from '../../components/common/FormInput'
import { SectionContainer } from '../../components/common/SectionContainer'
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
    minHeight: '44px',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#60a5fa' : '#c6d3e6',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(147, 197, 253, 0.42)' : 'none',
    backgroundColor: '#ffffff',
    '&:hover': {
      borderColor: '#adc2e2',
    },
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#64748b',
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: '#0f172a',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: '#0f172a',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    borderRadius: '0.75rem',
    border: '1px solid #d9e2f0',
    boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.35)',
    overflow: 'hidden',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: '0.925rem',
    backgroundColor: state.isFocused ? '#f1f5f9' : '#ffffff',
    color: state.isDisabled ? '#94a3b8' : '#0f172a',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  indicatorSeparator: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#d9e2f0',
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
    description: 'Login or register as a property owner to manage tenants, tickets, and reminders.',
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
    <SectionContainer className="py-12">
      <motion.div
        variants={revealVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)]"
      >
        <h1 className="font-[Space_Grotesk] text-3xl font-semibold text-slate-900">Owner Access</h1>
        <p className="mt-2 text-sm text-slate-600">Login or create your owner account.</p>

        <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
              mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <UserRound className="h-4 w-4" />
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
              mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            <UserRoundPlus className="h-4 w-4" />
            Register
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
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
                <span className="text-sm font-medium text-slate-600">Country where your properties are located</span>
                <Select<CountrySelectOption, false>
                  inputId="owner_country_code"
                  name="owner_country_code"
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={(option) => updateField('country_code', option?.value ?? '')}
                  placeholder="Type to search country..."
                  noOptionsMessage={() => 'No country found'}
                  isSearchable
                  styles={countrySelectStyles}
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
                <span className="text-xs text-slate-500">
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
            variant="secondary"
            className="w-full justify-center"
            iconLeft={mode === 'login' ? <UserRound className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          >
            {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Tenant?{' '}
          <Link className="font-semibold text-blue-700 hover:text-blue-600" to={ROUTES.tenantLogin}>
            Login here
          </Link>
        </p>
      </motion.div>
    </SectionContainer>
  )
}
