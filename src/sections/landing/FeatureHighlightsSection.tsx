import { motion } from 'framer-motion'
import { Bot, Building2, CircleDollarSign, ShieldCheck, Sparkles, Workflow } from 'lucide-react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { FeatureCard } from '../../components/common/FeatureCard'
import { SectionContainer } from '../../components/common/SectionContainer'

const features = [
  {
    title: 'Resident Experience Intelligence',
    description: 'Keep resident requests, approvals, and follow-up communication inside one polished service layer.',
    detail: 'Resident service orchestration',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: 'Portfolio Command Visibility',
    description: 'Track tenants, issues, rent readiness, and automation health across every building from a single command center.',
    detail: 'Portfolio-wide signal clarity',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'AI Rent Chasing Workflows',
    description: 'Automate reminder timing, monitor exceptions, and keep collections communication measured and consistent.',
    detail: 'Collections without clutter',
    icon: <CircleDollarSign className="h-5 w-5" />,
  },
  {
    title: 'Approval and Exception Queues',
    description: 'Route payment confirmations and operational approvals into clear review states for faster owner action.',
    detail: 'Fewer blind spots',
    icon: <Workflow className="h-5 w-5" />,
  },
  {
    title: 'Secure Multi-Role Access',
    description: 'Separate owner and resident workspaces while keeping data visibility elegant and controlled.',
    detail: 'Luxury-grade access control',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Premium Automation Foundation',
    description: 'Launch AI-assisted workflows gradually with dashboards, activity logs, and human oversight built in.',
    detail: 'Automation with restraint',
    icon: <Sparkles className="h-5 w-5" />,
  },
]

export function FeatureHighlightsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer id="feature-highlights" size="wide">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <span className="ph-kicker">Platform Architecture</span>
        <h2 className="ph-title mt-6 max-w-4xl text-3xl font-semibold text-[var(--ph-text)] md:text-[3.2rem]">
          Everything a premium property team needs to run calmer operations
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
          Prophives is built for luxury real estate teams that want structure, clarity, and AI assistance without
          sacrificing control.
        </p>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-4 lg:gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {features.map((feature) => (
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
  )
}
