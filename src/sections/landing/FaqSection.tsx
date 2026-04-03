import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { SectionContainer } from '../../components/common/SectionContainer'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer:
      'You can set up your account, add properties, and onboard tenants in under 5 minutes. The platform is designed for zero learning curve with an intuitive interface.',
  },
  {
    question: 'Can owners and tenants have separate portals?',
    answer:
      'Yes. Owners get a full management dashboard while tenants get their own portal to view property details, submit tickets, track payments, and contact support.',
  },
  {
    question: 'How does the AI automation work?',
    answer:
      'Prophives uses AI to classify support tickets, generate smart reminders, and summarize ticket threads. All AI actions have human oversight - key approvals still stay under your control.',
  },
  {
    question: 'What messaging integrations are available?',
    answer:
      'We integrate with WhatsApp for direct tenant communication and Telegram for automated notifications, payment alerts, and ticket updates.',
  },
  {
    question: 'Can I start small and scale later?',
    answer:
      'Yes. Our pricing tiers support everything from small landlords with a few properties to enterprise portfolios with unlimited properties and tenants.',
  },
]

export function FaqSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide" tone="cream">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <span className="ph-kicker">FAQ</span>
        <h2 className="ph-title mt-5 text-3xl font-bold text-white md:text-4xl">
          Common questions
        </h2>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-10 space-y-3 max-w-3xl"
      >
        {faqs.map((faq) => (
          <motion.details
            key={faq.question}
            variants={revealVariants}
            className="group rounded-xl border border-[#272839] bg-[#101114] p-5 shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="text-base font-semibold text-white">{faq.question}</span>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(34,81,227,0.12)] text-[#4E79FF]">
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#8D8D96]">{faq.answer}</p>
          </motion.details>
        ))}
      </motion.div>
    </SectionContainer>
  )
}
