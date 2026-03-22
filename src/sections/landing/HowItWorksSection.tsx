import { motion } from 'framer-motion'
import { ArrowRight, Building2, ClipboardList, KeyRound, MessageCircleQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from '../../components/common/Button'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'

const steps = [
  {
    title: 'Launch a property stack',
    description: 'Configure buildings, units, and resident support structure for each portfolio.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Add residents and leases',
    description: 'Bring tenant records, due dates, and payment expectations into one clean operational view.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Issue secure access',
    description: 'Residents get their own workspace without owner-level exposure or operational friction.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: 'Automate requests and reminders',
    description: 'Support issues, rent chasers, and approvals move through clear stages with AI assistance.',
    icon: <MessageCircleQuestion className="h-5 w-5" />,
  },
]

export function HowItWorksSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide" tone="navy">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="ph-kicker">Operating Flow</span>
            <h2 className="ph-title mt-6 max-w-4xl text-3xl font-semibold text-[var(--ph-text)] md:text-4xl">
              A disciplined workflow from onboarding to ongoing service
            </h2>
          </div>
          <Button to={ROUTES.howItWorks} variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
            View Full Workflow
          </Button>
        </div>
      </motion.div>

      <motion.ol
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-4 lg:gap-5 md:grid-cols-2"
      >
        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            variants={revealVariants}
            className="rounded-xl border border-[rgba(83,88,100,0.34)] bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[rgba(240,163,35,0.16)] bg-[rgba(240,163,35,0.06)] text-[var(--ph-accent)]">
                {step.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)]">
                Step {index + 1}
              </span>
            </div>
            <h3 className="ph-title mt-4 text-xl font-semibold text-[var(--ph-text)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{step.description}</p>
          </motion.li>
        ))}
      </motion.ol>

      <p className="mt-6 text-sm text-[var(--ph-text-muted)]">
        Want to see the rollout mapped to your portfolio?{' '}
        <Link to={ROUTES.contact} className="ph-link font-semibold">
          Talk to our team
        </Link>
        .
      </p>
    </SectionContainer>
  )
}
