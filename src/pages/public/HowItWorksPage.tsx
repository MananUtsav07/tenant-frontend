import { motion } from 'framer-motion'
import { BellRing, Building2, ClipboardList, KeyRound, MessageSquareText, UserPlus } from 'lucide-react'

import { CTASection } from '../../components/common/CTASection'
import { SectionContainer } from '../../components/common/SectionContainer'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const workflow = [
  {
    title: 'Owner registers account',
    description: 'Create an owner account and set your support profile details.',
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    title: 'Owner creates property',
    description: 'Add property and unit information in the owner dashboard.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Owner adds tenants',
    description: 'Create tenant records with lease, rent, and due-day settings.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Tenants receive access ID',
    description: 'Each tenant gets a generated tenant access ID for portal login.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: 'Tenants log in and interact',
    description: 'Tenants can view details and raise support tickets through the portal.',
    icon: <MessageSquareText className="h-5 w-5" />,
  },
  {
    title: 'Owner gets updates',
    description: 'Owner receives updates via dashboard tickets, reminders, and notifications.',
    icon: <BellRing className="h-5 w-5" />,
  },
]

export function HowItWorksPage() {
  usePageSeo({
    title: 'How It Works',
    description: 'Learn the six-step TenantFlow workflow from owner onboarding to tenant support and notifications.',
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      <SectionContainer size="wide">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">How It Works</p>
          <h1 className="mt-2 font-[Space_Grotesk] text-4xl font-semibold text-slate-950 md:text-5xl">
            A clear workflow for owners and tenants
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            TenantFlow follows a practical lifecycle from onboarding to support resolution, so property teams can operate with structure.
          </p>
        </motion.div>

        <motion.ol
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative mt-10 space-y-4"
        >
          <div className="pointer-events-none absolute bottom-12 left-[23px] top-12 hidden w-px bg-gradient-to-b from-blue-300 via-slate-300 to-transparent sm:block" />
          {workflow.map((step) => (
            <motion.li key={step.title} variants={revealVariants} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.65)] sm:pl-20">
              <div className="mb-3 flex items-center gap-3 sm:absolute sm:left-4 sm:top-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-blue-300">
                  {step.icon}
                </span>
              </div>
              <h2 className="font-[Space_Grotesk] text-2xl font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-slate-600">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </SectionContainer>

      <CTASection
        title="Ready to set this up for your portfolio?"
        description="Start with owner onboarding and move from property setup to tenant support in one system."
        primaryAction={{ label: 'Create Owner Account', href: ROUTES.ownerLogin }}
        secondaryAction={{ label: 'Contact Team', href: ROUTES.contact }}
      />
    </>
  )
}


