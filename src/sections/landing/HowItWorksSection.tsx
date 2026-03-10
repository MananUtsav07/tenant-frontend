import { motion } from 'framer-motion'
import { Building2, ClipboardList, KeyRound, MessageCircleQuestion } from 'lucide-react'
import { Link } from 'react-router-dom'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from '../../components/common/Button'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'

const steps = [
  {
    title: 'Owner creates property',
    description: 'Set up property details and portfolio structure.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Owner adds tenants',
    description: 'Add tenant records and configure lease essentials.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Tenants log in with ID',
    description: 'Generated Tenant Access IDs unlock secure tenant portal login.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: 'Issues and updates flow in',
    description: 'Tenants raise issues while owners track tickets, reminders, and alerts.',
    icon: <MessageCircleQuestion className="h-5 w-5" />,
  },
]

export function HowItWorksSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer className="py-10" size="wide">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce} className="glass-card rounded-3xl border border-slate-200 p-7 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.6)] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">How It Works</p>
            <h2 className="mt-2 font-[Space_Grotesk] text-3xl font-semibold text-slate-950 md:text-4xl">
              A clear 4-step workflow for property operations
            </h2>
          </div>
          <Button to={ROUTES.howItWorks} variant="outline">
            View full flow
          </Button>
        </div>

        <motion.ol
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-8 grid gap-4 md:grid-cols-2"
        >
          {steps.map((step) => (
            <motion.li
              key={step.title}
              variants={revealVariants}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                  {step.icon}
                </span>
              </div>
              <h3 className="mt-3 font-[Space_Grotesk] text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>

        <p className="mt-6 text-sm text-slate-600">
          Need details?{' '}
          <Link to={ROUTES.contact} className="font-semibold text-blue-800 hover:text-blue-700">
            Talk with our team
          </Link>
          .
        </p>
      </motion.div>
    </SectionContainer>
  )
}


