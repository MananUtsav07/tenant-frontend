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
import { SectionContainer } from '../../components/common/SectionContainer'
import { getProphivesReactSelectStyles } from '../../components/common/formTheme'
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
    <SectionContainer size="wide" className="py-12">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce} className="ph-surface-navy ph-hex-bg rounded-xl p-6 sm:p-7">
          <span className="ph-kicker">Owner Workspace</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)]">Operate your portfolio with more control and less noise</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)]">
            Prophives gives owners a premium command center for resident support, rent workflows, reminders, and approvals.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ph-text-soft)]">
            <p className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--ph-accent)]" />
              Structured property and resident operations
            </p>
            <p className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ph-accent)]" />
              AI-assisted reminders with human oversight
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
              Secure owner and resident workspace separation
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
          <h2 className="ph-title text-3xl font-semibold text-[var(--ph-text)]">Owner Access</h2>
          <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Login or create your Prophives owner account.</p>

          <div className="mt-5 inline-flex rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ${
                mode === 'login'
                  ? 'border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[#f4d298]'
                  : 'text-[var(--ph-text-muted)]'
              }`}
            >
              <UserRound className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ${
                mode === 'register'
                  ? 'border border-[rgba(240,163,35,0.2)] bg-[rgba(240,163,35,0.08)] text-[#f4d298]'
                  : 'text-[var(--ph-text-muted)]'
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
                  <span className="text-sm font-medium text-[var(--ph-text-muted)]">Country where your properties are located</span>
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
                  <span className="text-xs text-[var(--ph-text-muted)]">
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

          <p className="mt-4 text-sm text-[var(--ph-text-muted)]">
            Resident?{' '}
            <Link className="ph-link font-semibold" to={ROUTES.tenantLogin}>
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </SectionContainer>
  )
}
