import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Clock3, Mail, MessageSquareMore, ShieldCheck } from 'lucide-react'

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
    description: 'Contact Prophives for demos, onboarding, and rollout planning for premium Dubai real estate operations.',
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
      setSuccess('Thanks for reaching out. We will reply shortly with next steps for your rollout.')
      setForm({ name: '', email: '', message: '' })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send contact request')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SectionContainer size="wide">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Contact</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)] md:text-6xl">
            Plan your Prophives rollout
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
            Questions about onboarding, pricing, or implementation? We will help map the right owner and resident
            experience for your portfolio.
          </p>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-8 space-y-3"
          >
            <motion.div variants={revealVariants} className="ph-surface-card rounded-xl p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ph-text)]">
                <Mail className="h-4 w-4 text-[var(--ph-accent)]" />
                Email
              </p>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">support@prophives.com</p>
            </motion.div>

            <motion.div variants={revealVariants} className="ph-surface-card rounded-xl p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ph-text)]">
                <Clock3 className="h-4 w-4 text-[var(--ph-accent)]" />
                Response Window
              </p>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                Typically within one business day for sales and onboarding requests.
              </p>
            </motion.div>

            <motion.div variants={revealVariants} className="ph-surface-card rounded-xl p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ph-text)]">
                <ShieldCheck className="h-4 w-4 text-[var(--ph-accent)]" />
                Rollout Focus
              </p>
              <p className="mt-2 text-sm text-[var(--ph-text-muted)]">
                Dubai real estate teams seeking premium automation, service visibility, and secure multi-role workspaces.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.form
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          onSubmit={handleSubmit}
          className="ph-surface-card-strong rounded-xl p-6 sm:p-7"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ph-text)]">
            <MessageSquareMore className="h-4 w-4 text-[var(--ph-accent)]" />
            Send a message
          </p>
          <div className="mt-5 space-y-4">
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
              label="How can we help?"
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

          {error ? <p className="mt-4 rounded-xl border border-red-500/28 bg-red-950/28 px-3 py-2 text-sm text-red-200">{error}</p> : null}
          {success ? (
            <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" className="mt-6 w-full justify-center" disabled={busy}>
            {busy ? 'Sending...' : 'Request Demo'}
          </Button>
        </motion.form>
      </div>
    </SectionContainer>
  )
}
