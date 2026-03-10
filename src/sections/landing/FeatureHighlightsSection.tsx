import { motion } from 'framer-motion'
import { BellRing, Building2, Clock3, MessageSquareText, Sparkles } from 'lucide-react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { FeatureCard } from '../../components/common/FeatureCard'
import { SectionContainer } from '../../components/common/SectionContainer'

const features = [
  {
    title: 'Tenant Communication',
    description: 'Centralize conversations and account details for every tenant profile.',
    detail: 'Keep all context in one place.',
    icon: <MessageSquareText className="h-5 w-5" />,
  },
  {
    title: 'Support Ticket Automation',
    description: 'Track maintenance requests from open to resolved with clear visibility.',
    detail: 'No more missed issues.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Rent Reminders',
    description: 'Trigger scheduled reminders before due dates and follow-ups after due dates.',
    detail: 'Never miss rent reminders.',
    icon: <Clock3 className="h-5 w-5" />,
  },
  {
    title: 'Property Dashboard',
    description: 'Manage properties, units, and occupancy with owner-first workflows.',
    detail: 'Designed for busy portfolios.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Notifications',
    description: 'Surface owner alerts for ticket updates, overdue rent, and reminder events.',
    detail: 'Act faster with one alert feed.',
    icon: <BellRing className="h-5 w-5" />,
  },
]

export function FeatureHighlightsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer id="feature-highlights" size="wide">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Feature Highlights</p>
        <h2 className="mt-2 font-[Space_Grotesk] text-3xl font-semibold text-slate-950 md:text-4xl">
          Everything needed to run operations smoothly
        </h2>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
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


