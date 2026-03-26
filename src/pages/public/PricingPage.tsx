import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Minus, Zap, MessageCircle, Send, Wallet, Infinity, Settings, ShieldCheck, ChevronDown, Calendar } from 'lucide-react'

import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

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
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, with pro-rated adjustments applied automatically to your account.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Absolutely! We offer a 14-day free trial on our Professional plan so you can experience the power of AI automation and WhatsApp integration first-hand.',
  },
  {
    question: "What's included in AI automation?",
    answer:
      'Our AI handles automated tenant screening, maintenance request categorization, rent payment predictions, and intelligent response drafts for common tenant inquiries.',
  },
  {
    question: 'How does the WhatsApp integration work?',
    answer:
      'Prophives connects to your official WhatsApp Business API, allowing you to send automated rent reminders, maintenance updates, and collect documents directly through chat.',
  },
]

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
      <section className="py-20 px-6 text-center max-w-[1200px] mx-auto">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <div className="inline-block bg-[#FED609]/10 text-[#FED609] px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wider uppercase font-['DM_Sans']">
            Transparent Plans
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A1A1A] mb-6 tracking-tight font-['Sora']">
            Simple, Transparent Pricing
          </h1>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto font-['Manrope']">
            Choose the plan that fits your portfolio size. No hidden fees, just pure AI-driven property management efficiency.
          </p>
        </motion.div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-24 px-6 max-w-[1200px] mx-auto">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Starter Plan */}
          <motion.div
            variants={revealVariants}
            className="bg-white p-8 rounded-xl shadow-sm border border-[#FFFAE2] hover:border-[#FED609]/30 transition-all flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora']">Starter</h3>
              <p className="text-[#6B7280] text-sm">Perfect for individual landlords just starting their journey.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold">$29</span>
              <span className="text-[#6B7280]">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Up to 5 properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Up to 10 tenants</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#6B7280]/70">
                <Minus className="h-[18px] w-[18px] shrink-0 text-[#6B7280]/30" />
                <span>Basic ticket system</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Email notifications</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 border-2 border-[#FED609] text-[#1A1A1A] font-bold rounded-lg hover:bg-[#FED609] transition-all text-center block"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Professional Plan */}
          <motion.div
            variants={revealVariants}
            className="bg-white p-8 rounded-xl shadow-xl border-2 border-[#FED609] relative flex flex-col transform md:-translate-y-4"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FED609] text-[#1A1A1A] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md font-['DM_Sans']">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora']">Professional</h3>
              <p className="text-[#6B7280] text-sm">The full suite for serious property managers.</p>
            </div>
            <div className="mb-8 text-[#FED609]">
              <span className="text-4xl font-extrabold">$99</span>
              <span className="text-[#6B7280]">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span className="font-semibold">Up to 25 properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Up to 50 tenants</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Zap className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span className="font-medium text-[#1A1A1A]">AI automation suite</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#25D366]" />
                <span>WhatsApp integration</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Send className="h-[18px] w-[18px] shrink-0 text-[#0088cc]" />
                <span>Telegram bot access</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Wallet className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Payment tracking</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-lg hover:bg-black transition-all shadow-lg text-center block"
            >
              Start Free Trial
            </Link>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            variants={revealVariants}
            className="bg-white p-8 rounded-xl shadow-sm border border-[#FFFAE2] hover:border-[#FED609]/30 transition-all flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora']">Enterprise</h3>
              <p className="text-[#6B7280] text-sm">Bespoke solutions for large-scale portfolios and agencies.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold">Custom</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm">
                <Infinity className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span className="font-semibold">Unlimited properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Dedicated support manager</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Settings className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>Custom API integrations</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-[#FED609]" />
                <span>SLA guarantee</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 bg-[#FED609] text-[#1A1A1A] font-bold rounded-lg hover:bg-[#FFD70B] transition-all text-center block"
            >
              Contact Sales
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#FFFAE2]/30">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.h2
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-3xl font-bold text-center mb-12 font-['Sora'] text-[#1A1A1A]"
          >
            Detailed Comparison
          </motion.h2>
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="overflow-hidden rounded-xl border border-[#FFFAE2] shadow-sm bg-white"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#FFFAE2]">
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-[#6B7280] font-['DM_Sans']">Feature</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center font-['DM_Sans']">Starter</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center text-[#FED609] font-['DM_Sans']">Professional</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center font-['DM_Sans']">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonFeatures.map((feature, index) => (
                  <tr key={feature.name} className={index % 2 === 0 ? 'bg-[#FEFAEF]' : 'bg-white'}>
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-[800px] mx-auto">
        <motion.h2
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-3xl font-bold text-center mb-12 font-['Sora'] text-[#1A1A1A]"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              variants={revealVariants}
              className="group bg-white rounded-xl border border-[#FFFAE2] p-6"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between text-left font-bold font-['Sora'] cursor-pointer list-none"
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
                  className="mt-4 text-[#6B7280] text-sm leading-relaxed"
                >
                  {faq.answer}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 pb-24">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-[1200px] mx-auto bg-[#FED609] rounded-3xl p-12 text-center shadow-xl flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] mb-4 font-['Sora']">
            Not sure which plan? Talk to our team
          </h2>
          <p className="text-[#1A1A1A]/70 text-lg mb-8 max-w-xl">
            Our specialists are ready to help you find the perfect configuration for your unique property portfolio.
          </p>
          <Link
            to={ROUTES.contact}
            className="bg-white text-[#1A1A1A] font-bold py-4 px-10 rounded-xl hover:bg-[#FFFAE2] transition-all shadow-md flex items-center gap-2"
          >
            <Calendar className="h-5 w-5" />
            Schedule a Call
          </Link>
        </motion.div>
      </section>
    </>
  )
}
