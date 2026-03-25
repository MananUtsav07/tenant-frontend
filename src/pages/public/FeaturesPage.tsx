import { motion } from 'framer-motion'
import { Bot, Building2, LayoutDashboard, MessageCircle, Send, ShieldCheck, UserRound } from 'lucide-react'

import { CTASection } from '../../components/common/CTASection'
import { FeatureCard } from '../../components/common/FeatureCard'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const featureItems = [
  {
    title: 'Owner Command Center',
    description: 'Track residents, open issues, reminder queues, and approvals across your portfolio in one premium control surface.',
    detail: 'Executive-grade visibility',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Resident Workspace',
    description: 'Give tenants a polished portal for support, rent confirmation, and property details without exposing owner operations.',
    detail: 'Resident-ready experience',
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    title: 'Access Governance',
    description: 'Control workspace boundaries, visibility rules, and operational permissions without adding friction to daily use.',
    detail: 'Controlled role visibility',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'AI Workflow Assistance',
    description: 'Layer AI-assisted reminders, activity logs, and service workflows into the operation without losing human control.',
    detail: 'Automation with governance',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: 'Property & Lease Structure',
    description: 'Keep buildings, units, rent terms, and resident records organized in a way that scales cleanly with portfolio growth.',
    detail: 'Portfolio structure clarity',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'WhatsApp Integration',
    description: 'Send rent reminders, maintenance updates, and service notifications directly to residents via WhatsApp for instant reach.',
    detail: 'Instant resident messaging',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: 'Telegram Integration',
    description: 'Connect your operations to Telegram for real-time owner alerts, team coordination, and automated status updates.',
    detail: 'Real-time team alerts',
    icon: <Send className="h-5 w-5" />,
  },
]

const workspacePillars = [
  {
    title: 'Owners',
    description: 'Run operations, approvals, and collections cadence from a single command layer.',
  },
  {
    title: 'Tenants',
    description: 'Access a cleaner support and rent experience with fewer back-and-forth touchpoints.',
  },
  {
    title: 'Operations',
    description: 'Keep approvals, reminders, and service workflows moving through one measured operating rhythm.',
  },
]

const messagingChannels = [
  {
    title: 'WhatsApp Business',
    description: 'Reach residents where they already are. Automated rent reminders, maintenance confirmations, and payment receipts via WhatsApp.',
    color: '#25D366',
    icon: <MessageCircle className="h-6 w-6" />,
    features: ['Rent reminder automation', 'Maintenance status updates', 'Payment confirmation receipts', 'Two-way resident communication'],
  },
  {
    title: 'Telegram Alerts',
    description: 'Keep your operations team in sync with instant Telegram notifications for approvals, escalations, and portfolio updates.',
    color: '#0088cc',
    icon: <Send className="h-6 w-6" />,
    features: ['Owner approval notifications', 'Escalation alerts', 'Daily portfolio summaries', 'Team coordination channels'],
  },
]

export function FeaturesPage() {
  usePageSeo({
    title: 'Platform Features',
    description:
      'Explore Prophives features for owners and residents across AI workflows, rent operations, and portfolio visibility.',
    canonicalPath: ROUTES.features,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Prophives Features',
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
      <SectionContainer size="wide" tone="cream">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Platform Features</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[#1A1A1A] md:text-6xl">
            Purpose-built for premium property operations
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B7280] md:text-lg">
            Prophives combines owner oversight, resident service, and AI-assisted workflow management into one
            polished system designed for serious B2B real estate teams.
          </p>
        </motion.div>
      </SectionContainer>

      <SectionContainer size="wide">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
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

      {/* WhatsApp & Telegram Integration Section */}
      <SectionContainer size="wide" tone="ivory">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Messaging Integrations</span>
          <h2 className="ph-title mt-5 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
            Reach residents and teams on the channels they use
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#6B7280]">
            Connect your property operations to WhatsApp and Telegram for instant communication, automated alerts, and seamless resident engagement.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid gap-6 md:grid-cols-2"
        >
          {messagingChannels.map((channel) => (
            <motion.article
              key={channel.title}
              variants={revealVariants}
              className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  {channel.icon}
                </div>
                <h3 className="ph-title text-xl font-bold text-[#1A1A1A]">{channel.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{channel.description}</p>
              <ul className="mt-4 space-y-2">
                {channel.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#4B5563]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: channel.color }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </SectionContainer>

      <SectionContainer size="wide" tone="cream">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Workspace Design</span>
          <h2 className="ph-title mt-5 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
            One system with clear access and role separation
          </h2>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 grid gap-4 md:grid-cols-3"
        >
          {workspacePillars.map((pillar) => (
            <motion.article
              key={pillar.title}
              variants={revealVariants}
              className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm"
            >
              <p className="ph-label text-xs font-semibold uppercase tracking-[0.18em] text-[#92700A]">{pillar.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{pillar.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </SectionContainer>

      <CTASection
        eyebrow="Rollout Design"
        title="See these features mapped to your portfolio workflow"
        description="We can help you shape the owner and resident experience so the platform feels premium from day one."
        primaryAction={{ label: 'Book Private Demo', href: ROUTES.contact }}
        secondaryAction={{ label: 'View Pricing', href: ROUTES.pricing }}
      />
    </>
  )
}
