import { motion } from 'framer-motion'

import { CTASection } from '../../components/common/CTASection'
import { PricingCard } from '../../components/common/PricingCard'
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
    name: 'Portfolio',
    price: 'AED 3,900',
    priceNote: 'per month for multi-building operations',
    description: 'For teams that need AI-assisted reminders, approval handling, and stronger operational oversight.',
    features: ['Everything in Core', 'Portfolio oversight analytics', 'Approval queue handling', 'Automation activity visibility'],
    ctaLabel: 'Book Portfolio Demo',
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
  'Dark premium UI for owners and residents',
  'Dedicated onboarding and workflow mapping',
  'Secure role-based access across portfolios',
  'AI-assisted operations without losing control',
]

export function PricingPage() {
  usePageSeo({
    title: 'Pricing',
    description: 'Explore Prophives pricing for Core, Portfolio, and Enterprise real estate operations rollouts.',
    canonicalPath: ROUTES.pricing,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      name: 'Prophives Pricing',
      description: 'Core, Portfolio, and Enterprise pricing options for premium property operations teams.',
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide" tone="navy">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Pricing</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)] md:text-6xl">
            Premium pricing for serious portfolio operations
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
            Dark surfaces do most of the work. Gold marks the moments that matter. The same principle applies to our
            pricing: clear tiers, white-glove rollout, and no noisy packaging.
          </p>
          <p className="mt-5 inline-flex rounded-full border border-[rgba(83,88,100,0.42)] bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--ph-text-muted)]">
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
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              priceNote={tier.priceNote}
              description={tier.description}
              features={tier.features}
              ctaLabel={tier.ctaLabel}
              ctaHref={tier.ctaHref}
              highlighted={tier.highlighted}
              badge={tier.badge}
            />
          ))}
        </motion.div>

        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 grid gap-3 rounded-xl border border-[rgba(83,88,100,0.42)] bg-white/[0.03] p-5 md:grid-cols-2"
        >
          {inclusions.map((item) => (
            <p key={item} className="text-sm text-[var(--ph-text-soft)]">
              • {item}
            </p>
          ))}
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
