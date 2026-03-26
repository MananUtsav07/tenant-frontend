import { motion } from 'framer-motion'
import { BrainCircuit, MessageCircle, Wallet, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import { revealUp, staggerParent, useMotionVariants, viewportOnce } from '../../utils/motion'
import type { OwnerSummary, PublicOperationsSnapshot } from '../../types/api'

export function LandingPage() {
  const { owner, token: ownerToken, loading: ownerLoading } = useOwnerAuth()

  const [snapshot, setSnapshot] = useState<PublicOperationsSnapshot | null>(null)
  const [ownerSummary, setOwnerSummary] = useState<OwnerSummary | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)

  const revealVariants = useMotionVariants(revealUp)
  const staggerVariants = useMotionVariants(staggerParent)

  useEffect(() => {
    if (ownerLoading) {
      return
    }

    let cancelled = false

    const loadSnapshot = async () => {
      setSnapshotLoading(true)

      try {
        if (owner && ownerToken) {
          const response = await api.getOwnerSummary(ownerToken)
          if (!cancelled) {
            setOwnerSummary(response.summary)
            setSnapshot(null)
          }
          return
        }

        const response = await api.getPublicOperationsSnapshot()
        if (!cancelled) {
          setSnapshot(response.snapshot)
          setOwnerSummary(null)
        }
      } catch {
        if (!cancelled) {
          setOwnerSummary(null)
          setSnapshot(null)
        }
      } finally {
        if (!cancelled) {
          setSnapshotLoading(false)
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [owner, ownerLoading, ownerToken])

  usePageSeo({
    title: 'AI Property Operations Platform for Modern Real Estate',
    description:
      'Prophives is a premium AI-powered property operations platform for real estate teams worldwide, with owner and tenant workspaces.',
    canonicalPath: ROUTES.home,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Prophives',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Premium AI-powered property operations platform for real estate teams worldwide, with owner and tenant workspaces.',
      offers: {
        '@type': 'Offer',
        category: 'SaaS',
      },
    },
  })

  return (
    <>
      {/* Hero */}
      <section
        className="min-h-[90vh] flex items-center px-8 lg:px-16 overflow-hidden relative"
        style={{ background: 'radial-gradient(circle at top right, #FFFAE2 0%, #FEFAEF 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FED609]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFFAE2] rounded-full blur-[80px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-none">
          {/* Left text */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="z-10 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-[#FED609]/15 text-[#1A1A1A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest font-['DM_Sans'] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FED609] inline-block" />
              AI-Powered Property Management
            </div>

            <h1 className="font-['Sora'] text-6xl md:text-8xl font-extrabold text-[#1A1A1A] leading-[1.05] tracking-tight mb-8">
              Manage Your Properties{' '}
              <span className="text-[#FED609] underline decoration-[#FED609]/20">Smarter</span>{' '}
              with AI
            </h1>
            <p className="font-['Manrope'] text-xl md:text-2xl text-[#6B7280] mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              The premium AI-powered property management platform designed for modern property
              managers everywhere. Automate everything from tenant communication to rent collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link
                to={ROUTES.ownerLogin}
                className="w-full sm:w-auto px-10 py-5 bg-[#FED609] text-[#1A1A1A] font-bold rounded-xl shadow-lg hover:bg-[#FFD70B] hover:shadow-2xl transition-all font-['DM_Sans'] text-xl text-center"
              >
                Get Started for Free
              </Link>
              <Link
                to={ROUTES.contact}
                className="w-full sm:w-auto px-10 py-5 border-2 border-[#FED609] text-[#1A1A1A] font-bold rounded-xl hover:bg-[#FED609]/5 transition-all font-['DM_Sans'] text-xl text-center"
              >
                Book a Demo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[#6B7280] font-['DM_Sans']">
              <span className="flex items-center gap-1.5">
                <span className="text-[#FED609]">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#FED609]">✓</span> 14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#FED609]">✓</span> Cancel anytime
              </span>
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative hidden lg:block h-[700px] w-full"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FED609]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFFAE2] rounded-full blur-[80px]" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[90%] h-[600px] rounded-3xl shadow-2xl overflow-hidden border-8 border-white bg-white transform translate-x-12">
              <img
                className="w-full h-full object-cover"
                alt="Modern luxury high-rise apartment building"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwGYvpeM85pwKFXm97S1TAATDSM4__Trygy2ql_yytBQ3PtwsoBr96--gxmJ1tNMfkJalxYzSIoxOG5TitKAI8TkAmCuh-HgVJ38g6tv4XlGNyPXwcGHVh7RvK5Ks-VxmOaevdxY3ls6cvgFdCLs-OYhCJoy5zWvuNQy-FHxiWD6PdkJIyIzAwaSdi3fyEPPzolc5u8TXThfIcwgElPPs8urnbO34Aq7_k4t9aCRyv_klF-0EOqdCSCXpXavAV4-aCl0F__5tH7H6N"
              />
            </div>
            <div className="absolute bottom-12 left-8 bg-white rounded-2xl shadow-xl p-4 border border-[#FED609]/20 flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-[#FED609] rounded-xl flex items-center justify-center">
                <Wallet className="h-5 w-5 text-[#1A1A1A]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-['DM_Sans']">Collection Rate</p>
                <p className="text-xl font-extrabold text-[#1A1A1A] font-['Sora']">98.5%</p>
              </div>
            </div>
            <div className="absolute top-12 left-8 bg-white rounded-2xl shadow-xl p-4 border border-[#FED609]/20 flex items-center gap-3 z-10">
              <div className="w-10 h-10 bg-[#FFFAE2] rounded-xl flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-[#FED609]" />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] font-['DM_Sans']">AI Tickets Resolved</p>
                <p className="text-lg font-extrabold text-[#1A1A1A] font-['Sora']">40+ hrs/wk</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Stats Card */}
      <section className="relative z-20 px-8">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full bg-white rounded-2xl shadow-xl p-10 md:p-16 border border-[#FED609]/10"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-[#FED609] font-bold font-['DM_Sans'] text-sm uppercase tracking-widest mb-2">
                Live Portfolio
              </span>
              <h3 className="font-['Sora'] text-4xl font-bold text-[#1A1A1A]">
                Real-time Performance Metrics
              </h3>
            </div>
            <div className="flex flex-wrap justify-center gap-16 md:gap-32">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#1A1A1A] font-['Sora'] mb-2">
                  {snapshotLoading
                    ? '420+'
                    : (snapshot?.open_tickets?.toLocaleString() ??
                      ownerSummary?.open_tickets?.toLocaleString() ??
                      '--')}
                </div>
                <div className="text-[#6B7280] font-['DM_Sans'] text-base">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#FED609] font-['Sora'] mb-2">
                  {snapshotLoading
                    ? '1.2k'
                    : (snapshot?.active_tenants?.toLocaleString() ??
                      ownerSummary?.active_tenants?.toLocaleString() ??
                      '--')}
                </div>
                <div className="text-[#6B7280] font-['DM_Sans'] text-base">Active Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold text-[#1A1A1A] font-['Sora'] mb-2">
                  {snapshotLoading
                    ? '98%'
                    : (snapshot?.due_this_week?.toLocaleString() ??
                      ownerSummary?.reminders_pending?.toLocaleString() ??
                      '--')}
                </div>
                <div className="text-[#6B7280] font-['DM_Sans'] text-base">Collection Rate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 bg-white w-full">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center mb-24"
        >
          <span className="inline-block text-sm font-bold uppercase tracking-widest text-[#FED609] font-['DM_Sans'] mb-4">
            Platform Features
          </span>
          <h2 className="font-['Sora'] text-5xl font-bold mb-6 text-[#1A1A1A]">
            Powerful Features for Modern Landlords
          </h2>
          <p className="text-[#6B7280] text-xl max-w-3xl mx-auto font-['Manrope']">
            Everything you need to scale your property portfolio without the administrative headache.
            Our tools are built for speed and efficiency.
          </p>
        </motion.div>
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            {
              icon: <BrainCircuit className="h-9 w-9 text-[#1A1A1A]" />,
              title: 'AI Automation',
              desc: 'Our neural engine handles complex scheduling, document processing, and tenant screening automatically, saving you hours of manual work every week.',
            },
            {
              icon: <MessageCircle className="h-9 w-9 text-[#1A1A1A]" />,
              title: 'WhatsApp & Telegram',
              desc: 'Connect with your tenants where they already are. Send automated reminders and receive maintenance requests via our intelligent bots.',
            },
            {
              icon: <Wallet className="h-9 w-9 text-[#1A1A1A]" />,
              title: 'Payment Tracking',
              desc: 'Automated bank reconciliation and instant rent alerts. Never chase a missed payment manually again with our integrated finance engine.',
            },
          ].map((f) => (
            <motion.div
              key={f.title}
              variants={revealVariants}
              className="p-12 rounded-3xl bg-[#FEFAEF] border border-transparent hover:border-[#FED609] transition-all group"
            >
              <div className="w-20 h-20 bg-[#FED609] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-[#FED609]/10">
                {f.icon}
              </div>
              <h4 className="font-['Sora'] text-2xl font-bold mb-4 text-[#1A1A1A]">{f.title}</h4>
              <p className="text-[#6B7280] text-lg font-['Manrope'] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center mt-12"
        >
          <Link
            to={ROUTES.features}
            className="inline-flex items-center gap-2 font-bold text-[#1A1A1A] hover:text-[#FED609] transition-colors font-['DM_Sans']"
          >
            Explore all features <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-8 bg-[#FFFAE2] w-full">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center mb-24"
        >
          <span className="inline-block text-sm font-bold uppercase tracking-widest text-[#FED609] font-['DM_Sans'] mb-4">
            Simple Onboarding
          </span>
          <h2 className="font-['Sora'] text-5xl font-bold mb-6 text-[#1A1A1A]">How It Works</h2>
          <p className="text-[#6B7280] text-xl max-w-3xl mx-auto font-['Manrope']">
            Get up and running in minutes, not months. We've simplified the entire onboarding
            process.
          </p>
        </motion.div>
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-20 relative"
        >
          {[
            {
              step: '1',
              title: 'Onboard Properties',
              desc: 'Bulk upload your portfolio details or sync with existing ERP systems in seconds with our smart importer.',
            },
            {
              step: '2',
              title: 'Connect Tenants',
              desc: 'Invite tenants via WhatsApp. They get a branded dashboard with no app download required to interact with you.',
            },
            {
              step: '3',
              title: 'Automate Everything',
              desc: 'Relax as Prophives AI handles billing, contracts, and routine communications for you in the background.',
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              variants={revealVariants}
              className="relative flex flex-col items-center text-center px-8"
            >
              <div className="w-20 h-20 bg-[#FED609] rounded-full flex items-center justify-center text-3xl font-black font-['Sora'] mb-8 z-10 shadow-xl shadow-[#FED609]/30 text-[#1A1A1A]">
                {item.step}
              </div>
              <h5 className="font-['Sora'] text-2xl font-bold mb-4 text-[#1A1A1A]">{item.title}</h5>
              <p className="text-[#6B7280] text-lg font-['Manrope']">{item.desc}</p>
            </motion.div>
          ))}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#FED609]/40" />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full bg-[#FED609] rounded-[3rem] p-16 md:p-28 text-center overflow-hidden relative"
        >
          <div className="relative z-10">
            <h2 className="font-['Sora'] text-4xl md:text-6xl font-black text-[#1A1A1A] mb-8">
              Ready to simplify property management?
            </h2>
            <p className="text-[#1A1A1A]/80 font-['Manrope'] text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Join hundreds of property owners who have saved over 40 hours a week using our AI
              platform. Experience the future of real estate.
            </p>
            <Link
              to={ROUTES.ownerLogin}
              className="inline-block px-12 py-6 bg-white text-[#1A1A1A] font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all font-['DM_Sans'] text-xl"
            >
              Start Your 14-Day Free Trial
            </Link>
          </div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/20 rounded-full blur-[100px]" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[80px]" />
        </motion.div>
      </section>
    </>
  )
}
