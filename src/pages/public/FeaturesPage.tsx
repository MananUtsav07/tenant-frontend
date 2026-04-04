import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Bot,
  BrainCircuit,
  CheckCircle,
  MessageCircle,
  UserCircle,
  Wallet,
  Zap,
} from 'lucide-react'

import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

const featureShowcases = [
  {
    kicker: 'Intelligence',
    kickerColor: 'text-[#4E79FF]',
    kickerIcon: <BrainCircuit className="h-5 w-5" />,
    title: 'AI-Powered Automation',
    description:
      'Say goodbye to manual sorting. Our AI automatically classifies incoming maintenance tickets and summarizes tenant requests, ensuring urgent issues never fall through the cracks.',
    bullets: ['Automatic ticket classification', 'Instant request summarization'],
  },
  {
    kicker: 'Communication',
    kickerColor: 'text-[#25D366]',
    kickerIcon: <MessageCircle className="h-5 w-5" />,
    title: 'WhatsApp Integration',
    description:
      'Connect with your tenants where they are. Prophives integrates directly with WhatsApp to send automated rent reminders and facilitate seamless direct communication.',
    quote: '"Rent for Unit 402 is due in 3 days. Click here to pay via secure link."',
  },
  {
    kicker: 'Automation',
    kickerColor: 'text-[#0088cc]',
    kickerIcon: <Bot className="h-5 w-5" />,
    title: 'Telegram Bot Integration',
    description:
      'Stay updated on the go. Our Telegram bot provides real-time notifications for support ticket updates, ensuring property managers are always in the loop without checking the dashboard.',
    bullets: ['Real-time support updates', 'Lightning-fast bot interactions'],
    bulletIcons: [<Bell className="h-4.5 w-4.5 text-[#4E79FF]" key="bell" />, <Zap className="h-4.5 w-4.5 text-[#4E79FF]" key="zap" />],
  },
  {
    kicker: 'Finance',
    kickerColor: 'text-[#4E79FF]',
    kickerIcon: <Wallet className="h-5 w-5" />,
    title: 'Payment Tracking',
    description:
      'Eliminate financial blind spots. Monitor rent status across your entire portfolio with automated overdue alerts and comprehensive financial reporting.',
    stats: [
      { label: 'Collection Rate', value: '98.5%' },
      { label: 'Overdue Tickets', value: '04' },
    ],
  },
  {
    kicker: 'Experience',
    kickerColor: 'text-[#4E79FF]',
    kickerIcon: <UserCircle className="h-5 w-5" />,
    title: 'Tenant Portal',
    description:
      'Empower your tenants with a dedicated self-service hub. Tenants can view property details, pay rent, and submit maintenance tickets in just a few clicks.',
    linkText: 'Learn more about portal features',
  },
  {
    kicker: 'Alerts',
    kickerColor: 'text-[#4E79FF]',
    kickerIcon: <Bell className="h-5 w-5" />,
    title: 'Smart Notifications',
    description:
      'Never miss a beat. Real-time alerts delivered through multiple channels—email, SMS, and in-app—keep everyone informed and responsive.',
    channelIcons: true,
  },
] as const


const featureItemsForSeo = [
  'AI-Powered Automation',
  'WhatsApp Integration',
  'Telegram Bot Integration',
  'Payment Tracking',
  'Tenant Portal',
  'Smart Notifications',
]

export function FeaturesPage() {
  usePageSeo({
    title: 'Platform Features',
    description:
      'Explore Prophives features for owners and residents across AI workflows, rent operations, and portfolio visibility.',
    canonicalPath: ROUTES.features,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Prophives Features',
      itemListElement: featureItemsForSeo.map((name, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
      })),
    },
  })

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32 px-6 bg-[#06070B]">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full text-center"
        >
          <h1 className="font-['Sora'] text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
            Everything You Need to{' '}
            <span className="text-[#4E79FF]">Manage Properties</span>
          </h1>
          <p className="text-lg md:text-2xl text-[#8D8D96] font-medium max-w-4xl mx-auto font-['Manrope'] leading-relaxed">
            Experience the future of real estate management with our AI-driven platform
            designed for efficiency, clarity, and total control.
          </p>
        </motion.div>
      </section>

      {/* Feature Showcase */}
      <section className="w-full pb-24 px-6 md:px-12 bg-[#06070B]">
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureShowcases.map((feature) => (
            <motion.div
              key={feature.title}
              variants={revealVariants}
              className="flex flex-col bg-[#101114] border border-[#272839] rounded-2xl p-8 hover:border-[rgba(34,81,227,0.4)] transition-colors duration-300"
            >
              {/* Kicker */}
              <div className={`flex items-center gap-2 ${feature.kickerColor} mb-5`}>
                {feature.kickerIcon}
                <span className="font-bold text-xs tracking-widest uppercase font-['DM_Sans']">
                  {feature.kicker}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-['Sora'] text-2xl font-bold text-white mb-3 leading-snug">
                {feature.title}
              </h2>

              {/* Description */}
              <p className="text-[#8D8D96] leading-relaxed font-['Manrope'] text-base mb-6 flex-1">
                {feature.description}
              </p>

              {'bullets' in feature && feature.bullets && (
                <ul className="space-y-2 mb-4">
                  {feature.bullets.map((bullet, i) => (
                    <li key={bullet} className="flex items-center gap-3">
                      {'bulletIcons' in feature && feature.bulletIcons ? (
                        feature.bulletIcons[i]
                      ) : (
                        <CheckCircle className="h-4 w-4 text-[#4E79FF] shrink-0" />
                      )}
                      <span className="text-sm font-medium text-white font-['Manrope']">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {'quote' in feature && feature.quote && (
                <div className="bg-[#06070B] p-5 rounded-lg border-l-4 border-[#2251E3]">
                  <p className="italic text-[#C0C0C5] text-sm font-medium font-['Manrope']">
                    {feature.quote}
                  </p>
                </div>
              )}

              {'stats' in feature && feature.stats && (
                <div className="grid grid-cols-2 gap-4">
                  {feature.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 bg-[#06070B] border border-[#272839] rounded-xl"
                    >
                      <p className="text-xs text-[#8D8D96] font-['DM_Sans'] uppercase tracking-wider mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-[#4E79FF] font-['Sora']">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-[#101114]">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full text-center"
        >
          <h2 className="font-['Sora'] text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            Start Managing Smarter Today
          </h2>
          <p className="text-[#8D8D96] text-xl mb-12 max-w-2xl mx-auto font-['Manrope'] leading-relaxed">
            Join hundreds of property managers worldwide who are scaling their business with Prophives
            AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to={ROUTES.contact}
              className="w-full sm:w-auto bg-[#2251E3] text-white px-12 py-5 rounded-full font-bold text-xl active:scale-95 duration-150 hover:bg-[#4E79FF] shadow-lg shadow-[#2251E3]/30 text-center transition-all font-['DM_Sans']"
            >
              Get Started Free
            </Link>
            <Link
              to={ROUTES.pricing}
              className="w-full sm:w-auto border-2 border-[#272839] text-white px-12 py-5 rounded-full font-bold text-xl active:scale-95 duration-150 hover:border-[#2251E3] hover:bg-[rgba(34,81,227,0.08)] transition-all text-center font-['DM_Sans']"
            >
              Book a Demo
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
