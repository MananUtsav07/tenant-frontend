import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  CheckCircle,
  Landmark,
  Mail,
  MessageCircle,
  Monitor,
  Send,
  Smartphone,
  UserCircle,
  Wallet,
  Zap,
} from 'lucide-react'

import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const featureShowcases = [
  {
    kicker: 'Intelligence',
    kickerColor: 'text-[#FED609]',
    kickerIcon: <BrainCircuit className="h-5 w-5" />,
    title: 'AI-Powered Automation',
    description:
      'Say goodbye to manual sorting. Our AI automatically classifies incoming maintenance tickets and summarizes tenant requests, ensuring urgent issues never fall through the cracks.',
    bullets: ['Automatic ticket classification', 'Instant request summarization'],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLr2hYooGWiek5ZC3kPCBJErrzB3sbc7mpXT75v1_yE1WsldJlS7ZdbBQgnctN9duWoLuzalQ_Ey-beCYK4OvyzuuKKWmeeKIcOrjvqyN4q3wNob7Ccju6VXXI3KDux7YAuCML642CKcomet_5G7t22xPjxeW7yjJnIqkO0I5AP4xqe8OkefaYRwviwYA_JAdLKExZufeCMlTR3OulKBjQy_O6KBeye9NhpiZpSlU_SqYrbe0Ujn4zAlvG786oan5y607n2_Xa3BvK',
    imageAlt: 'AI Automation Interface',
    imageFirst: false,
  },
  {
    kicker: 'Communication',
    kickerColor: 'text-[#25D366]',
    kickerIcon: <MessageCircle className="h-5 w-5" />,
    title: 'WhatsApp Integration',
    description:
      'Connect with your tenants where they are. Prophives integrates directly with WhatsApp to send automated rent reminders and facilitate seamless direct communication.',
    quote: '"Rent for Unit 402 is due in 3 days. Click here to pay via secure link."',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMbaU3Y0_RAZnGyWtwsoQA85hGV_WodO9uR1fTOhtKeV7Q3aE-aaCXIXW54-nNdyHQvQBfXlbKk62Is6Qyu4cEdNIyW1qlOmgOD0fQo3PPYyc1s5bXgEYO8oeOBUFL_qd4vkXxwMdggP7wSKbUCTGbdTHRvI15tgyW05d_mq4o-BLLAv43-iOYPZ0MMbjR8kgO7StqDaHq7py-ZKXM4M5XMBv38iFXwGGXAIoC25ULsZti9OH0ELNcX-zu8tk9gG4nWTN6nWe9gZTR',
    imageAlt: 'WhatsApp Chat Mockup',
    imageFirst: true,
  },
  {
    kicker: 'Automation',
    kickerColor: 'text-[#0088cc]',
    kickerIcon: <Bot className="h-5 w-5" />,
    title: 'Telegram Bot Integration',
    description:
      'Stay updated on the go. Our Telegram bot provides real-time notifications for support ticket updates, ensuring property managers are always in the loop without checking the dashboard.',
    bullets: ['Real-time support updates', 'Lightning-fast bot interactions'],
    bulletIcons: [<Bell className="h-[18px] w-[18px] text-[#FED609]" key="bell" />, <Zap className="h-[18px] w-[18px] text-[#FED609]" key="zap" />],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgy10SfKkjioA7tFp-_ir32zWqTNurmf1n03vnXNqS_PGPBuWEOCUnCK30_zZsXgz8fP7-YJW7Cc6ew_zHjciuPlLs0GnEpXObkEzkAg_cr2_rhCM_AxpBlIktEdpQNeBAPlIZ9LoDUHOWHfmVzMuZhuv29izzvU5HsyAQLTq288bi896m_mLNlcHlKy8Ie9PTzUWzyl8OClsK4ktsgfhD6QkajR8Tas1RQhkKb-euAWJwJ0RK0nYNHWXIxjT9yh1uAlx4hEwOJZNY',
    imageAlt: 'Telegram Bot UI',
    imageFirst: false,
  },
  {
    kicker: 'Finance',
    kickerColor: 'text-[#FED609]',
    kickerIcon: <Wallet className="h-5 w-5" />,
    title: 'Payment Tracking',
    description:
      'Eliminate financial blind spots. Monitor rent status across your entire portfolio with automated overdue alerts and comprehensive financial reporting.',
    stats: [
      { label: 'Collection Rate', value: '98.5%' },
      { label: 'Overdue Tickets', value: '04' },
    ],
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqjDIkJVXV_aWxJoQNxCgbMuGxQIpHylkkuB2hsdsRIiRiuUH77nXbdVf_wx8_2b_z6BnHpXfOO8bkSEQf9elGLSJ2Fj3fxTEgThhM4z1krDKdcU92JvgkUo2OWWpv25bTUxs-aWJoLVHC6wO-eTEHu1Ar9FKQ27UGEhGgT-5bVYH0Tgu1kL3t6YiwCCCC3_8xM0jDaa0PmS0qFdz9OarKsZyeMDbcLfSeqRuSz9VP2w6fqegMhsUWIux4zRpyvYIAfb47s8CwR889',
    imageAlt: 'Payment Tracking Dashboard',
    imageFirst: true,
  },
  {
    kicker: 'Experience',
    kickerColor: 'text-[#FED609]',
    kickerIcon: <UserCircle className="h-5 w-5" />,
    title: 'Tenant Portal',
    description:
      'Empower your tenants with a dedicated self-service hub. Tenants can view property details, pay rent, and submit maintenance tickets in just a few clicks.',
    linkText: 'Learn more about portal features',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB37GzCUfFkelQg1wKxaVoLm5A7FZ6pkwgvs9HOOUSfUwC4t2XLGhYbbkb3hOiRjtGCyf-eA6cGjq4t6VzndLIe8w0qmQdNE1CkOAHLOhmBrZEsQhO4aKFM_ljt83JnFdtLOyMTWZhpKL6ES_nDXqxQLJuiTwNjqzHacXdEvYpPmpdEO1_oXvhMmRJwYfjQxkGwhzmg-hAD8RPulz_cz9cKUQde0vMeW1g-EjgDL_KppC_QX_NS1wxh1AplbaBm0-w2IUAA8Eq6rXd4',
    imageAlt: 'Tenant Portal Interface',
    imageFirst: false,
  },
  {
    kicker: 'Alerts',
    kickerColor: 'text-[#FED609]',
    kickerIcon: <Bell className="h-5 w-5" />,
    title: 'Smart Notifications',
    description:
      'Never miss a beat. Real-time alerts delivered through multiple channels—email, SMS, and in-app—keep everyone informed and responsive.',
    channelIcons: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMnvnyf-iKJsH58M0O0NK4EBLATFYkAUt_mb2o9lYezo1NA2-_nH_NhAqVS0Nhjj1Q91ijdCbXmsvIcKAFowGYPvosPGwJIPXV0ymK4z-t9GaFJ5YevOUlApqeaBhvp47a6jmseDzAdji6THx-6zm6k2hdURpUcSGNG9WDJEvOcFV7GN_qy_0fuxoKTUz0PfGvd7Z8ixJEBpdZ0hTPUxwPkTJxvpz6FjDiB1_fl3YeMC5SgeoLTtHw-vpudtkXGcHdQG2XUyquEaN_',
    imageAlt: 'Smart Notifications Mockup',
    imageFirst: true,
  },
] as const

const integrations = [
  { icon: <MessageCircle className="h-7 w-7" />, label: 'WhatsApp' },
  { icon: <Send className="h-7 w-7" />, label: 'Telegram' },
  { icon: <BrainCircuit className="h-7 w-7" />, label: 'AI Core' },
  { icon: <Wallet className="h-7 w-7" />, label: 'Payments' },
  { icon: <Landmark className="h-7 w-7" />, label: 'Bank Direct' },
]

/* ------------------------------------------------------------------ */
/*  Structured data kept for SEO                                       */
/* ------------------------------------------------------------------ */

const featureItemsForSeo = [
  'AI-Powered Automation',
  'WhatsApp Integration',
  'Telegram Bot Integration',
  'Payment Tracking',
  'Tenant Portal',
  'Smart Notifications',
]

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

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
      <section className="bg-[#FEFAEF] py-20 md:py-32 px-6">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="ph-title text-4xl md:text-6xl font-extrabold tracking-tight text-[#1A1A1A] mb-6">
            Everything You Need to{' '}
            <span className="text-[#FED609]">Manage Properties</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B7280] font-medium max-w-2xl mx-auto font-['Manrope']">
            Experience the future of real estate management in Dubai with our AI-driven platform
            designed for efficiency, clarity, and total control.
          </p>
        </motion.div>
      </section>

      {/* Feature Showcase */}
      <section className="max-w-7xl mx-auto px-6 space-y-24 pb-24">
        {featureShowcases.map((feature) => {
          const imageBlock = (
            <motion.div
              variants={revealVariants}
              className="bg-white p-4 rounded-xl shadow-xl shadow-[#FED609]/5"
            >
              <img
                alt={feature.imageAlt}
                src={feature.image}
                className="rounded-lg w-full h-auto"
              />
            </motion.div>
          )

          const textBlock = (
            <motion.div variants={revealVariants} className={feature.imageFirst ? '' : 'order-2 md:order-1'}>
              {/* Kicker */}
              <div className={`flex items-center gap-2 ${feature.kickerColor} mb-4`}>
                {feature.kickerIcon}
                <span className="font-bold text-sm tracking-wider uppercase font-['DM_Sans']">
                  {feature.kicker}
                </span>
              </div>

              <h2 className="ph-title text-3xl font-bold text-[#1A1A1A] mb-6">{feature.title}</h2>
              <p className="text-[#6B7280] leading-relaxed mb-6 font-['Manrope']">{feature.description}</p>

              {/* Bullet list */}
              {'bullets' in feature && feature.bullets && (
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, i) => (
                    <li key={bullet} className="flex items-center gap-3">
                      {'bulletIcons' in feature && feature.bulletIcons ? (
                        feature.bulletIcons[i]
                      ) : (
                        <CheckCircle className="h-[18px] w-[18px] text-[#FED609]" />
                      )}
                      <span className="font-medium">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Quote callout */}
              {'quote' in feature && feature.quote && (
                <div className="bg-[#FFFAE2] p-6 rounded-lg border-l-4 border-[#FED609]">
                  <p className="italic text-[#1A1A1A] font-medium">{feature.quote}</p>
                </div>
              )}

              {/* Stat cards */}
              {'stats' in feature && feature.stats && (
                <div className="grid grid-cols-2 gap-4">
                  {feature.stats.map((stat) => (
                    <div key={stat.label} className="p-4 bg-white border border-[#FED609]/20 rounded-lg">
                      <p className="text-xs text-[#6B7280] font-['DM_Sans']">{stat.label}</p>
                      <p className="text-xl font-bold text-[#FED609]">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Link button */}
              {'linkText' in feature && feature.linkText && (
                <Link
                  to={ROUTES.features}
                  className="inline-flex items-center gap-2 font-bold text-[#FED609] hover:text-[#FFD70B] transition-colors"
                >
                  {feature.linkText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {/* Channel icons */}
              {'channelIcons' in feature && feature.channelIcons && (
                <div className="flex gap-4">
                  {[
                    <Mail className="h-4 w-4" key="mail" />,
                    <Smartphone className="h-4 w-4" key="sms" />,
                    <Monitor className="h-4 w-4" key="devices" />,
                  ].map((icon, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 rounded-full bg-[#FFFAE2] flex items-center justify-center text-[#FED609] border border-[#FED609]/20"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )

          return (
            <motion.div
              key={feature.title}
              variants={staggerVariants}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {feature.imageFirst ? (
                <>
                  {imageBlock}
                  {textBlock}
                </>
              ) : (
                <>
                  {textBlock}
                  <motion.div
                    variants={revealVariants}
                    className="order-1 md:order-2 bg-white p-4 rounded-xl shadow-xl shadow-[#FED609]/5"
                  >
                    <img
                      alt={feature.imageAlt}
                      src={feature.image}
                      className="rounded-lg w-full h-auto"
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
          )
        })}
      </section>

      {/* Integration Banner */}
      <section className="bg-[#FED609] py-12">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
          >
            {integrations.map((item) => (
              <motion.div key={item.label} variants={revealVariants} className="flex items-center gap-3">
                {item.icon}
                <span className="font-bold tracking-tight">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#FFFAE2]">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="ph-title text-3xl md:text-5xl font-extrabold text-[#1A1A1A] mb-8">
            Start Managing Smarter Today
          </h2>
          <p className="text-[#6B7280] text-lg mb-10 max-w-xl mx-auto font-['Manrope']">
            Join hundreds of Dubai property managers who are scaling their business with Prophives
            AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={ROUTES.contact}
              className="w-full sm:w-auto bg-[#FED609] text-[#1A1A1A] px-10 py-4 rounded-full font-bold text-lg active:scale-95 duration-150 hover:bg-[#FFD70B] shadow-lg text-center transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to={ROUTES.pricing}
              className="w-full sm:w-auto border-2 border-[#FED609] text-[#1A1A1A] px-10 py-4 rounded-full font-bold text-lg active:scale-95 duration-150 hover:bg-white transition-colors text-center"
            >
              Book a Demo
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
