import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { Button } from '../../components/common/Button'
import { CTASection } from '../../components/common/CTASection'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const pricingTiers = [
  {
    name: 'Core',
    price: 'AED 1,490',
    priceNote: 'per month for focused portfolio teams',
    description: 'For boutique portfolios introducing structured owner and resident operations.',
    features: ['Owner and resident workspaces', 'Support ticket workflows', 'Rent reminder visibility', 'Dedicated onboarding'],
    ctaLabel: 'Book Core Demo',
    ctaHref: ROUTES.contact,
    badge: 'Pilot Ready',
  },
  {
    name: 'Professional',
    price: 'AED 3,900',
    priceNote: 'per month for multi-building operations',
    description: 'For teams that need AI-assisted reminders, approval handling, and stronger operational oversight.',
    features: ['Everything in Core', 'Portfolio oversight analytics', 'Approval queue handling', 'Automation activity visibility', 'WhatsApp & Telegram integrations'],
    ctaLabel: 'Book Professional Demo',
    ctaHref: ROUTES.contact,
    highlighted: true,
    badge: 'Most Adopted',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'for branded rollouts and advanced requirements',
    description: 'For larger portfolios, bespoke service operations, and deeper implementation planning.',
    features: ['Custom deployment planning', 'Multi-organization coordination', 'Priority rollout support', 'Tailored operating design'],
    ctaLabel: 'Talk to Sales',
    ctaHref: ROUTES.contact,
    badge: 'White-Glove',
  },
]

const inclusions = [
  'Clean premium UI for owners and residents',
  'Dedicated onboarding and workflow mapping',
  'Secure role-based access across portfolios',
  'AI-assisted operations without losing control',
]

const comparisonFeatures = [
  { name: 'Owner Dashboard', core: true, professional: true, enterprise: true },
  { name: 'Resident Portal', core: true, professional: true, enterprise: true },
  { name: 'Support Tickets', core: true, professional: true, enterprise: true },
  { name: 'Rent Reminders', core: true, professional: true, enterprise: true },
  { name: 'Portfolio Analytics', core: false, professional: true, enterprise: true },
  { name: 'Approval Queues', core: false, professional: true, enterprise: true },
  { name: 'WhatsApp Integration', core: false, professional: true, enterprise: true },
  { name: 'Telegram Alerts', core: false, professional: true, enterprise: true },
  { name: 'Custom Branding', core: false, professional: false, enterprise: true },
  { name: 'Multi-Org Support', core: false, professional: false, enterprise: true },
  { name: 'Priority Support', core: false, professional: false, enterprise: true },
]

export function PricingPage() {
  usePageSeo({
    title: 'Pricing',
    description: 'Explore Prophives pricing for Core, Professional, and Enterprise real estate operations rollouts.',
    canonicalPath: ROUTES.pricing,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      name: 'Prophives Pricing',
      description: 'Core, Professional, and Enterprise pricing options for premium property operations teams.',
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide" tone="cream">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Pricing</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[#1A1A1A] md:text-6xl">
            Premium pricing for serious portfolio operations
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B7280] md:text-lg">
            Clear tiers, white-glove rollout, and no noisy packaging. Gold marks the moments that matter -- the same
            principle applies to our pricing.
          </p>
          <p className="mt-5 inline-flex rounded-full border border-[rgba(0,0,0,0.06)] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6B7280] shadow-sm">
            Dubai-focused rollout. No setup clutter.
          </p>
        </motion.div>
      </SectionContainer>

      <SectionContainer size="wide">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 lg:grid-cols-3"
        >
          {pricingTiers.map((tier) => (
            <motion.article
              key={tier.name}
              variants={revealVariants}
              className={`relative overflow-hidden rounded-xl border p-7 transition-all hover:shadow-md ${
                tier.highlighted
                  ? 'border-[#FED609] bg-white shadow-[0_8px_32px_-12px_rgba(254,214,9,0.25)] ring-2 ring-[#FED609]'
                  : 'border-[rgba(0,0,0,0.06)] bg-white shadow-sm'
              }`}
            >
              {tier.highlighted ? (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FED609] via-[#FFD70B] to-[#FED609]" />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="ph-title text-2xl font-semibold text-[#1A1A1A]">{tier.name}</h3>
                  <p className="mt-2 text-sm text-[#6B7280]">{tier.description}</p>
                </div>
                {tier.badge ? (
                  <span className="rounded-full border border-[rgba(254,214,9,0.3)] bg-[rgba(254,214,9,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#92700A]">
                    {tier.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-7 text-4xl font-bold tracking-tight text-[#1A1A1A]">{tier.price}</p>
              {tier.priceNote ? <p className="mt-2 text-sm text-[#6B7280]">{tier.priceNote}</p> : null}
              <ul className="mt-7 space-y-3 text-sm text-[#4B5563]">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#92700A]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button to={tier.ctaHref} variant={tier.highlighted ? 'primary' : 'secondary'} className="mt-8 w-full justify-center">
                {tier.ctaLabel}
              </Button>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 grid gap-3 rounded-xl border border-[rgba(0,0,0,0.06)] bg-[#FEFAEF] p-5 shadow-sm md:grid-cols-2"
        >
          {inclusions.map((item) => (
            <p key={item} className="text-sm text-[#4B5563]">
              • {item}
            </p>
          ))}
        </motion.div>
      </SectionContainer>

      {/* Feature Comparison Table */}
      <SectionContainer size="wide" tone="cream">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Feature Comparison</span>
          <h2 className="ph-title mt-5 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
            Compare what is included in each plan
          </h2>
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.06)] bg-white shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)]">
                <th className="px-5 py-4 text-left font-semibold text-[#1A1A1A]">Feature</th>
                <th className="px-5 py-4 text-center font-semibold text-[#1A1A1A]">Core</th>
                <th className="px-5 py-4 text-center font-semibold text-[#92700A]">Professional</th>
                <th className="px-5 py-4 text-center font-semibold text-[#1A1A1A]">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr key={feature.name} className="border-b border-[rgba(0,0,0,0.04)] last:border-0">
                  <td className="px-5 py-3 text-[#4B5563]">{feature.name}</td>
                  <td className="px-5 py-3 text-center">
                    {feature.core ? <Check className="mx-auto h-4 w-4 text-[#92700A]" /> : <span className="text-[#D1D5DB]">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center bg-[rgba(254,214,9,0.04)]">
                    {feature.professional ? <Check className="mx-auto h-4 w-4 text-[#92700A]" /> : <span className="text-[#D1D5DB]">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {feature.enterprise ? <Check className="mx-auto h-4 w-4 text-[#92700A]" /> : <span className="text-[#D1D5DB]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </SectionContainer>

      <CTASection
        eyebrow="Commercial Fit"
        title="Need a plan aligned to your portfolio service model?"
        description="We can map pricing to resident volume, operating complexity, and the level of white-glove rollout you need."
        primaryAction={{ label: 'Talk to Sales', href: ROUTES.contact }}
        secondaryAction={{ label: 'Explore Platform', href: ROUTES.features }}
      />
    </>
  )
}
