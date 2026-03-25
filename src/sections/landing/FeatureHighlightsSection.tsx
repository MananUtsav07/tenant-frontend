import { motion } from 'framer-motion'
import { CreditCard, MessageCircle, Send, ShieldCheck, Sparkles, Users } from 'lucide-react'

import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import { FeatureCard } from '../../components/common/FeatureCard'
import { SectionContainer } from '../../components/common/SectionContainer'

const features = [
  {
    title: 'AI Automation',
    description: 'Smart ticket classification, automated reminders, and AI-generated summaries to save you hours every week.',
    detail: 'AI-powered',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'WhatsApp Integration',
    description: 'Send rent reminders and communicate with tenants directly via WhatsApp. No app switching needed.',
    detail: 'Messaging',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: 'Telegram Bot',
    description: 'Automated notifications, payment alerts, and ticket updates delivered instantly via Telegram.',
    detail: 'Notifications',
    icon: <Send className="h-5 w-5" />,
  },
  {
    title: 'Payment Tracking',
    description: 'Automated rent collection tracking with payment status, overdue alerts, and approval workflows.',
    detail: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Tenant Portal',
    description: 'Tenants can view property details, submit tickets, track payments, and contact support easily.',
    detail: 'Self-service',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Secure Access',
    description: 'Separate owner and tenant workspaces with role-based visibility and controlled data access.',
    detail: 'Security',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
]

export function FeatureHighlightsSection() {
  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <SectionContainer id="feature-highlights" size="wide" tone="panel">
      <motion.div variants={revealVariants} initial="hidden" whileInView="show" viewport={viewportOnce}>
        <span className="ph-kicker">Features</span>
        <h2 className="ph-title mt-5 text-3xl font-bold text-[#1A1A1A] md:text-4xl">
          Everything you need to manage properties
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B7280]">
          From AI automation to integrated messaging, Prophives gives you the tools to run smarter operations.
        </p>
      </motion.div>

      <motion.div
        variants={staggerVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            detail={feature.detail}
          />
        ))}
      </motion.div>
    </SectionContainer>
  )
}
