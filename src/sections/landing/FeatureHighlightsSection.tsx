import { motion } from 'framer-motion'
import { MessageCircle, Sparkles, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <Sparkles className="h-7 w-7 text-white" />,
    title: 'AI Automation',
    description:
      'Our neural engine handles complex scheduling, document processing, and tenant screening automatically.',
  },
  {
    icon: <MessageCircle className="h-7 w-7 text-white" />,
    title: 'WhatsApp & Telegram',
    description:
      'Connect with your tenants where they already are. Send automated reminders and receive maintenance requests via bots.',
  },
  {
    icon: <Wallet className="h-7 w-7 text-white" />,
    title: 'Payment Tracking',
    description:
      'Automated bank reconciliation and instant rent alerts. Never chase a missed payment manually again.',
  },
]

export function FeatureHighlightsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <section className="bg-[#06070B] px-4 py-24 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-20 text-center"
        >
          <h2 className="ph-title text-4xl font-bold text-white">
            Powerful Features for Modern Landlords
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#8D8D96]">
            Everything you need to scale your property portfolio without the administrative headache.
          </p>
        </motion.div>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={revealVariants}
              className="group rounded-2xl border border-[#272839] bg-[#101114] p-8 transition-all hover:border-[rgba(34,81,227,0.4)]"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2251E3] transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h4 className="ph-title text-xl font-bold text-white">{feature.title}</h4>
              <p className="mt-3 leading-relaxed text-[#8D8D96]">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
