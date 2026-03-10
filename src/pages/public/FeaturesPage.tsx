import { motion } from 'framer-motion'
import { BellRing, Building2, ClipboardList, KeyRound, LayoutDashboard, MessageSquare } from 'lucide-react'

import { CTASection } from '../../components/common/CTASection'
import { FeatureCard } from '../../components/common/FeatureCard'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const featureItems = [
  {
    title: 'Tenant Dashboard',
    description: 'Tenants view property details, payment status, and support history from one login.',
    detail: 'Clear visibility for tenants.',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Owner Dashboard',
    description: 'Owners monitor portfolio metrics like open tickets, active tenants, reminders, and notifications.',
    detail: 'Decision-ready operational data.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Support Ticket System',
    description: 'Capture, prioritize, and resolve maintenance issues with status tracking from start to finish.',
    detail: 'Structured issue lifecycle.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: 'Rent Reminder System',
    description: 'Automated reminder schedules reduce manual follow-up and keep payment communication timely.',
    detail: 'Consistent reminder cadence.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Notifications',
    description: 'Receive owner notifications for ticket events, reminder runs, and important tenant updates.',
    detail: 'Actionable alerts in real time.',
    icon: <BellRing className="h-5 w-5" />,
  },
  {
    title: 'Tenant Access ID',
    description: 'Generate secure access IDs for tenant login without exposing owner-level controls.',
    detail: 'Role-safe account access.',
    icon: <KeyRound className="h-5 w-5" />,
  },
]

export function FeaturesPage() {
  usePageSeo({
    title: 'Features',
    description:
      'Explore TenantFlow features including owner dashboard, tenant portal, support tickets, reminders, and notifications.',
    canonicalPath: ROUTES.features,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'TenantFlow Features',
      itemListElement: featureItems.map((feature, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: feature.title,
      })),
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Features</p>
          <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">Purpose-built for property operations</h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            TenantFlow combines tenant management, owner workflows, and support operations into a single SaaS platform designed for portfolios of any size.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {featureItems.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              detail={feature.detail}
            />
          ))}
        </motion.div>
      </SectionContainer>

      <CTASection
        title="See these features in your own workflow"
        description="Set up your owner account and test the end-to-end tenant experience in a few minutes."
        primaryAction={{ label: 'Owner Login', href: ROUTES.ownerLogin }}
        secondaryAction={{ label: 'View Pricing', href: ROUTES.pricing }}
      />
    </>
  )
}


