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
    return <span className="font-bold text-white">{value}</span>
  }
  if (value) {
    return <CheckCircle className="mx-auto h-5 w-5 text-[#32C382]" />
  }
  return <Minus className="mx-auto h-5 w-5 text-[#8D8D96]/30" />
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
          <div className="inline-block bg-[rgba(34,81,227,0.12)] text-[#4E79FF] px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wider uppercase font-['DM_Sans']">
            Transparent Plans
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight font-['Sora']">
            Simple, Transparent Pricing
          </h1>
          <p className="text-[#8D8D96] text-lg max-w-2xl mx-auto font-['Manrope']">
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
            className="bg-[#101114] p-8 rounded-xl shadow-sm border border-[#272839] hover:border-[rgba(34,81,227,0.4)] transition-all flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora'] text-white">Starter</h3>
              <p className="text-[#8D8D96] text-sm">Perfect for individual landlords just starting their journey.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">$29</span>
              <span className="text-[#8D8D96]">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>Up to 5 properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>Up to 10 tenants</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#8D8D96]">
                <Minus className="h-[18px] w-[18px] shrink-0 text-[#8D8D96]/30" />
                <span>Basic ticket system</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>Email notifications</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 border-2 border-[#2251E3] text-[#4E79FF] font-bold rounded-lg hover:bg-[rgba(34,81,227,0.1)] transition-all text-center block"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Professional Plan */}
          <motion.div
            variants={revealVariants}
            className="bg-[#101114] p-8 rounded-xl shadow-xl border-2 border-[#2251E3] relative flex flex-col transform md:-translate-y-4"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2251E3] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md font-['DM_Sans']">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora'] text-white">Professional</h3>
              <p className="text-[#8D8D96] text-sm">The full suite for serious property managers.</p>
            </div>
            <div className="mb-8 text-[#4E79FF]">
              <span className="text-4xl font-extrabold">$99</span>
              <span className="text-[#8D8D96]">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span className="font-semibold">Up to 25 properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>Up to 50 tenants</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Zap className="h-[18px] w-[18px] shrink-0 text-[#4E79FF]" />
                <span className="font-medium">AI automation suite</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <MessageCircle className="h-[18px] w-[18px] shrink-0 text-[#25D366]" />
                <span>WhatsApp integration</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Send className="h-[18px] w-[18px] shrink-0 text-[#0088cc]" />
                <span>Telegram bot access</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Wallet className="h-[18px] w-[18px] shrink-0 text-[#4E79FF]" />
                <span>Payment tracking</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 bg-[#2251E3] text-white font-bold rounded-lg hover:bg-[#4E79FF] transition-all shadow-lg shadow-[#2251E3]/30 text-center block"
            >
              Start Free Trial
            </Link>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            variants={revealVariants}
            className="bg-[#101114] p-8 rounded-xl shadow-sm border border-[#272839] hover:border-[rgba(34,81,227,0.4)] transition-all flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 font-['Sora'] text-white">Enterprise</h3>
              <p className="text-[#8D8D96] text-sm">Bespoke solutions for large-scale portfolios and agencies.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-sm text-white">
                <Infinity className="h-[18px] w-[18px] shrink-0 text-[#4E79FF]" />
                <span className="font-semibold">Unlimited properties</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <CheckCircle className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>Dedicated support manager</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <Settings className="h-[18px] w-[18px] shrink-0 text-[#4E79FF]" />
                <span>Custom API integrations</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-[#32C382]" />
                <span>SLA guarantee</span>
              </li>
            </ul>
            <Link
              to={ROUTES.contact}
              className="w-full py-4 bg-[#2251E3] text-white font-bold rounded-lg hover:bg-[#4E79FF] transition-all text-center block"
            >
              Contact Sales
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#101114]">
        <div className="max-w-[1000px] mx-auto px-6">
          <motion.h2
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-3xl font-bold text-center mb-12 font-['Sora'] text-white"
          >
            Detailed Comparison
          </motion.h2>
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="overflow-hidden rounded-xl border border-[#272839] shadow-sm bg-[#101114]"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141519] border-b border-[#272839]">
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-[#8D8D96] font-['DM_Sans']">Feature</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center font-['DM_Sans'] text-white">Starter</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center text-[#4E79FF] font-['DM_Sans']">Professional</th>
                  <th className="p-6 font-bold text-sm uppercase tracking-wider text-center font-['DM_Sans'] text-white">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonFeatures.map((feature, index) => (
                  <tr key={feature.name} className={`border-b border-[#272839] ${index % 2 === 0 ? 'bg-[#141519]' : 'bg-[#101114]'}`}>
                    <td className="p-6 font-medium text-white">{feature.name}</td>
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
          className="text-3xl font-bold text-center mb-12 font-['Sora'] text-white"
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
              className="group bg-[#101114] rounded-xl border border-[#272839] p-6"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="flex w-full items-center justify-between text-left font-bold font-['Sora'] cursor-pointer list-none text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#8D8D96] transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 text-[#8D8D96] text-sm leading-relaxed"
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
          className="max-w-[1200px] mx-auto bg-[#2251E3] rounded-3xl p-12 text-center shadow-xl flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-['Sora']">
            Not sure which plan? Talk to our team
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl">
            Our specialists are ready to help you find the perfect configuration for your unique property portfolio.
          </p>
          <Link
            to={ROUTES.contact}
            style={{ color: '#2251E3' }}
            className="bg-white font-bold py-4 px-10 rounded-xl hover:bg-[rgba(255,255,255,0.9)] transition-all shadow-md flex items-center gap-2"
          >
            <Calendar className="h-5 w-5" style={{ color: '#2251E3' }} />
            Schedule a Call
          </Link>
        </motion.div>
      </section>
    </>
  )
}
