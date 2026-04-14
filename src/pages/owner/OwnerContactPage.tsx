import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  BookOpen,
  CircleHelp,
  ArrowRight,
  Headphones,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { api } from '../../services/api'
import { trackEvent } from '../../utils/analytics'

const SUBJECTS = [
  'General Inquiry',
  'Billing & Subscription',
  'Technical Issue',
  'Feature Request',
  'Account & Profile',
  'WhatsApp / Telegram Integration',
  'AI Automation',
  'Other',
]

const SUPPORT_EMAIL = 'support@prophives.com'

export function OwnerContactPage() {
  const { owner } = useOwnerAuth()

  const [form, setForm] = useState({
    name: owner?.full_name ?? '',
    email: owner?.email ?? '',
    message: '',
  })
  const [subject, setSubject] = useState('General Inquiry')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setBusy(true)
      await api.sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: `[${subject}]\n\n${form.message.trim()}`,
      })
      trackEvent('contact_form_submit_frontend', { user_type: 'owner' })
      setSuccess(true)
      setForm(f => ({ ...f, message: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[#4E79FF] font-['DM_Sans'] mb-1">
          Owner Portal
        </p>
        <div className="flex items-center gap-2.5 mb-1">
          <Headphones className="h-7 w-7 text-[#4E79FF]" />
          <h1 className="font-['Sora'] text-3xl font-extrabold tracking-tight text-white">
            Contact Support
          </h1>
        </div>
        <p className="text-[#8D8D96] font-['Manrope']">
          We're here to help. Send us a message or reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Contact Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <div className="rounded-2xl border border-[#272839] bg-[#101114] p-7">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#32C382]/15 flex items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-[#32C382]" />
                </div>
                <h3 className="text-lg font-bold text-white font-['Sora'] mb-2">Message sent!</h3>
                <p className="text-[#8D8D96] text-sm font-['Manrope'] mb-6 max-w-xs">
                  We've received your message and will get back to you at{' '}
                  <span className="text-white font-semibold">{form.email}</span> shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm font-bold text-[#4E79FF] hover:text-white transition-colors font-['DM_Sans']"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-base font-bold text-white font-['Sora'] mb-1">Send a message</h2>
                <p className="text-xs text-[#8D8D96] font-['Manrope']">
                  We typically respond within 24 hours on business days.
                </p>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">
                      Full Name <span className="text-[#F25461]">*</span>
                    </span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-[#141519] border border-[#272839] rounded-xl text-white placeholder-[#4A4A55] text-sm focus:outline-none focus:ring-2 focus:ring-[#2251E3]/40 focus:border-[#2251E3] transition-all font-['Manrope']"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">
                      Email <span className="text-[#F25461]">*</span>
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-[#141519] border border-[#272839] rounded-xl text-white placeholder-[#4A4A55] text-sm focus:outline-none focus:ring-2 focus:ring-[#2251E3]/40 focus:border-[#2251E3] transition-all font-['Manrope']"
                    />
                  </label>
                </div>

                {/* Subject */}
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">
                    Subject
                  </span>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#141519] border border-[#272839] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2251E3]/40 focus:border-[#2251E3] transition-all appearance-none font-['Manrope']"
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>

                {/* Message */}
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">
                    Message <span className="text-[#F25461]">*</span>
                  </span>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={5}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full px-4 py-3 bg-[#141519] border border-[#272839] rounded-xl text-white placeholder-[#4A4A55] text-sm focus:outline-none focus:ring-2 focus:ring-[#2251E3]/40 focus:border-[#2251E3] transition-all resize-none font-['Manrope']"
                  />
                  <span className="text-[10px] text-[#8D8D96]/50 font-['DM_Sans'] float-right">
                    {form.message.length}/3000
                  </span>
                </label>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-950/50 border border-red-800/50 text-red-300 rounded-xl px-4 py-3 text-sm font-['Manrope']">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 bg-[#2251E3] text-white font-bold rounded-xl hover:bg-[#4E79FF] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2251E3]/20 font-['DM_Sans'] text-sm"
                >
                  {busy
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    : <><Send className="h-4 w-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* ── Right sidebar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Email card */}
          <div className="rounded-2xl border border-[#272839] bg-[#101114] p-6">
            <h3 className="text-sm font-bold text-white font-['Sora'] mb-4">Direct contact</h3>

            {/* Email */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2251E3]/15 border border-[#2251E3]/20 flex items-center justify-center shrink-0">
                <Mail className="h-4.5 w-4.5 text-[#4E79FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#8D8D96] uppercase tracking-wider font-['DM_Sans'] mb-0.5">Email</p>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sm font-semibold text-white hover:text-[#4E79FF] transition-colors font-['Manrope'] truncate"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  <button
                    onClick={copyEmail}
                    className="shrink-0 text-[#8D8D96] hover:text-white transition-colors"
                    title="Copy email"
                  >
                    {copied
                      ? <Check className="h-3.5 w-3.5 text-[#32C382]" />
                      : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-[#8D8D96] font-['Manrope'] mt-0.5">Replies within 24h on business days</p>
              </div>
            </div>

            <div className="h-px bg-[#272839] my-4" />

            {/* WhatsApp */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4.5 w-4.5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#8D8D96] uppercase tracking-wider font-['DM_Sans'] mb-0.5">WhatsApp</p>
                <a
                  href="https://wa.me/971000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-[#25D366] transition-colors font-['Manrope']"
                >
                  Chat with an agent
                </a>
                <p className="text-xs text-[#8D8D96] font-['Manrope'] mt-0.5">Fastest response channel</p>
              </div>
            </div>

            <div className="h-px bg-[#272839] my-4" />

            {/* Telegram */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center shrink-0">
                <Send className="h-4.5 w-4.5 text-[#0088cc]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#8D8D96] uppercase tracking-wider font-['DM_Sans'] mb-0.5">Telegram</p>
                <a
                  href="https://t.me/prophives"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-[#0088cc] transition-colors font-['Manrope']"
                >
                  Join our support bot
                </a>
                <p className="text-xs text-[#8D8D96] font-['Manrope'] mt-0.5">Automated + live help</p>
              </div>
            </div>
          </div>

          {/* Self-service links */}
          <div className="rounded-2xl border border-[#272839] bg-[#101114] p-6">
            <h3 className="text-sm font-bold text-white font-['Sora'] mb-4">Self-service</h3>
            <div className="space-y-2">
              <Link
                to="/docs"
                className="flex items-center justify-between p-3 rounded-xl border border-[#272839] hover:border-[#2251E3]/40 hover:bg-[#141519] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2251E3]/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-[#4E79FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-['Manrope']">Documentation</p>
                    <p className="text-xs text-[#8D8D96] font-['Manrope']">Guides & tutorials</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#8D8D96] group-hover:text-[#4E79FF] transition-colors" />
              </Link>

              <Link
                to="/docs/faq"
                className="flex items-center justify-between p-3 rounded-xl border border-[#272839] hover:border-[#2251E3]/40 hover:bg-[#141519] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2251E3]/10 flex items-center justify-center">
                    <CircleHelp className="h-4 w-4 text-[#4E79FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-['Manrope']">FAQ</p>
                    <p className="text-xs text-[#8D8D96] font-['Manrope']">Common questions answered</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#8D8D96] group-hover:text-[#4E79FF] transition-colors" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
