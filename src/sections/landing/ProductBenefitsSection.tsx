import { motion } from 'framer-motion'
import { BellElectric, Building, Clock10, MessageSquare } from 'lucide-react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { SectionContainer } from '../../components/common/SectionContainer'

const benefits = [
  {
    title: 'Shorter response loops',
    description: 'Owners and operators stay ahead of service issues before they become resident dissatisfaction.',
    icon: <Clock10 className="h-5 w-5" />,
  },
  {
    title: 'Cleaner operational memory',
    description: 'Every lease detail, workflow state, and resident request stays structured instead of disappearing across chats.',
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: 'Measured collections follow-up',
    description: 'Automated reminder timing keeps rent communication firm, consistent, and brand-safe.',
    icon: <BellElectric className="h-5 w-5" />,
  },
  {
    title: 'One service narrative',
    description: 'Support tickets, notifications, and approvals all sit inside one premium operating layer.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

export function ProductBenefitsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Why Prophives</span>
          <h2 className="ph-title mt-6 max-w-xl text-3xl font-semibold text-[var(--ph-text)] md:text-5xl">
            Built for teams managing premium assets, not generic rentals
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
            Prophives helps Dubai real estate operators move faster with fewer gaps by bringing AI-assisted service,
            collections discipline, and portfolio visibility into one authoritative environment.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 lg:gap-5 sm:grid-cols-2"
        >
          {benefits.map((benefit) => (
            <motion.article
              key={benefit.title}
              variants={revealVariants}
              className="ph-surface-card-soft rounded-lg p-5 sm:p-6"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[rgba(240,163,35,0.16)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
                {benefit.icon}
              </div>
              <h3 className="ph-title mt-5 text-lg font-semibold text-[var(--ph-text)]">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ph-text-muted)]">{benefit.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </SectionContainer>
  )
}
