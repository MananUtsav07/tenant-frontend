import { motion } from 'framer-motion'
import { BrainCircuit, MessageCircle, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useOwnerAuth } from '../../hooks/useOwnerAuth'
import { usePageSeo } from '../../hooks/usePageSeo'
import { ROUTES } from '../../routes/constants'
import { api } from '../../services/api'
import { revealUp, useMotionVariants, viewportOnce } from '../../utils/motion'
import type { OwnerSummary, PublicOperationsSnapshot } from '../../types/api'

type SnapshotMode = 'public' | 'owner'

function FloatingStatsCard({
  mode,
  snapshot,
  ownerSummary,
  loading,
}: {
  mode: SnapshotMode
  snapshot: PublicOperationsSnapshot | null
  ownerSummary: OwnerSummary | null
  loading: boolean
}) {
  const renderCount = (value: number | null) =>
    value === null ? (loading ? '...' : '--') : value.toLocaleString('en-AE')

  const properties = renderCount(
    mode === 'owner' ? ownerSummary?.open_tickets ?? null : snapshot?.open_tickets ?? null,
  )
  const tenants = renderCount(
    mode === 'owner' ? ownerSummary?.active_tenants ?? null : snapshot?.active_tenants ?? null,
  )
  const actionCount = renderCount(
    mode === 'owner' ? ownerSummary?.reminders_pending ?? null : snapshot?.due_this_week ?? null,
  )

  const revealVariants = useMotionVariants(revealUp)

  return (
    <motion.section
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-5xl rounded-2xl border border-[#FED609]/20 bg-white p-8 shadow-xl md:p-12">
        <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FED609]">
              Live Portfolio
            </span>
            <h3 className="mt-1 text-2xl font-bold text-[#1A1A1A]">Real-time Metrics</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Powered by active portfolios on Prophives</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            <div className="text-center">
              <div className="mb-1 text-4xl font-extrabold text-[#1A1A1A]">
                {loading ? '420+' : properties}
              </div>
              <div className="text-sm text-[#6B7280]">Total Properties</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-extrabold text-[#FED609]">
                {loading ? '1.2k' : tenants}
              </div>
              <div className="text-sm text-[#6B7280]">Active Tenants</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-4xl font-extrabold text-[#1A1A1A]">
                {loading ? '98%' : actionCount}
              </div>
              <div className="text-sm text-[#6B7280]">Collection Rate</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export function LandingPage() {
  const { owner, token: ownerToken, loading: ownerLoading } = useOwnerAuth()

  const [snapshotMode, setSnapshotMode] = useState<SnapshotMode>('public')
  const [snapshot, setSnapshot] = useState<PublicOperationsSnapshot | null>(null)
  const [ownerSummary, setOwnerSummary] = useState<OwnerSummary | null>(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)

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
            setSnapshotMode('owner')
            setOwnerSummary(response.summary)
            setSnapshot(null)
          }
          return
        }

        const response = await api.getPublicOperationsSnapshot()
        if (!cancelled) {
          setSnapshotMode('public')
          setSnapshot(response.snapshot)
          setOwnerSummary(null)
        }
      } catch {
        if (!cancelled) {
          setSnapshotMode(owner && ownerToken ? 'owner' : 'public')
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
    title: 'AI Property Operations Platform for Dubai Real Estate',
    description:
      'Prophives is a premium AI-powered property operations platform for Dubai real estate teams, with owner and tenant workspaces.',
    canonicalPath: ROUTES.home,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Prophives',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Premium AI-powered property operations platform for Dubai real estate teams, with owner and tenant workspaces.',
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
        className="min-h-[870px] flex items-center px-6 overflow-hidden relative"
        style={{ background: 'radial-gradient(circle at top right, #FFFAE2 0%, #FEFAEF 100%)' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left text */}
          <div className="z-10 text-center lg:text-left">
            <h1 className="font-['Sora'] text-5xl md:text-7xl font-extrabold text-[#1A1A1A] leading-[1.1] tracking-tight mb-6">
              Manage Your Properties{' '}
              <span className="text-[#FED609] underline decoration-[#FED609]/20">Smarter</span>{' '}
              with AI
            </h1>
            <p className="font-['Manrope'] text-lg md:text-xl text-[#6B7280] mb-10 max-w-xl mx-auto lg:mx-0">
              The premium AI-powered property management platform designed for the modern Dubai real
              estate market. Automate everything from tenant communication to rent collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={ROUTES.ownerLogin}
                className="w-full sm:w-auto px-8 py-4 bg-[#FED609] text-[#1A1A1A] font-bold rounded-xl shadow-lg hover:bg-[#FFD70B] hover:shadow-xl transition-all font-['DM_Sans'] text-lg"
              >
                Get Started for Free
              </Link>
              <Link
                to={ROUTES.contact}
                className="w-full sm:w-auto px-8 py-4 border-2 border-[#FED609] text-[#1A1A1A] font-bold rounded-xl hover:bg-[#FED609]/5 transition-all font-['DM_Sans'] text-lg"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          {/* Right image - centered box NOT full bleed */}
          <div className="relative hidden lg:block h-[600px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <div className="absolute top-10 right-10 w-64 h-64 bg-[#FED609]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#FFFAE2] rounded-full blur-2xl" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-3xl shadow-2xl overflow-hidden border-8 border-white bg-white">
              <img
                className="w-full h-full object-cover"
                alt="Modern luxury high-rise apartment building in Dubai"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwGYvpeM85pwKFXm97S1TAATDSM4__Trygy2ql_yytBQ3PtwsoBr96--gxmJ1tNMfkJalxYzSIoxOG5TitKAI8TkAmCuh-HgVJ38g6tv4XlGNyPXwcGHVh7RvK5Ks-VxmOaevdxY3ls6cvgFdCLs-OYhCJoy5zWvuNQy-FHxiWD6PdkJIyIzAwaSdi3fyEPPzolc5u8TXThfIcwgElPPs8urnbO34Aq7_k4t9aCRyv_klF-0EOqdCSCXpXavAV4-aCl0F__5tH7H6N"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Card with Live Data */}
      <FloatingStatsCard
        mode={snapshotMode}
        snapshot={snapshot}
        ownerSummary={ownerSummary}
        loading={snapshotLoading}
      />

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-['Sora'] text-4xl font-bold mb-4">
              Powerful Features for Modern Landlords
            </h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto font-['Manrope']">
              Everything you need to scale your property portfolio without the administrative
              headache.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI Automation */}
            <div className="p-8 rounded-2xl bg-[#FEFAEF] border border-transparent hover:border-[#FED609] transition-all group">
              <div className="w-14 h-14 bg-[#FED609] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-7 w-7 text-[#1A1A1A]" />
              </div>
              <h4 className="font-['Sora'] text-xl font-bold mb-3">AI Automation</h4>
              <p className="text-[#6B7280] font-['Manrope'] leading-relaxed">
                Our neural engine handles complex scheduling, document processing, and tenant
                screening automatically.
              </p>
            </div>

            {/* WhatsApp & Telegram */}
            <div className="p-8 rounded-2xl bg-[#FEFAEF] border border-transparent hover:border-[#FED609] transition-all group">
              <div className="w-14 h-14 bg-[#FED609] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-7 w-7 text-[#1A1A1A]" />
              </div>
              <h4 className="font-['Sora'] text-xl font-bold mb-3">WhatsApp & Telegram</h4>
              <p className="text-[#6B7280] font-['Manrope'] leading-relaxed">
                Connect with your tenants where they already are. Send automated reminders and
                receive maintenance requests via bots.
              </p>
            </div>

            {/* Payment Tracking */}
            <div className="p-8 rounded-2xl bg-[#FEFAEF] border border-transparent hover:border-[#FED609] transition-all group">
              <div className="w-14 h-14 bg-[#FED609] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="h-7 w-7 text-[#1A1A1A]" />
              </div>
              <h4 className="font-['Sora'] text-xl font-bold mb-3">Payment Tracking</h4>
              <p className="text-[#6B7280] font-['Manrope'] leading-relaxed">
                Automated bank reconciliation and instant rent alerts. Never chase a missed payment
                manually again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-[#FFFAE2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-['Sora'] text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto font-['Manrope']">
              Get up and running in minutes, not months.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FED609] rounded-full flex items-center justify-center text-2xl font-black font-['Sora'] mb-6 z-10 shadow-lg shadow-[#FED609]/20">
                1
              </div>
              <h5 className="font-['Sora'] text-xl font-bold mb-3">Onboard Properties</h5>
              <p className="text-[#6B7280] font-['Manrope']">
                Bulk upload your portfolio details or sync with existing ERP systems in seconds.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FED609] rounded-full flex items-center justify-center text-2xl font-black font-['Sora'] mb-6 z-10 shadow-lg shadow-[#FED609]/20">
                2
              </div>
              <h5 className="font-['Sora'] text-xl font-bold mb-3">Connect Tenants</h5>
              <p className="text-[#6B7280] font-['Manrope']">
                Invite tenants via WhatsApp. They get a branded dashboard with no app download
                required.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#FED609] rounded-full flex items-center justify-center text-2xl font-black font-['Sora'] mb-6 z-10 shadow-lg shadow-[#FED609]/20">
                3
              </div>
              <h5 className="font-['Sora'] text-xl font-bold mb-3">Automate Everything</h5>
              <p className="text-[#6B7280] font-['Manrope']">
                Relax as Prophives AI handles billing, contracts, and routine communications for
                you.
              </p>
            </div>
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-[#FED609]/40" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-[#FED609] rounded-3xl p-12 md:p-20 text-center overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="font-['Sora'] text-3xl md:text-5xl font-black text-[#1A1A1A] mb-6">
              Ready to simplify property management?
            </h2>
            <p className="text-[#1A1A1A]/80 font-['Manrope'] text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join hundreds of property owners who have saved over 40 hours a week using our AI
              platform.
            </p>
            <Link
              to={ROUTES.ownerLogin}
              className="px-10 py-5 bg-white text-[#1A1A1A] font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all font-['DM_Sans'] text-lg inline-block"
            >
              Start Free Trial
            </Link>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>
      </section>
    </>
  )
}
