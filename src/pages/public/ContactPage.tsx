import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Clock3, Mail, MessageSquareMore } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { FormInput } from '../../components/common/FormInput'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { api } from '../../services/api'
import { trackEvent } from '../../utils/analytics'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

export function ContactPage() {
  usePageSeo({
    title: 'Contact',
    description: 'Contact TenantFlow for product questions, demos, and onboarding support.',
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setBusy(true)
      await api.sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      })
      trackEvent('contact_form_submit_frontend', {
        user_type: 'public',
      })
      setSuccess('Thanks for contacting us. Our team will respond shortly.')
      setForm({ name: '', email: '', message: '' })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send contact request')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionContainer size="wide">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Contact</p>
          <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">Talk to the TenantFlow team</h1>
          <p className="mt-4 text-slate-600">
            Questions about onboarding, pricing, or deployment? Send us a message and we will get back quickly.
          </p>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-8 space-y-3"
          >
            <motion.div variants={revealVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.55)]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Mail className="h-4 w-4 text-blue-700" />
                Company Email
              </p>
              <p className="mt-2 text-sm text-slate-600">support@tenantflow.app</p>
            </motion.div>
            <motion.div variants={revealVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.55)]">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Clock3 className="h-4 w-4 text-blue-700" />
                Typical Response Window
              </p>
              <p className="mt-2 text-sm text-slate-600">Within one business day for sales and onboarding queries.</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.form
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_25px_65px_-40px_rgba(15,23,42,0.55)]"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MessageSquareMore className="h-4 w-4 text-blue-700" />
            Send a message
          </p>
          <div className="mt-4 space-y-4">
            <FormInput
              label="Name"
              variant="light"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
              minLength={2}
              maxLength={120}
            />
            <FormInput
              label="Email"
              type="email"
              variant="light"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <FormInput
              label="Message"
              as="textarea"
              variant="light"
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              rows={6}
              required
              minLength={10}
              maxLength={3000}
            />
          </div>

          {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <Button type="submit" variant="secondary" size="lg" className="mt-5 w-full justify-center" disabled={busy}>
            {busy ? 'Sending...' : 'Send Message'}
          </Button>
        </motion.form>
      </div>
    </SectionContainer>
  )
}


