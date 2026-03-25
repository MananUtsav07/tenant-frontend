import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCircle, XCircle, Minus, Zap, MessageCircle, Send, Wallet, Infinity, Settings, ShieldCheck, ChevronDown, Calendar } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const pricingTiers = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'Perfect for individual landlords just starting their journey.',
    features: [
      { text: 'Up to 5 properties', included: true },
      { text: 'Up to 10 tenants', included: true },
      { text: 'Basic ticket system', included: false },
      { text: 'Email notifications', included: true },
    ],
    ctaLabel: 'Get Started',
    ctaHref: ROUTES.contact,
    variant: 'outline' as const,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/mo',
    description: 'The full suite for serious property managers in Dubai.',
    features: [
      { text: 'Up to 25 properties', included: true, bold: true, icon: 'check' },
      { text: 'Up to 50 tenants', included: true, icon: 'check' },
      { text: 'AI automation suite', included: true, icon: 'zap', bold: true },
      { text: 'WhatsApp integration', included: true, icon: 'whatsapp' },
      { text: 'Telegram bot access', included: true, icon: 'telegram' },
      { text: 'Payment tracking', included: true, icon: 'wallet' },
    ],
    ctaLabel: 'Start Free Trial',
    ctaHref: ROUTES.contact,
    highlighted: true,
    badge: 'Most Popular',
    variant: 'dark' as const,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Bespoke solutions for large-scale portfolios and agencies.',
    features: [
      { text: 'Unlimited properties', included: true, bold: true, icon: 'infinity' },
      { text: 'Dedicated support manager', included: true, icon: 'check' },
      { text: 'Custom API integrations', included: true, icon: 'settings' },
      { text: 'SLA guarantee', included: true, icon: 'shield' },
    ],
    ctaLabel: 'Contact Sales',
    ctaHref: ROUTES.contact,
    variant: 'primary' as const,
  },
]

const comparisonFeatures = [
  { name: 'Properties', starter: '5', professional: '25', enterprise: 'Unlimited' },
  { name: 'Tenants', starter: '10', professional: '50', enterprise: 'Unlimited' },
  { name: 'AI Automation', starter: false, professional: true, enterprise: true },
  { name: 'WhatsApp Integration', starter: false, professional: true, enterprise: true },
  { name: 'Telegram Bot', starter: false, professional: true, enterprise: true },
  { name: 'Payment Tracking', starter: true, professional: true, enterprise: true },
  { name: 'Smart Reminders', starter: true, professional: true, enterprise: true },
  { name: 'Priority Support', starter: false, professional: false, enterprise: true },
  { name: 'Custom Integrations', starter: false, professional: false, enterprise: true },
]

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, with pro-rated adjustments applied automatically to your account.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Absolutely! We offer a 14-day free trial on our Professional plan so you can experience the power of AI automation and WhatsApp integration first-hand.',
  },
  {
    question: "What's included in AI automation?",
    answer: 'Our AI handles automated tenant screening, maintenance request categorization, rent payment predictions, and intelligent response drafts for common tenant inquiries.',
  },
  {
    question: 'How does the WhatsApp integration work?',
    answer: 'Prophives connects to your official WhatsApp Business API, allowing you to send automated rent reminders, maintenance updates, and collect documents directly through chat.',
  },
]

function FeatureIcon({ icon, included }: { icon?: string; included: boolean }) {
  if (!included) return <XCircle className="h-[18px] w-[18px] shrink-0 text-[#6B7280]/30" />

  switch (icon) {
    case 'zap':
      return <Zap className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
    case 'whatsapp':
      return <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#25D366]" />
    case 'telegram':
      return <Send className="h-[18px] w-[18px] shrink-0 text-[#0088cc]" />
    case 'wallet':
      return <Wallet className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
    case 'infinity':
      return <Infinity className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
    case 'settings':
      return <Settings className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
    case 'shield':
      return <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
    default:
      return <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
  }
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="font-bold">{value}</span>
  }
  if (value) {
    return <CheckCircle className="mx-auto h-5 w-5 text-[#FED609]" />
  }
  return <Minus className="mx-auto h-5 w-5 text-[#6B7280]/30" />
}

export function PricingPage() {
  usePageSeo({
    title: 'Pricing',
    description: 'Explore Prophives pricing for Starter, Professional, and Enterprise property management plans.',
    canonicalPath: ROUTES.pricing,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      name: 'Prophives Pricing',
      description: 'Starter, Professional, and Enterprise pricing options for AI-powered property management.',
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  const [openFaq, setOpenFaq] = useState<number>(0)

  return (
    <>
      {/* Hero Section */}
      <SectionContainer size="wide" tone="cream" padded={false}>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="py-20 text-center"
        >
          <div className="inline-block rounded-full bg-[#FED609]/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-[#FED609] font-['DM_Sans']">
            Transparent Plans
          </div>
          <h1 className="ph-title mt-6 text-4xl font-extrabold tracking-tight text-[#1A1A1A] md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6B7280] font-['Manrope']">
            Choose the plan that fits your portfolio size. No hidden fees, just pure AI-driven property management efficiency.
          </p>
        </motion.div>
      </SectionContainer>

      {/* Pricing Grid */}
      <SectionContainer size="wide" padded={false}>
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-8 pb-24 md:grid-cols-3"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={revealVariants}
              className={`relative flex flex-col rounded-xl bg-white p-8 transition-all ${
                tier.highlighted
                  ? 'border-2 border-[#FED609] shadow-xl md:-translate-y-4'
                  : 'border border-[#FFFAE2] shadow-sm hover:border-[#FED609]/30'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#FED609] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] shadow-md font-['DM_Sans']">
                  {tier.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="ph-title text-xl font-bold text-[#1A1A1A]">{tier.name}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{tier.description}</p>
              </div>

              <div className={`mb-8 ${tier.highlighted ? 'text-[#FED609]' : ''}`}>
                <span className="text-4xl font-extrabold">{tier.price}</span>
                {tier.period && <span className="text-[#6B7280]">{tier.period}</span>}
              </div>

              <ul className="mb-10 flex-grow space-y-4">
                {tier.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-center gap-3 text-sm ${
                      !feature.included ? 'text-[#6B7280]/70' : ''
                    }`}
                  >
                    <FeatureIcon icon={feature.icon} included={feature.included} />
                    <span className={feature.bold ? 'font-semibold text-[#1A1A1A]' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.variant === 'dark' ? (
                <Button
                  to={tier.ctaHref}
                  variant="primary"
                  className="!w-full !justify-center !rounded-lg !bg-[#1A1A1A] !text-white !border-[#1A1A1A] !py-4 !shadow-lg hover:!bg-black"
                >
                  {tier.ctaLabel}
                </Button>
              ) : tier.variant === 'outline' ? (
                <Button
                  to={tier.ctaHref}
                  variant="outline"
                  className="!w-full !justify-center !rounded-lg !border-2 !border-[#FED609] !text-[#1A1A1A] !font-bold !py-4 hover:!bg-[#FED609]"
                >
                  {tier.ctaLabel}
                </Button>
              ) : (
                <Button
                  to={tier.ctaHref}
                  variant="primary"
                  className="!w-full !justify-center !rounded-lg !py-4"
                >
                  {tier.ctaLabel}
                </Button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </SectionContainer>

      {/* Feature Comparison Table */}
      <SectionContainer size="narrow" tone="ivory" className="bg-[#FFFAE2]/30">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <h2 className="ph-title text-center text-3xl font-bold text-[#1A1A1A]">
            Detailed Comparison
          </h2>
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 overflow-hidden rounded-xl border border-[#FFFAE2] bg-white shadow-sm"
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#FFFAE2] bg-white">
                <th className="p-6 text-sm font-bold uppercase tracking-wider text-[#6B7280] font-['DM_Sans']">
                  Feature
                </th>
                <th className="p-6 text-center text-sm font-bold uppercase tracking-wider font-['DM_Sans']">
                  Starter
                </th>
                <th className="p-6 text-center text-sm font-bold uppercase tracking-wider text-[#FED609] font-['DM_Sans']">
                  Professional
                </th>
                <th className="p-6 text-center text-sm font-bold uppercase tracking-wider font-['DM_Sans']">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {comparisonFeatures.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={index % 2 === 0 ? 'bg-[#FEFAEF]' : 'bg-white'}
                >
                  <td className="p-6 font-medium">{feature.name}</td>
                  <td className="p-6 text-center">
                    <ComparisonCell value={feature.starter} />
                  </td>
                  <td className="p-6 text-center">
                    <ComparisonCell value={feature.professional} />
                  </td>
                  <td className="p-6 text-center">
                    <ComparisonCell value={feature.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </SectionContainer>

      {/* FAQ Section */}
      <SectionContainer size="narrow" contentClassName="!max-w-[800px]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <h2 className="ph-title text-center text-3xl font-bold text-[#1A1A1A]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              variants={revealVariants}
              className="rounded-xl border border-[#FFFAE2] bg-white p-6"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between text-left font-bold font-['Sora']"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#6B7280] transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 text-sm leading-relaxed text-[#6B7280]"
                >
                  {faq.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </SectionContainer>

      {/* CTA Banner */}
      <SectionContainer size="wide" padded={false} className="px-6 pb-24">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col items-center rounded-3xl bg-[#FED609] p-12 text-center shadow-xl"
        >
          <h2 className="ph-title text-3xl font-extrabold text-[#1A1A1A] md:text-4xl">
            Not sure which plan? Talk to our team
          </h2>
          <p className="mt-4 max-w-xl text-lg text-[#1A1A1A]/70">
            Our specialists are ready to help you find the perfect configuration for your unique property portfolio.
          </p>
          <Button
            to={ROUTES.contact}
            variant="secondary"
            size="lg"
            className="!mt-8 !rounded-xl !bg-white !px-10 !py-4 !font-bold !text-[#1A1A1A] !shadow-md hover:!bg-[#FFFAE2]"
            iconLeft={<Calendar className="h-5 w-5" />}
          >
            Schedule a Call
          </Button>
        </motion.div>
      </SectionContainer>
    </>
  )
}
