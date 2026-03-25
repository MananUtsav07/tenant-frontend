import { motion } from 'framer-motion'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const steps = [
  {
    number: 1,
    title: 'Onboard Properties',
    description: 'Bulk upload your portfolio details or sync with existing ERP systems in seconds.',
  },
  {
    number: 2,
    title: 'Connect Tenants',
    description:
      'Invite tenants via WhatsApp. They get a branded dashboard with no app download required.',
  },
  {
    number: 3,
    title: 'Automate Everything',
    description:
      'Relax as Prophives AI handles billing, contracts, and routine communications for you.',
  },
]

export function HowItWorksSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <section className="bg-[#FFFAE2] px-4 py-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-20 text-center"
        >
          <h2 className="ph-title text-4xl font-bold text-[#1A1A1A]">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#6B7280]">
            Get up and running in minutes, not months.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative grid grid-cols-1 gap-16 md:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={revealVariants}
              className="relative flex flex-col items-center text-center"
            >
              <div className="z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FED609] text-2xl font-black shadow-lg shadow-[#FED609]/20">
                {step.number}
              </div>
              <h5 className="ph-title text-xl font-bold text-[#1A1A1A]">{step.title}</h5>
              <p className="mt-3 text-[#6B7280]">{step.description}</p>
            </motion.div>
          ))}

          {/* Connector line (hidden on mobile) */}
          <div className="absolute left-[20%] right-[20%] top-8 hidden h-0.5 border-t-2 border-dashed border-[#FED609]/40 md:block" />
        </motion.div>
      </div>
    </section>
  )
}
