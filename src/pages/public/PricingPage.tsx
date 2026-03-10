import { motion } from 'framer-motion'

import { CTASection } from '../../components/common/CTASection'
import { PricingCard } from '../../components/common/PricingCard'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const pricingTiers = [
  {
    name: 'Starter',
    price: '$29/mo',
    description: 'For small portfolios starting digital operations.',
    features: ['Up to 10 properties', 'Tenant management', 'Support tickets', 'Email notifications'],
    ctaLabel: 'Start Starter',
    ctaHref: ROUTES.ownerLogin,
  },
  {
    name: 'Professional',
    price: '$89/mo',
    description: 'For growing teams with active tenant support volume.',
    features: ['Up to 75 properties', 'Advanced reminder scheduling', 'Priority support', 'Dashboard analytics'],
    ctaLabel: 'Choose Professional',
    ctaHref: ROUTES.ownerLogin,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large portfolios and custom deployment requirements.',
    features: ['Custom deployment', 'Large portfolio support', 'Dedicated support', 'Integration planning'],
    ctaLabel: 'Talk to Sales',
    ctaHref: ROUTES.contact,
  },
]

export function PricingPage() {
  usePageSeo({
    title: 'Pricing',
    description: 'Choose TenantFlow pricing plans for starter, professional, and enterprise property management workflows.',
    canonicalPath: ROUTES.pricing,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      name: 'TenantFlow Pricing',
      description: 'Starter, Professional, and Enterprise pricing options for property operations teams.',
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Pricing</p>
          <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">
            Simple plans for every portfolio stage
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Start with core tenant workflows, then scale into advanced reminders and premium rollout support.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
            No setup fees. Cancel anytime.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid gap-4 lg:grid-cols-3"
        >
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              ctaLabel={tier.ctaLabel}
              ctaHref={tier.ctaHref}
              highlighted={tier.highlighted}
            />
          ))}
        </motion.div>
      </SectionContainer>

      <CTASection
        title="Need a plan aligned to your portfolio?"
        description="Our team can help map workflows and pricing to your tenant volume and support model."
        primaryAction={{ label: 'Contact Sales', href: ROUTES.contact }}
        secondaryAction={{ label: 'Owner Login', href: ROUTES.ownerLogin }}
      />
    </>
  )
}


