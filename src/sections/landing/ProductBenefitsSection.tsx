import { motion } from 'framer-motion'
import { BellElectric, Building, Clock10, MessageSquare } from 'lucide-react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { SectionContainer } from '../../components/common/SectionContainer'

const benefits = [
  {
    title: 'Save time managing tenants',
    description: 'Replace fragmented spreadsheets and chat threads with a single operating workspace.',
    icon: <Clock10 className="h-5 w-5" />,
  },
  {
    title: 'Organized property management',
    description: 'Keep properties, leases, and tenant records structured and searchable.',
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: 'Never miss rent reminders',
    description: 'Automated schedules reduce manual follow-up and keep rent operations consistent.',
    icon: <BellElectric className="h-5 w-5" />,
  },
  {
    title: 'Centralized communication',
    description: 'Track support tickets and owner notifications in one dashboard timeline.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

export function ProductBenefitsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Benefits</p>
          <h2 className="mt-2 font-[Space_Grotesk] text-3xl font-semibold text-slate-950 md:text-4xl">
            Built for teams that manage real properties
          </h2>
          <p className="mt-4 text-slate-600">
            TenantFlow helps owner teams move faster with fewer errors by unifying tenant management, support handling, and reminder workflows.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2"
        >
          {benefits.map((benefit) => (
            <motion.article key={benefit.title} variants={revealVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.6)]">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-900">{benefit.icon}</div>
              <h3 className="mt-3 font-[Space_Grotesk] text-lg font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{benefit.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </SectionContainer>
  )
}


