import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { SectionContainer } from '../../components/common/SectionContainer'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const faqs = [
  {
    question: 'Is Prophives built for Dubai real estate teams specifically?',
    answer:
      'Yes. The brand, pricing narrative, and operating workflows are designed around premium real estate teams in Dubai, especially where resident experience and service standards matter.',
  },
  {
    question: 'Can owners and residents each have separate workspaces?',
    answer:
      'Yes. The platform already supports separate workspaces so each role sees the right view without exposing the rest of the operation.',
  },
  {
    question: 'Does the AI replace human review?',
    answer:
      'No. Prophives is positioned as an AI-assisted operations layer. Automation helps with reminders, triage, and workflow movement, but key approvals still stay under human control.',
  },
  {
    question: 'Can we start with a smaller portfolio and scale later?',
    answer:
      'Yes. The pricing system is set up for staged adoption, from boutique portfolios through larger multi-building operations.',
  },
]

export function FaqSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer size="wide">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <span className="ph-kicker">FAQ</span>
        <h2 className="ph-title mt-6 max-w-4xl text-3xl font-semibold text-[var(--ph-text)] md:text-5xl">
          Questions teams ask before rollout
        </h2>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 space-y-3.5"
      >
        {faqs.map((faq) => (
          <motion.details
            key={faq.question}
            variants={revealVariants}
            className="group rounded-xl border border-[rgba(83,88,100,0.34)] bg-white/[0.02] p-5 sm:p-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="ph-title text-lg font-semibold text-[var(--ph-text)]">{faq.question}</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(240,163,35,0.14)] bg-[rgba(240,163,35,0.05)] text-[var(--ph-accent)]">
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--ph-text-muted)]">{faq.answer}</p>
          </motion.details>
        ))}
      </motion.div>
    </SectionContainer>
  )
}
