import { motion } from 'framer-motion'
import { ArrowRight, Building2, ClipboardList, KeyRound, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { Button } from '../../components/common/Button'
import { SectionContainer } from '../../components/common/SectionContainer'
import { ROUTES } from '../../routes/constants'

const steps = [
  {
    title: 'Onboard Properties',
    description: 'Add your properties with addresses, units, and details in minutes.',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Connect Tenants',
    description: 'Add tenants, set lease dates, rent amounts, and give them portal access.',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Set Up Messaging',
    description: 'Connect WhatsApp and Telegram for instant tenant communication.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    title: 'Automate Everything',
    description: 'Enable AI automation for tickets, reminders, and payment tracking.',
    icon: <Sparkles className="h-5 w-5" />,
  },
]

export function HowItWorksSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer className="py-10 md:py-12" size="wide" tone="ivory">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="ph-kicker">How It Works</span>
            <h2 className="ph-title mt-5 text-3xl font-bold text-[#1A1A1A] md:text-4xl">
              Get started in minutes, not days
            </h2>
          </div>
          <Button to={ROUTES.howItWorks} variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
            Learn More
          </Button>
        </div>
      </motion.div>

      <motion.ol
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            variants={revealVariants}
            className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(254,214,9,0.12)] text-[#92700A]">
                {step.icon}
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FED609] text-sm font-bold text-[#1A1A1A]">
                {index + 1}
              </span>
            </div>
            <h3 className="ph-title mt-4 text-lg font-bold text-[#1A1A1A]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{step.description}</p>
          </motion.li>
        ))}
      </motion.ol>

      <p className="mt-6 text-sm text-[#6B7280]">
        Want a walkthrough for your portfolio?{' '}
        <Link to={ROUTES.contact} className="font-semibold text-[#D4A800] hover:text-[#92700A]">
          Talk to our team
        </Link>
        .
      </p>
    </SectionContainer>
  )
}
