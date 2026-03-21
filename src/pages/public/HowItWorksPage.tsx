import { motion } from 'framer-motion'
import { BellRing, Building2, ClipboardList, KeyRound, MessageSquareText, UserPlus } from 'lucide-react'

import { CTASection } from '../../components/common/CTASection'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const workflow = [
  {
    title: 'Owner account and brand setup',
    description: 'Launch your owner workspace with the support profile, company context, and access structure your portfolio needs.',
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    title: 'Property and unit configuration',
    description: 'Create the portfolio structure that will anchor leases, residents, support requests, and reporting.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Resident onboarding and lease entry',
    description: 'Bring tenant details, rent values, due dates, and lease periods into one authoritative system of record.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Secure resident access',
    description: 'Issue tenant access credentials so residents can log in to their own workspace without seeing owner operations.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: 'Service and support activity',
    description: 'Residents submit requests while owners coordinate updates, status changes, and operational follow-up.',
    icon: <MessageSquareText className="h-5 w-5" />,
  },
  {
    title: 'Reminder and approval cycles',
    description: 'Automation helps move rent reminders and payment verification forward while keeping key approvals human-led.',
    icon: <BellRing className="h-5 w-5" />,
  },
]

export function HowItWorksPage() {
  usePageSeo({
    title: 'How Prophives Works',
    description: 'See how Prophives moves from owner setup to resident service, reminders, and approvals across the full workflow.',
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide" tone="navy">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <span className="ph-kicker">Operating Workflow</span>
          <h1 className="ph-title mt-5 text-4xl font-semibold text-[var(--ph-text)] md:text-6xl">
            A clear workflow from portfolio setup to resident service
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ph-text-muted)] md:text-lg">
            Prophives follows a structured operating rhythm so owners and residents always know what happens next and
            where responsibility sits.
          </p>
        </motion.div>
      </SectionContainer>

      <SectionContainer size="wide">
        <motion.ol
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative space-y-4"
        >
          <div className="pointer-events-none absolute bottom-10 left-[23px] top-10 hidden w-px bg-gradient-to-b from-[rgba(240,163,35,0.36)] via-[rgba(83,88,100,0.3)] to-transparent sm:block" />
          {workflow.map((step, index) => (
            <motion.li
              key={step.title}
              variants={revealVariants}
              className="ph-surface-card rounded-xl p-5 sm:pl-20"
            >
              <div className="mb-3 flex items-center gap-3 sm:absolute sm:left-4 sm:top-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(240,163,35,0.18)] bg-[rgba(240,163,35,0.08)] text-[var(--ph-accent)]">
                  {step.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)] sm:hidden">
                  Step {index + 1}
                </span>
              </div>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ph-text-muted)] sm:block">
                Step {index + 1}
              </p>
              <h2 className="ph-title mt-2 text-2xl font-semibold text-[var(--ph-text)]">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ph-text-muted)]">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </SectionContainer>

      <CTASection
        eyebrow="Workflow Mapping"
        title="Ready to shape this operating flow around your portfolio?"
        description="We can help you define how owner and resident workspaces should interact before rollout."
        primaryAction={{ label: 'Talk to the Team', href: ROUTES.contact }}
        secondaryAction={{ label: 'View Pricing', href: ROUTES.pricing }}
      />
    </>
  )
}
