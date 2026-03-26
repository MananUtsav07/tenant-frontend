import {
  ArrowRight,
  Bot,
  Building2,
  ChevronDown,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorState } from '../../components/common/ErrorState'
import { LoadingState } from '../../components/common/LoadingState'
import { useTenantAuth } from '../../hooks/useTenantAuth'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import type { TelegramOnboardingState, TenantOwnerContact } from '../../types/api'

const OWNER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAqMYmKnDzt149UUp_tijoT57wEWwU9jP2Cka2pE5OrpD_4rZrAKiRD64KFiQVYm1F60EQeUAzARxuiwCISAuzJQii9y0Gz8HtXYkm3d9itA_jFYwOfmqXQxuCl9EXrWt0TsopgILOzfPJVhd_ymJAvx-inFx_JVLMx75bL8Z8VMO-H6xSVh42-zbpznhbUs8dSBxJDoSMjE0xun5v4oHDfR17RU-J93z1eNHxSp7qFZYo1IkDW2rwZR2TkP3S9jziE-807nvdqGs7L'

type FaqItem = {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'How do I pay rent?',
    answer:
      'You can pay your rent directly through the "Pay Rent" button in the sidebar. We support credit/debit cards, bank transfers, and automated recurring payments.',
  },
  {
    question: 'How to report an emergency?',
    answer:
      'For immediate emergencies (fire, flooding, gas leak), please contact local authorities first. Then, use the WhatsApp button to contact the property owner instantly or call our 24/7 hotline at +971-50-PROPHIVE.',
  },
  {
    question: 'Can I request a lease extension?',
    answer:
      'Yes, lease extension requests can be submitted via the "My Tickets" section. We recommend initiating this request at least 60 days before your current lease expires.',
  },
  {
    question: 'What is the policy on guest parking?',
    answer:
      'Guest parking is available on levels B1 and B2. Please ensure your visitors register their vehicle via the "Guest Access" portal to avoid towing.',
  },
]

export function TenantSupportPage() {
  const { token } = useTenantAuth()

  const [ownerContact, setOwnerContact] = useState<TenantOwnerContact | null>(null)
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        setError(null)
        const [contactResponse, telegramResponse] = await Promise.all([
          api.getTenantOwnerContact(token),
          api.getTenantTelegramOnboarding(token),
        ])
        setOwnerContact(contactResponse.owner)
        setTelegramOnboarding(telegramResponse.onboarding)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load support details')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const refreshTelegramStatus = async () => {
    if (!token) return false
    try {
      setError(null)
      const response = await api.getTenantTelegramOnboarding(token)
      setTelegramOnboarding(response.onboarding)
      return response.onboarding.connected
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh Telegram status')
      return false
    }
  }

  const connectTelegram = async () => {
    if (!telegramOnboarding?.connect_url) return
    window.open(telegramOnboarding.connect_url, '_blank', 'noopener,noreferrer')
    for (let attempt = 0; attempt < 15; attempt += 1) {
      await new Promise((resolve) => { window.setTimeout(resolve, 2000) })
      const connected = await refreshTelegramStatus()
      if (connected) break
    }
  }

  const disconnectTelegram = async () => {
    if (!token) return
    try {
      setDisconnectingTelegram(true)
      setError(null)
      await api.disconnectTenantTelegram(token)
      await refreshTelegramStatus()
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Telegram')
    } finally {
      setDisconnectingTelegram(false)
    }
  }

  const whatsappHref = ownerContact?.support_whatsapp
    ? `https://wa.me/${ownerContact.support_whatsapp.replace(/\D/g, '')}`
    : '#'

  const telegramHref = telegramOnboarding?.connect_url ?? '#'

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-[#1A1A1A]">Support &amp; Help Center</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Owner support contact and instant assistance</p>
      </div>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading support details..." rows={4} /> : null}

      {!loading ? (
        <>
          {/* Top bento grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Owner Contact Card */}
            <div className="rounded-xl border border-[#FED609]/10 bg-white p-8 shadow-sm transition-shadow hover:shadow-md lg:col-span-7">
              <div className="flex flex-col items-start gap-8 md:flex-row">
                {/* Avatar */}
                <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-[#FFFAE2]">
                  <img
                    src={OWNER_AVATAR}
                    alt="Property Owner"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <span className="mb-3 inline-block rounded-full bg-[#FED609]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FED609]">
                    Property Owner
                  </span>
                  <h2 className="mb-2 font-headline text-2xl font-bold text-[#1A1A1A]">
                    {ownerContact?.full_name ?? ownerContact?.company_name ?? 'Your Owner'}
                  </h2>
                  <p className="mb-6 text-[#6B7280]">
                    Available for urgent maintenance requests and lease inquiries. Standard response time:{' '}
                    <span className="font-semibold text-[#1A1A1A]">Under 2 hours</span>.
                  </p>

                  {/* Contact detail chips */}
                  <div className="mb-6 flex flex-wrap gap-3 text-sm text-[#6B7280]">
                    {ownerContact?.company_name ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEFAEF] px-3 py-1.5">
                        <Building2 className="h-3.5 w-3.5 text-[#FED609]" />
                        {ownerContact.company_name}
                      </span>
                    ) : null}
                    {ownerContact?.support_email ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEFAEF] px-3 py-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#FED609]" />
                        {ownerContact.support_email}
                      </span>
                    ) : null}
                    {ownerContact?.support_whatsapp ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEFAEF] px-3 py-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#25D366]" />
                        {ownerContact.support_whatsapp}
                      </span>
                    ) : null}
                  </div>

                  {/* Contact buttons */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-bold text-white shadow-sm transition-all hover:opacity-90"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Chat on WhatsApp
                    </a>
                    {telegramOnboarding?.connect_url ? (
                      <a
                        href={telegramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0088CC] px-6 py-3 font-bold text-white shadow-sm transition-all hover:opacity-90"
                      >
                        <Send className="h-5 w-5" />
                        Message Telegram
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Setup Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0088CC] to-[#00A8FF] p-8 text-white lg:col-span-5">
              <div className="relative z-10">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 font-headline text-2xl font-bold">Instant Alerts</h3>
                <p className="mb-8 text-white/80">
                  Connect your Prophives account to Telegram to receive real-time rent reminders and maintenance updates.
                </p>

                {telegramOnboarding?.connected ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">
                      Connected
                      {telegramOnboarding.linked_chat?.username
                        ? ` as @${telegramOnboarding.linked_chat.username}`
                        : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => { void disconnectTelegram() }}
                      disabled={disconnectingTelegram}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 py-3 font-bold text-white transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {disconnectingTelegram ? 'Disconnecting...' : 'Disconnect Telegram'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { void connectTelegram() }}
                    disabled={!telegramOnboarding?.connect_url}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-bold text-[#0088CC] transition-colors hover:bg-[#FFFAE2] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Connect to Telegram
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {!telegramOnboarding?.connected ? (
                  <button
                    type="button"
                    onClick={() => { void refreshTelegramStatus() }}
                    className="mt-3 w-full rounded-lg border border-white/30 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                  >
                    Refresh status
                  </button>
                ) : null}
              </div>

              {/* Decorative icon */}
              <Send className="absolute -bottom-8 -right-8 h-[180px] w-[180px] rotate-12 text-white/10 transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="rounded-xl border border-[#FED609]/10 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
                <p className="mt-1 text-[#6B7280]">Quick solutions for your most common inquiries</p>
              </div>
              <Link
                to={ROUTES.tenantTickets}
                className="inline-flex items-center gap-1 font-bold text-[#FED609] hover:underline"
              >
                Raise Ticket
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-[#FEFAEF] transition-all hover:border-[#FED609]/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between bg-[#FEFAEF]/50 p-5 text-left"
                  >
                    <span className="font-headline font-bold text-[#1A1A1A]">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#6B7280] transition-transform ${
                        openFaq === index ? 'rotate-180 text-[#FED609]' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index ? (
                    <div className="border-t border-[#FEFAEF] bg-white px-5 py-4 text-[#6B7280]">
                      {faq.answer}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant CTA */}
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-[#FED609]/30 bg-[#FFFAE2] p-8 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FED609] shadow-lg shadow-[#FED609]/20">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-[#1A1A1A]">Try our AI Assistant</h4>
                <p className="text-[#6B7280]">Get instant answers to complex lease questions.</p>
              </div>
            </div>
            <Link
              to={ROUTES.tenantTickets}
              className="rounded-full bg-[#1A1A1A] px-8 py-3 font-bold text-white transition-colors hover:bg-black"
            >
              Start AI Chat
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}
