import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, CircleHelp, Clock, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

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
    description: 'Contact Prophives for demos, onboarding, and rollout planning for your property management operations.',
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [subject, setSubject] = useState('General Inquiry')
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
    <>
      {/* Contact Hero Section */}
      <SectionContainer size="wide" tone="cream">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Form */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="order-2 lg:order-1"
          >
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    variant="dark"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="John Doe"
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    variant="dark"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-bold font-[family-name:var(--font-label,'DM_Sans',sans-serif)] text-[#1A1A1A]">Subject</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FFFAE2] border border-[rgba(0,0,0,0.12)] rounded-xl focus:ring-2 focus:ring-[rgba(254,214,9,0.2)] focus:border-[#FED609] text-[#1A1A1A] transition-all outline-none appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Property Listing Support</option>
                    <option>Technical Assistance</option>
                    <option>Partnership Opportunities</option>
                  </select>
                </label>

                <FormInput
                  label="Message"
                  as="textarea"
                  variant="dark"
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  rows={5}
                  required
                  minLength={10}
                  maxLength={3000}
                  placeholder="How can we help you today?"
                />

                {error ? <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                {success ? (
                  <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {success}
                  </p>
                ) : null}

                <Button type="submit" variant="primary" size="lg" className="w-full justify-center rounded-lg! py-4!" disabled={busy}>
                  {busy ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right Column: Contact Info */}
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="order-1 lg:order-2 space-y-10 lg:pl-12"
          >
            <motion.div variants={revealVariants} className="space-y-4">
              <span className="ph-kicker">Contact Us</span>
              <h1 className="ph-title text-4xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">Get in Touch</h1>
              <p className="text-[#6B7280] text-lg max-w-md">
                Experience the future of property management. Our team is ready to assist you 24/7.
              </p>
            </motion.div>

            <motion.div variants={revealVariants} className="space-y-6">
              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Mail className="h-5 w-5 text-[#FED609]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Email Us</h3>
                  <p className="text-[#6B7280]">support@prohives.com</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">WhatsApp</h3>
                  <a
                    href="https://wa.me/971000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B7280] hover:text-[#25D366] transition-colors"
                  >
                    Chat with an Agent
                  </a>
                </div>
              </div>

              {/* Telegram */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Send className="h-5 w-5 text-[#0088cc]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Telegram</h3>
                  <a
                    href="https://t.me/prophives"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B7280] hover:text-[#0088cc] transition-colors"
                  >
                    Join our Support Bot
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Office Location & Operating Hours */}
            <motion.div variants={revealVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
              <div>
                <h4 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FED609]" />
                  Office Location
                </h4>
                <p className="text-[#6B7280] mt-2">
                  Prime Tower, Business Bay
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#FED609]" />
                  Operating Hours
                </h4>
                <p className="text-[#6B7280] mt-2">
                  Mon - Fri: 9am - 6pm<br />Sat: 10am - 2pm
                </p>
              </div>
            </motion.div>

            {/* Map Image */}
            <motion.div variants={revealVariants} className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner bg-gray-200 group">
              <img
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
                alt="Modern city skyline with contemporary skyscrapers"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcqsNdLHfbBMWpJMnYYPjVreaZF2Z7v6STar9oTNMKOQLoBaV78yfgKe9t-9aO4Y0wH-dgTBPDs0aDWx_hHHD8dSIUMqF16PQAqzUVMWAa8Ybj38pQc2V6hNrKahApQWDu2nNp5QtQohgm6iAahPWH6qKjSopKzkwubAJ3PIH5JB1jegU933Ow4-Yu2CX_kgMJQHYAox7enio3Qpk1PvQnEylFKdtNVhwdCPTXItgD-6q1yrthrWIu1N-up3JfiVPL-h6lh4f1rCbC"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FED609] rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Our HQ</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* Bottom Section: Self-Service */}
      <SectionContainer size="wide" tone="ivory" className="py-20">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center space-y-8"
        >
          <motion.div variants={revealVariants} className="space-y-2">
            <h2 className="ph-title text-3xl font-bold text-[#1A1A1A]">Prefer self-service?</h2>
            <p className="text-[#6B7280]">Find quick answers and detailed guides in our knowledge base.</p>
          </motion.div>

          <motion.div variants={revealVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              to="/docs"
              className="flex items-center justify-between p-6 bg-white rounded-xl hover:shadow-md transition-all group border border-transparent hover:border-[#FED609]/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FEFAEF] rounded-lg flex items-center justify-center text-[#FED609] group-hover:bg-[#FED609] group-hover:text-[#1A1A1A] transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#1A1A1A]">Documentation</h4>
                  <p className="text-sm text-[#6B7280]">Complete platform guides</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#FED609] transition-colors" />
            </Link>

            <Link
              to="/docs/faq"
              className="flex items-center justify-between p-6 bg-white rounded-xl hover:shadow-md transition-all group border border-transparent hover:border-[#FED609]/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FEFAEF] rounded-lg flex items-center justify-center text-[#FED609] group-hover:bg-[#FED609] group-hover:text-[#1A1A1A] transition-colors">
                  <CircleHelp className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#1A1A1A]">F.A.Q.</h4>
                  <p className="text-sm text-[#6B7280]">Instant answers to common questions</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#FED609] transition-colors" />
            </Link>
          </motion.div>
        </motion.div>
      </SectionContainer>
    </>
  )
}
